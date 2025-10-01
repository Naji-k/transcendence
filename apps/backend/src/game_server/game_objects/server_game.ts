import { Wall, Ball, Paddle, createSurroundingWalls, GameState, PlayerAction,
		createWalls, createBalls, createPlayers, createGoals,
		createGround, createPaddles, Player, Goal, jsonToVector2 } from '../index';
import { Engine, Scene, Vector3, HavokPlugin, NullEngine } from '@babylonjs/core';
import { EventEmitter } from 'stream';
import { GameStateManager } from '../game-state-manager';
import { performance } from 'node:perf_hooks';
import path  from 'path';
import fs from 'fs/promises';

const TICK_RATE = 60;
const FIXED_DT_MS = 1000 / TICK_RATE;
const FIXED_DT_SEC = FIXED_DT_MS / 1000;
const maxPlayerCount = 6;

export class ServerGame extends EventEmitter
{
	gameState: GameState;
	private engine: Engine;
	private scene: Scene;
	private havokInstance: any;
	private dimensions: [number, number];
	private gameIsRunning: boolean;
	
	private jsonMap: any;
	private players: Player[] = [];
	private paddles: Paddle[] = [];
	private balls: Ball[] = [];
	private walls: Wall[] = [];
	private goals: Goal[] = [];
	private playerCount= 0;
	private actionQueue: PlayerAction[] = [];
	private gameStateManager: GameStateManager;
	private nextTick: number = 0;

	constructor(havokInstance: any, gameState: GameState, gameStateManager: GameStateManager)
	{
		super();
		this.havokInstance = havokInstance;
		this.dimensions = [0, 0];
		this.gameIsRunning = true;
		this.engine = new NullEngine();
		this.scene = new Scene(this.engine);
		this.gameState = gameState;
		this.gameStateManager = gameStateManager; 
		console.log('Game_server started', gameState);
	}

	public enqueueAction(action: PlayerAction) 
	{
		this.actionQueue.push(action);
	}
	
	async loadMap(inputFile: string)
	{
		try {
			const fileText = await loadFileText(inputFile);
			const map = JSON.parse(fileText);
			if (!map.dimensions || !map.balls || !map.goals)
			{
				throw new Error('Invalid map format');
			}
			await this.createScene(map);
			this.initGameState();
			this.jsonMap = map;
		} catch (error) {
			console.error('Error loading map:', error);
			throw error;	
		}
	}
	//Not agree with this function name, 
	private initGameState()
	{
		if (this.players.length < 2)
		{
			throw new Error('Map must have at least 2 players.');
		}
		if (this.players.length > maxPlayerCount)
		{
			throw new Error(`Map cannot have more than ${maxPlayerCount} players.`);
		}
		
		const state = this.gameState;
		for (let i = 0; i < this.players.length; i++)
		{
			state.players[i].position = this.paddles[i].getPosition();
		}
		for (let j = 0; j < this.balls.length; j++)
		{
			state.balls.push(this.balls[j].getPosition());
		}
		state.lastUpdate = Date.now();
	}

	private async createScene(map: any)
	{
		const scene = this.scene;
		const havokPlugin = new HavokPlugin(true, this.havokInstance);
		
		scene.enablePhysics(new Vector3(0, -10, 0), havokPlugin);
		
		this.dimensions = jsonToVector2(map.dimensions);
		createGround(scene, this.dimensions);
		createBalls(scene, this.balls, map);
		createSurroundingWalls(scene, this.walls, this.dimensions);
		createWalls(scene, this.walls, map.walls);
		createGoals(scene, this.goals, map);
		createPaddles(scene, this.paddles, map.goals);
		createPlayers(this.players, this.goals, this.paddles);

		this.scene = scene;
		this.playerCount = this.players.length;
	}

	private async startGame()
	{
		console.log(`Starting game ${this.gameState.matchId} on server`);
		this.gameIsRunning = true;
		this.nextTick = performance.now();
		await this.gameLoop();
	}

	private gameFinished()
	{
		//TODO: need to set game state to finished
		this.gameIsRunning = false;
		console.log('Game finished');
	}

	run()
	{
		console.log('STARTING GAME - waiting for players');

		/*	sends out initial values, then waits for all players to confirm they're ready and starts the game	*/

		this.waitForPlayers();
	}

	private updateGameState()
	{		
		for (let i = 0; i < this.players.length; i++)
		{
			this.gameState.players[i].position = this.paddles[i].getPosition();
			this.gameState.players[i].lives = this.players[i].getLives();
			this.gameState.players[i].isAlive = this.players[i].isAlive();
		}
		this.gameState.balls = this.balls.map(ball => { return ball.getPosition(); });
		this.gameState.lastUpdate = performance.now();
		this.gameStateManager.notifySubs(this.gameState.matchId, this.gameState);
	}

	private waitForPlayers()
	{
		const timeoutTimeStamp = performance.now() + 10000;

		while (performance.now() < timeoutTimeStamp)
		{
			this.updateGameState();
			if (this.actionQueue.length > 0)
			{
				const action = this.actionQueue.shift()!;
				const player = this.gameState.players.find(pl => pl.id === action.playerId);
				if (player != null)
				{
					if (action.action == 'ready')
					{
						player.isReady = true;
						console.log(`Player ${action.playerId} is ready.`);
						if (this.gameState.players.every(p => p.isReady))
						{
							console.log('All players ready. Starting game...');
							this.gameState.status = 'in_progress';
							this.updateGameState();
							// Give clients time to show countdown
							setTimeout(() =>
							{
								this.startGame(); // Now start the physics loop
							}, 2100);
						}
					}
				}
			}
			setTimeout(() => {}, 100);
		}
		/*	connecting took over 10 seconds */

		if (this.gameState.status != 'in_progress')
		{
			console.log('Not all players ready in time. Ending game.');
			this.gameState.status = 'finished';
			this.gameStateManager.notifySubs(this.gameState.matchId, this.gameState);
			this.dispose();
		}
	}

	private processPlayerActions()
	{
		const action = this.actionQueue.shift()!;
		const paddleIndex = this.gameState.players.findIndex(p => p.id == action.playerId);
		if (paddleIndex >= 0)
		{
			let direction = 0;
			switch (action.action)
			{
				case '1': direction = 1; break;
				case '-1': direction = -1; break;
				case '0': direction = 0; break;
			}
			this.paddles[paddleIndex].update(direction, this.walls);
		}
	}

	private updateBallsAndGoals()
	{
		let scored = false;

		for (let i = 0; i < this.balls.length; i++)
		{
			for (let j = 0; j < this.goals.length; j++)
			{
				if (this.goals[j].score(this.balls[i]) == true)
				{
					this.players[j].loseLife();
					if (this.players[j].isAlive() == false)
					{
						this.playerCount--;
					}
					if (this.playerCount == 1)
					{
						this.gameFinished();
						return;
					}
					this.balls[i].destroy();
					this.balls.splice(i, 1);
					i--;
					scored = true;
					break;
				}
			}
			if (scored == false)
			{
				this.balls[i].update(this.paddles, this.walls);
			}
			if (this.balls.length == 0)
			{
				for (let j = 0; j < this.players.length; j++)
				{
					this.paddles[j].reset();
				}
				createBalls(this.scene, this.balls, this.jsonMap);
			}
		}
	}

	private async gameLoop()
	{
		const physicsEngine = this.scene.getPhysicsEngine();

		if (physicsEngine == null)
		{
			console.error('NO PHYSICS ENGINE!');
			return;
		}

		while (this.gameIsRunning == true)
		{
			this.processPlayerActions();
			physicsEngine._step(FIXED_DT_SEC);
			this.updateBallsAndGoals();
			this.updateGameState();

			/*	Sleep the remainder of the 16.67ms frametick	*/
			setTimeout(() => {}, Math.max(1, this.nextTick - performance.now()));
			this.nextTick += FIXED_DT_MS;
		}
	}

	dispose()
	{
		this.engine.stopRenderLoop();
		this.scene.dispose();
		this.engine.dispose();
		this.havokInstance = null;
		this.players = [];
		this.paddles = [];
		this.balls = [];
		this.walls = [];
		this.goals = [];
		this.gameIsRunning = false;
		console.log('Game data deleted.');
	}
}

export async function loadFileText(filePath: string): Promise<string> {
	try {
	const absPath = path.resolve(__dirname, filePath);
	return await fs.readFile(absPath, 'utf-8');
	} catch (err: any) {
	console.error(`Failed to load file: ${filePath}`, err);
	throw new Error(`Map file not found or unreadable: ${filePath}`);
	}
}

/*	Destroys the resources associated with the game	*/

export async function destroyGame(game: ServerGame)
{
	game.dispose();
}
