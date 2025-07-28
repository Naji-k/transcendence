import { Wall, Ball, Paddle, createWalls, createPaddles, createBalls, createGoals, createPlayers, createGround, Player, Goal } from '../index';
import { Engine, Scene, FreeCamera, PointLight, Vector3, Color3, MeshBuilder, StandardMaterial,
		HemisphericLight, HavokPlugin, TAARenderingPipeline, PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";

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
	private playerCount: number;
	private gameShouldRun: boolean;

	private	gameCanvas: HTMLCanvasElement;
	private keys: Record<string, boolean> = {};

	constructor(havokInstance: any, gameCanvas: HTMLCanvasElement)
	{
		this.gameCanvas = gameCanvas;
		this.havokInstance = havokInstance;
		this.dimensions = [0, 0];
		this.playerCount = 0;
		this.gameShouldRun = true;

		this.engine = new Engine(gameCanvas, true, {antialias: true});
	}

	setKeyInfo(keys: Record<string, boolean>)
	{
		this.keys = keys;
	}

	keyEvents()
	{
		// placeholder for key events

		if (this.keys['ArrowUp'] == true)
		{
			this.paddles[0].update(-1, true);
		}
		else if (this.keys['ArrowDown'] == true)
		{
			this.paddles[0].update(1, true);
		}
		else
		{
			this.paddles[0].update(1, false);
		}
		if (this.keys['w'] == true)
		{
			this.paddles[1].update(-1, true);
		}
		else if (this.keys['s'] == true)
		{
			this.paddles[1].update(1, true);
		}
		else
		{
			this.paddles[1].update(1, false);
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
		this.playerCount = parseInt(playersMatch[1]);

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
		const fileText = await(loadFileText('public/maps/' + map));
		const grid = this.parseMapFile(fileText);

		this.scene = this.createScene(this.engine, this.havokInstance, grid);
	}

	createScene(engine: Engine, havokInstance: any, grid: string[][]): Scene
	{
		const scene = new Scene(engine);
		const havokPlugin = new HavokPlugin(true, havokInstance);
		scene.enablePhysics(new Vector3(0, -10, 0), havokPlugin);

		const camera = new FreeCamera("camera1", new Vector3(0, 30, 5), scene);
		camera.setTarget(Vector3.Zero());
		camera.attachControl(this.gameCanvas, true);
		const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
		hemiLight.intensity = 0.6;
		const light2 = new PointLight("pointLight", camera.position, scene);
		light2.intensity = 0.8;

		createGround(scene, this.dimensions);
		createWalls(scene, this.walls, this.dimensions, grid);
		createPaddles(scene, this.paddles);
		createBalls(scene, this.balls);
		createGoals(scene, this.goals);
		createPlayers(scene, this.players);

		return scene;
	}

	pauseGame()
	{
		this.gameShouldRun = false;
		this.engine.stopRenderLoop();
	}

	resumeGame()
	{
		this.gameShouldRun = true;
		this.engine.runRenderLoop(this.gameLoop.bind(this));
	}

	run()
	{
		this.pauseGame();
		this.showCountdown(this.scene, () =>
		{
			this.resumeGame();
		});
	}
	
	showCountdown(scene: Scene, onFinish: () => void)
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
				setTimeout(next, 1000);
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

	gameLoop()
	{
		if (this.gameShouldRun == true)
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
						if (this.players[j].isAlive() == false)
						{
							this.players[j].eliminatePlayer();
							if (this.players.length == 1)
							{
								this.pauseGame();
								alert("Player " + this.players[0].ID + " wins!");
								return;
							}
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

