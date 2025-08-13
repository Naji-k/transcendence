import { Wall, Ball, Paddle, createWalls, createBalls,
		createPlayers, createGround, Player, Goal, createScoreboard, GameMenu, ColorMap, Colors } from '../../lib/index';
import { CreateStreamingSoundAsync, CreateAudioEngineAsync, StreamingSound,
		Engine, Scene, FreeCamera, Color3, Vector3, HemisphericLight,
		HavokPlugin, StandardMaterial, Layer } from '@babylonjs/core';
import { TextBlock, AdvancedDynamicTexture } from '@babylonjs/gui';

const maxPlayerCount = 6;

export class Game
{
	private engine: Engine;
	private scene: Scene;
	private havokInstance: any;
	private dimensions: [number, number];
	private gameIsRunning: boolean;
	private	gameCanvas: HTMLCanvasElement;
	
	private keys: Record<string, boolean> = {};
	private scoreboard: TextBlock[] = [];
	private players: Player[] = [];	
	private paddles: Paddle[] = [];
	private balls: Ball[] = [];
	private walls: Wall[] = [];
	private goals: Goal[] = [];
	private playerCount: number = 0;

	private static wallhitSound: StreamingSound;
	private static paddlehitSound: StreamingSound;
	private static playerOutSound: StreamingSound;
	private static victorySound: StreamingSound;

	constructor(havokInstance: any)
	{
		window.addEventListener('keydown', (event) => {this.keys[event.key] = true;});
		window.addEventListener('keyup', (event) => {this.keys[event.key] = false;});			
		
		this.gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.havokInstance = havokInstance;
		this.dimensions = [0, 0];
		this.gameIsRunning = true;
		this.engine = new Engine(this.gameCanvas, true, {antialias: true});
		this.scene = new Scene(this.engine);
	}

	keyEvents()
	{
		for (let i = 0; i < this.players.length; i++)
		{
			this.players[i].checkForActions(this.keys, this.walls);
		}
	}

	private parseMapFile(mapText: string): string[][]
	{
		const lines = mapText.split('\n');
		const sizeMatch = lines[0].match(/^size:\s*(\d+)x(\d+)$/);
		const playersMatch = lines[1].match(/^players:\s*(\d+)$/);
		
		if (!sizeMatch || !playersMatch || lines[2] != '')
		{
			throw new Error('Lines 1-3 format: size: <rows>x<columns>, players: <number>, empty line');
		}
		this.dimensions = [parseInt(sizeMatch[1]), parseInt(sizeMatch[2])];
		this.playerCount = parseInt(playersMatch[1]);

		if (this.playerCount < 1 || this.playerCount > maxPlayerCount)
		{
			throw new Error(`Invalid player count: ${this.playerCount}. Must be between 1 and ${maxPlayerCount}.`);
		}

		lines.splice(0, 3);
		if (lines.length != this.dimensions[0] ||
			lines.some(line => line.length != this.dimensions[1]))
		{
			console.error(`Map size: ${lines.length}x${lines[0].length}`);
			throw new Error(`Map size does not match expected size: ${this.dimensions[0]}x${this.dimensions[1]}`);
		}
		return lines.map(lines => lines.split(''));
	}

	async loadMap(map: string)
	{
		try
		{
			const audioEngine = await CreateAudioEngineAsync();
			audioEngine.volume = 0.5;
			// const frogs = await CreateStreamingSoundAsync('music', './public/sounds/frogs.mp3');
			Game.wallhitSound = await CreateStreamingSoundAsync('wallhit', './public/sounds/wallhit.wav');
			Game.paddlehitSound = await CreateStreamingSoundAsync('paddlehit', './public/sounds/paddlehit.wav');
			Game.playerOutSound = await CreateStreamingSoundAsync('playerout', './public/sounds/playerout.wav');
			Game.victorySound = await CreateStreamingSoundAsync('victory', './public/sounds/victory.wav');
			Game.paddlehitSound.maxInstances = 1;
			Game.wallhitSound.maxInstances = 1;
	
			await audioEngine.unlockAsync();
			// frogs.play();
		}
		catch (error)
		{
			console.error('Error loading audio:', error);
		}
		const fileText = await(loadFileText('public/maps/' + map));
		const grid = this.parseMapFile(fileText);
		const eliminationMat = new StandardMaterial('eliminatedMat', this.scene);

		eliminationMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
		eliminationMat.alpha = 0.5;
		eliminationMat.maxSimultaneousLights = 16;

		Paddle.setEliminatedMaterial(eliminationMat);
		Goal.setEliminatedMaterial(eliminationMat);
		Goal.createGoalPostMaterial(this.scene);
		this.createScene(grid);
	}

	private victory()
	{
		this.pauseGame();
		Game.playVictorySound();
		
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

	private createScene(grid: string[][])
	{
		const scene = this.scene;
		const havokPlugin = new HavokPlugin(true, this.havokInstance);
		const camera = new FreeCamera('camera1', new Vector3(0, 30, 5), scene);
		
		scene.enablePhysics(new Vector3(0, -10, 0), havokPlugin);
		camera.setTarget(Vector3.Zero());
		// camera.attachControl(this.gameCanvas, true);
		const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 10, 0), scene);
		hemiLight.intensity = 0.6;

		createGround(scene, this.dimensions);
		createWalls(scene, this.walls, this.dimensions, grid);
		createBalls(scene, this.balls, 1);
		createPlayers(this.players, this.goals, this.paddles, this.playerCount, grid, scene);
		createScoreboard(this.scoreboard, this.players);
		
		const background = new Layer('background', './public/backgrounds/volcano.jpg', scene, true);
		background.isBackground = true;
		this.scene = scene;
	}

	private pauseGame()
	{
		this.gameIsRunning = false;
		this.engine.stopRenderLoop();
	}

	private resumeGame()
	{
		this.gameIsRunning = true;
		this.engine.runRenderLoop(this.gameLoop.bind(this));
	}

	toggleGamePause()
	{
		if (this.gameIsRunning == true)
		{
			this.pauseGame();
		}
		else
		{
			this.resumeGame();
		}
	}

	run()
	{
		this.pauseGame();
		this.showCountdown(this.scene, () =>
		{
			new GameMenu(this.scene, this);
			this.resumeGame();
		});
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

	private gameLoop()
	{
		let scored = false;

		if (this.gameIsRunning == true)
		{
			this.keyEvents();
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
						this.scoreboard[j].text = `Player ${this.players[j].ID}: ${this.players[j].getLives()}`;
						if (this.playerCount == 1)
						{
							this.victory();
							return;
						}
						Game.playerOutSound.play();
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
					createBalls(this.scene, this.balls, 1);
				}
				scored = false;
			}
		}
		this.scene.render();
	}

	dispose()
	{
		this.engine.stopRenderLoop();
		this.scene.dispose();
		this.engine.dispose();
		this.havokInstance = null;
		this.gameCanvas = null;
		this.players = [];
		this.paddles = [];
		this.balls = [];
		this.walls = [];
		this.goals = [];
		this.scoreboard = [];
		Game.wallhitSound.dispose();
		Game.paddlehitSound.dispose();
		Game.playerOutSound.dispose();
		Game.victorySound.dispose();
		this.gameIsRunning = false;
		console.log('Game disposed successfully.');
	}

	getPaddles(): Paddle[] {return this.paddles;}
	getBalls(): Ball[] {return this.balls;}
	getWalls(): Wall[] {return this.walls;}
	getGoals(): Goal[] {return this.goals;}
	getPlayers(): Player[] {return this.players;}
	getScene(): Scene {return this.scene;}
	gameRunning(): boolean {return this.gameIsRunning;}

	static playBallHitSound() { Game.paddlehitSound.play(); }
	static playPaddleHitSound() { Game.paddlehitSound.play(); }
	static playPlayerOutSound() { Game.playerOutSound.play(); }
	static playVictorySound() { Game.victorySound.play(); }
	static playWallHitSound() { Game.wallhitSound.play(); }
}

async function loadFileText(filePath: string): Promise<string>
{
	const response = await fetch(filePath);

	if (response.ok == false)
	{
		throw new Error(`Failed to load file: ${filePath}`);
	}
	return response.text();
}

/*	Destroys the resources associated with the game	*/

export async function destroyGame(game: Game)
{
	game.dispose();
	console.log('Game destroyed successfully.');
}