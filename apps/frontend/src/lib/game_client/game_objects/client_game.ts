import { Wall, Ball, Paddle, createSurroundingWalls,
		createWalls, createBalls, createPlayers, createGoals,
		createGround, createPaddles, createScoreboard, Player, Goal, jsonToVector2,
		Colors } from '../../index';
import { CreateStreamingSoundAsync, CreateAudioEngineAsync, StreamingSound,
		Engine, Scene, FreeCamera, Color3, Vector3, HemisphericLight,
		HavokPlugin, StandardMaterial, Layer, PhysicsViewer } from '@babylonjs/core';
import { TextBlock, AdvancedDynamicTexture } from '@babylonjs/gui';
import type { AudioEngineV2 } from '@babylonjs/core';
import type { GameState } from '../../index';
import { trpc } from '../../trpc';

export class ClientGame
{
	private engine: Engine;
	private scene: Scene;
	private dimensions: [number, number];
	private	gameCanvas: HTMLCanvasElement;

	private scoreboard: TextBlock[] = [];
	private players: Player[] = [];	
	private paddles: Paddle[] = [];
	private balls: Ball[] = [];
	private walls: Wall[] = [];
	private goals: Goal[] = [];
	private gameState: GameState | null = null;

	private static wallhitSound: StreamingSound;
	private static paddlehitSound: StreamingSound;
	private static playerOutSound: StreamingSound;
	private static victorySound: StreamingSound;
	private static audioEngine: AudioEngineV2;
	private static music: StreamingSound;

	constructor(gameState: GameState)
	{
		this.gameState = gameState;
		this.gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		if (!this.gameCanvas)
		{
			console.error('Game canvas not found');
		}
		this.dimensions = [0, 0];
		this.engine = new Engine(this.gameCanvas, true, {antialias: true});
		this.scene = new Scene(this.engine);
		console.log('Game_client started');
	}

	private async loadSounds()
	{
		try
		{
			ClientGame.audioEngine = await CreateAudioEngineAsync();
			ClientGame.audioEngine.volume = 0.5;
			ClientGame.music = await CreateStreamingSoundAsync('music', 'sounds/frogs.mp3');
			ClientGame.wallhitSound = await CreateStreamingSoundAsync('wallhit', 'sounds/wallhit.wav');
			ClientGame.paddlehitSound = await CreateStreamingSoundAsync('paddlehit', 'sounds/paddlehit.wav');
			ClientGame.playerOutSound = await CreateStreamingSoundAsync('playerout', 'sounds/playerout.wav');
			ClientGame.victorySound = await CreateStreamingSoundAsync('victory', 'sounds/victory.wav');
			ClientGame.paddlehitSound.maxInstances = 1;
			ClientGame.wallhitSound.maxInstances = 1;

			ClientGame.paddlehitSound.setVolume(0.6);
			ClientGame.wallhitSound.setVolume(0.6);
			ClientGame.playerOutSound.setVolume(0.6);
			ClientGame.music.play();

			await ClientGame.audioEngine.unlockAsync();
		}
		catch (error)
		{
			console.error('Error loading audio:', error);
		}
	}

	async loadMap(inputFile: string)
	{
		let fileText = '';
		try {
			fileText = await loadFileText(inputFile);
			
		} catch (error) {
			console.error('Error loading map:', error);
			throw error;
			
		}		
		const map = JSON.parse(fileText);
		
		if (!map.dimensions || !map.balls || !map.goals)
		{
			throw new Error('Invalid map format');
		}
		this.createScene(map);
		const eliminationMat = new StandardMaterial('eliminatedMat', this.scene);
		
		eliminationMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
		eliminationMat.alpha = 0.5;
		eliminationMat.maxSimultaneousLights = 16;
		
		Paddle.setEliminatedMaterial(eliminationMat);
		Goal.setEliminatedMaterial(eliminationMat);
		Goal.createGoalPostMaterial(this.scene);
		await this.loadSounds();
	}

	private createScene(map: any)
	{
		const scene = this.scene;
		
		const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 10, 0), scene);
		hemiLight.intensity = 0.6;

		this.dimensions = jsonToVector2(map.dimensions);
		const cameraHeight = Math.max(this.dimensions[0], this.dimensions[1]) + 10;
		const camera = new FreeCamera('camera1', new Vector3(0, cameraHeight, 0), scene);
		camera.setTarget(Vector3.Zero());
		// camera.attachControl(this.gameCanvas, true);
		createGround(scene, this.dimensions);
		createBalls(scene, this.balls, map);
		createSurroundingWalls(scene, this.walls, this.dimensions);
		createWalls(scene, this.walls, map.walls);
		createGoals(scene, this.goals, map);
		createPaddles(scene, this.paddles, map.goals);
		createPlayers(this.players, this.goals, this.paddles);
		createScoreboard(this.scoreboard, this.players);
		
		const background = new Layer('background', 'backgrounds/volcano.jpg', scene, true);
		background.isBackground = true;
		this.scene = scene;
	}

	private victory()
	{
		this.pauseGame();
		ClientGame.playVictorySound();
		
		const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('victoryUI', true, this.scene);
		const victoryText = new TextBlock();
		
		for (let i = 0; i < this.players.length; i++)
		{
			if (this.players[i].isAlive() == true)
			{
				victoryText.color = Colors[i].name;
				victoryText.text = `${this.players[i].getName()} wins!`;
				break;
			}
		}
		victoryText.fontSize = 50;
		victoryText.outlineWidth = 10;
		victoryText.outlineColor = 'black';
		advancedTexture.addControl(victoryText);
		this.scene.render();
	}

	private pauseGame()
	{
		this.engine.stopRenderLoop();
	}

	private async waitForStart()
	{
		const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('waitingUI', true, this.scene);
		const waitingText = new TextBlock();

		console.log('Waiting for game to start...');
		waitingText.text = "Waiting for players...";
		waitingText.color = "white";
		waitingText.fontSize = 60;
		waitingText.outlineWidth = 5;
		waitingText.outlineColor = "black";
		waitingText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
		waitingText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
		advancedTexture.addControl(waitingText);

		this.engine.runRenderLoop(this.gameLoop.bind(this));
		while (true) 
		{
			if (this.gameState.status == 'in_progress')
			{
				advancedTexture.removeControl(waitingText);
				advancedTexture.dispose();
				this.showCountdown(this.scene, () =>
				{
					console.log('Starting render loop NOW');
				});
				break; 
			}
			await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
		}
	}

	run()
	{
		this.scene.render();
		// send confirmation to server that client is ready to roll
		trpc.game.sentPlayerAction.mutate({matchId: this.gameState.matchId, action: 'ready'});
		console.log('Player is ready, waiting for other players...');

		this.waitForStart();
	}

	private showCountdown(scene: Scene, onFinish: () => void)
	{
		const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene);
		const countdownText = new TextBlock();
		countdownText.color = 'red';
		countdownText.fontSize = 180;
		countdownText.outlineWidth = 5;
		countdownText.outlineColor = 'black';
		advancedTexture.addControl(countdownText);

		const sequence = ['3', '2', '1', 'START'];
		let step = 0;
		
		function next()
		{
			scene.render();
			if (step < sequence.length)
			{
				countdownText.text = sequence[step];
				step++;
				setTimeout(next, 500);
			}
			else
			{
				advancedTexture.removeControl(countdownText);
				advancedTexture.dispose();
				onFinish();
			}
		}
		next();
	}

	public updateFromServer(gameState: GameState)
	{
		this.gameState = gameState;
	}


	private updateBalls()
	{		
		if (!this.gameState) {
			console.warn('⚠️ No gameState!');
			return;
		}
		
		if (!this.gameState.balls) {
			console.warn('⚠️ No balls in gameState!');
			return;
		}
		
		const ballUpdates = this.gameState.balls;
	
		for (let i = 0; i < ballUpdates.length; i++)
		{
			this.balls[i].update(ballUpdates[i].x, ballUpdates[i].z);
		}
	}

	private updatePaddles()
	{
		const playerUpdates = this.gameState.players;
		
		for (let i = 0; i < playerUpdates.length; i++)
		{
			this.paddles[i].update(playerUpdates[i].position.x, playerUpdates[i].position.z);
		}
	}

	private updateScoreboard()
	{
		if (!this.gameState) {
			return;
		}
		const serverPlayers = this.gameState.players;

		for (let i = 0; i < this.players.length; i++)
		{
			if (!serverPlayers[i]) continue;
			
			if (this.players[i].getLives() != serverPlayers[i].lives)
			{
				this.players[i].setLive(serverPlayers[i].lives);
				this.scoreboard[i].text = `Player ${this.players[i].ID}: ${serverPlayers[i].lives}`;
			}
		}
	}

	private gameLoop()
	{
		this.updateBalls();
		this.updatePaddles();
		this.updateScoreboard();
		this.scene.render();
	}

	dispose()
	{
		this.engine.stopRenderLoop();
		this.scene.dispose();
		this.engine.dispose();
		this.gameCanvas = null;
		this.players = [];
		this.paddles = [];
		this.balls = [];
		this.walls = [];
		this.goals = [];
		this.scoreboard = [];
		ClientGame.audioEngine.dispose();
		console.log('Game data deleted.');
	}

	static playBallHitSound() { ClientGame.paddlehitSound.play(); }
	static playPaddleHitSound() { ClientGame.paddlehitSound.play(); }
	static playPlayerOutSound() { ClientGame.playerOutSound.play(); }
	static playVictorySound() { ClientGame.victorySound.play(); }
	static playWallHitSound() { ClientGame.wallhitSound.play(); }
}

async function loadFileText(filePath: string): Promise<string>
{
	console.log(`Loading file: ${filePath}`);
	const response = await fetch(filePath);

	if (response.ok == false)
	{
		throw new Error(`Failed to load file: ${filePath}`);
	}
	return response.text();
}

/*	Destroys the resources associated with the game	*/

export async function destroyGame(game: ClientGame)
{
	game.dispose();
}