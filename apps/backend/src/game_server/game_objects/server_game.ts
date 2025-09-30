import { Wall, Ball, Paddle, createSurroundingWalls, GameState, PlayerAction,
		createWalls, createBalls, createPlayers, createGoals,
		createGround, createPaddles, Player, Goal, jsonToVector2 } from '../index';
import { Engine, Scene, Vector3, HavokPlugin, NullEngine } from '@babylonjs/core';
import { EventEmitter } from 'stream';
import { GameStateManager } from '../game-state-manager';
import path  from 'path';
import fs from 'fs/promises';

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
	private gameLoopInterval: NodeJS.Timeout | null = null;

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
			this.createScene(map);
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

	private createScene(map: any)
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

	private startGame()
	{
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
		}
	
		this.gameIsRunning = true;
		// NullEngine is a headless engine designed for server-side rendering. It doesn't automatically run render loops like a regular engine!
		// this.engine.runRenderLoop(this.gameLoop.bind(this));
		this.gameLoopInterval = setInterval(() => {
			this.gameLoop();
		}, 16); // ~60 FPS (16ms per frame)
	}

	private gameFinished()
	{
		//TODO: need to set game state to finished
		this.gameIsRunning = false;
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}
		console.log('Game finished');
	}

	run()
	{
		console.log('STARTING GAME - waiting for players');
		/*	sets a timeout while clients display "3, 2, 1, START" + 100ms before commencing game	*/
		this.gameLoopInterval = setInterval(() => {
			this.processActions();
			this.updateGameState();
		}, 100); // Update game state every 100ms while waiting
	}

	private updateGameState()
	{		
		for (let i = 0; i < this.players.length; i++)
		{
			const p = this.paddles[i].getPosition();

			this.gameState.players[i].position = { x: p.x, z: p.z };
			this.gameState.players[i].lives = this.players[i].getLives?.() ?? this.gameState.players[i].lives;
			this.gameState.players[i].isAlive = this.players[i].isAlive?.() ?? false;
		}
		this.gameState.balls = this.balls.map(ball => {
			const pos = ball.getPosition();
			return { x: pos.x, z: pos.z };
		});
		this.gameState.lastUpdate = Date.now();
		this.gameStateManager.notifySubs(this.gameState.matchId, this.gameState);
	}

	private processActions() {
		while (this.actionQueue.length) {
		  const action = this.actionQueue.shift()!;
		  const player = this.gameState.players.find(pl => pl.id === action.playerId);
		  if (player) {
			if (action.action === 'ready') {
			  player.isReady = true;
			  console.log(`Player ${action.playerId} is ready.`);
			  if (this.gameState.players.every(p => p.isReady)) {
				console.log('All players ready. Starting game...');
				this.gameState.status = 'in_progress'
				// Give clients time to show countdown
				setTimeout(() => {
					this.gameState.status = 'in_progress';
					this.startGame(); // Now start the physics loop
					}, 2100);
			  }
			} else {
			  const paddleIndex = this.gameState.players.findIndex(p => p.id === action.playerId);
			  if (paddleIndex >= 0) {
				let direction = 0;
				switch (action.action) {
				  case '1': direction = 1; break;
				  case '-1': direction = -1; break;
				  case '0': direction = 0; break;
				}
				if ([0,2,4].includes(paddleIndex)) {
					direction *= -1; // Invert direction for left-side paddles
				}
				this.paddles[paddleIndex].simpleMove(direction, this.walls);
			  }
			}
		  }
		}
	  }


	private gameLoop()
	{
		let scored = false;
		// Step physics engine manually (CRITICAL for NullEngine!)
		const physicsEngine = this.scene.getPhysicsEngine();
		if (physicsEngine) {
			physicsEngine._step(16 / 1000); // 16ms in seconds
		} else {
			console.error('NO PHYSICS ENGINE!');
		}	
		this.processActions();
		if (this.gameIsRunning == true)
		{
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
				scored = false;
			}
		}
		this.updateGameState();
	}

	dispose()
	{
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}
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
