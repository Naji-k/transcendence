import { Wall, Ball, Paddle, createWalls, createPaddles, createBalls,
		createGoals, createPlayers, createGround, Player, Goal, GameMenu } from '../index';
import { CreateStreamingSoundAsync, CreateAudioEngineAsync } from '@babylonjs/core';
import { Engine, Scene, FreeCamera, PointLight, Vector3, HemisphericLight, HavokPlugin } from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";

const maxPlayerCount = 6;

export class Game
{
	private engine: Engine;
	private scene: Scene;
	private havokInstance: any;
	private paddles: Paddle[] = [];
	private balls: Ball[] = [];
	private walls: Wall[] = [];
	private goals: Goal[] = [];
	private players: Player[] = [];

	private dimensions: [number, number];
	private gameIsRunning: boolean;

	private	gameCanvas: HTMLCanvasElement;
	private keys: Record<string, boolean> = {};

	constructor(havokInstance: any)
	{
		window.addEventListener('keydown', (event) => {this.keys[event.key] = true;});
		window.addEventListener('keyup', (event) => {this.keys[event.key] = false;});			
		
		this.gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.havokInstance = havokInstance;
		this.dimensions = [0, 0];
		this.gameIsRunning = true;
		this.engine = new Engine(this.gameCanvas, true, {antialias: true});
	}

	keyEvents()
	{			
		for (let i = 0; i < this.players.length; i++)
		{
			this.players[i].checkForActions(this.keys);
		}
	}

	private parseMapFile(mapText: string): string[][]
	{
		let lines = mapText.split('\n');
		const sizeMatch = lines[0].match(/^size:\s*(\d+)x(\d+)$/);
		const playersMatch = lines[1].match(/^players:\s*(\d+)$/);
		
		if (!sizeMatch || !playersMatch || lines[2] != '')
		{
			throw new Error("Lines 1-3 format: size: <rows>x<columns>, players: <number>, empty line");
		}
		this.dimensions = [parseInt(sizeMatch[1]), parseInt(sizeMatch[2])];
		Player.playerCount = parseInt(playersMatch[1]);

		if (Player.playerCount < 1 || Player.playerCount > maxPlayerCount)
		{
			throw new Error(`Invalid player count: ${Player.playerCount}. Must be between 1 and ${maxPlayerCount}.`);
		}

		lines.splice(0, 3);
		if (lines.length != this.dimensions[0] ||
			lines.some(line => line.length != this.dimensions[1]))
		{
			throw new Error(`Map size does not match expected size: ${this.dimensions[0]}x${this.dimensions[1]}`);
		}
		return lines.map(lines => lines.split(''));
	}

	async loadMap(map: string)
	{
		const audioEngine = await CreateAudioEngineAsync();
		audioEngine.volume = 0.5;
		const frogs = await CreateStreamingSoundAsync("music", "/sounds/frogs.mp3");
		await audioEngine.unlockAsync();
		frogs.play();

		const fileText = await(loadFileText('public/maps/' + map));
		const grid = this.parseMapFile(fileText);

		this.scene = this.createScene(this.engine, this.havokInstance, grid);
	}

	private createScene(engine: Engine, havokInstance: any, grid: string[][]): Scene
	{
		const scene = new Scene(engine);
		const havokPlugin = new HavokPlugin(true, havokInstance);
		scene.enablePhysics(new Vector3(0, -10, 0), havokPlugin);

		const camera = new FreeCamera("camera1", new Vector3(0, 30, 5), scene);
		camera.setTarget(Vector3.Zero());
		// camera.attachControl(this.gameCanvas, true);
		const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
		hemiLight.intensity = 0.2;

		createGround(scene, this.dimensions);
		createWalls(scene, this.walls, this.dimensions, grid);
		createPaddles(scene, this.paddles, grid);
		createBalls(scene, this.balls, 1);
		createGoals(scene, this.goals);
		createPlayers(this.players);

		return scene;
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
		const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
		const countdownText = new GUI.TextBlock();
		countdownText.color = "red";
		countdownText.fontSize = 180;
		countdownText.outlineWidth = 5;
		countdownText.outlineColor = "black";
		advancedTexture.addControl(countdownText);

		const sequence = ["3", "2", "1", "START"];
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
		if (this.gameIsRunning == true)
		{
			let scored = false;
			this.keyEvents();
			for (let i = 0; i < this.balls.length; i++)
			{
				for (let j = 0; j < this.goals.length; j++)
				{
					if (this.goals[j].score(this.balls[i]) == true)
					{
						this.players[j].loseLife();
						if (this.players.length == 1)
						{
							this.pauseGame();
							alert("Player " + this.players[0].ID + " wins!");
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
					this.balls[i].update(this.paddles);
				}
				else if (this.balls.length == 0)
				{
					for (let j = 0; j < this.players.length; j++)
					{
						this.paddles[j].reset();
						createBalls(this.scene, this.balls, 1);
					}
				}
				scored = false;
			}
		}
		this.scene.render();
	}

	getPaddles(): Paddle[] {return this.paddles;}
	getBalls(): Ball[] {return this.balls;}
	getWalls(): Wall[] {return this.walls;}
	getGoals(): Goal[] {return this.goals;}
	getPlayers(): Player[] {return this.players;}
	getScene(): Scene {return this.scene;}
	gameRunning(): boolean {return this.gameIsRunning;}
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

