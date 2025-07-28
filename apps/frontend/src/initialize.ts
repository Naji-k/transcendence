import { Wall, Ball, Paddle, Goal, Player, clr } from './index';
import { Scene, Vector3, Color3, StandardMaterial, MeshBuilder, PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core';
import { AdvancedDynamicTexture, Rectangle, TextBlock, Control, Button } from "@babylonjs/gui";


const ballDiameter = 0.5;

function getBlockSize(x: number, y: number, grid: string[][]): [number, number]
{
	const char = grid[x][y];
	let height = 1;
	let width = 1;

	grid[x][y] = '.';
	if (y + 1 < grid[x].length && grid[x][y + 1] == char)
	{
		while (y + width < grid[x].length && grid[x][y + width] == char)
		{
			grid[x][y + width] = '.';
			width++;
		}
	}
	if (x + 1 < grid.length && grid[x + 1][y] == char)
	{
		if (width != 1)
		{
			throw new Error(`Invalid grid: element at (${x}, ${y}) is part of a horizontal and vertical element.`);
		}
		while (x + height < grid.length && grid[x + height][y] == char)
		{
			grid[x + height][y] = '.';
			height++;
		}
	}
	return [height, width];
}

function	createSurroundingWalls(scene: Scene, walls: Wall[], dimensions: number[])
{
	const height = dimensions[0];
	const width = dimensions[1];
	const wallThickness = 0.5;
	const wallHeight = ballDiameter * 4;
	const wallOpacity = 0.3;
	const blackColor = Color3.Black();
	
	walls.push(
		new Wall(new Vector3(wallThickness, wallHeight, height + wallThickness * 2),
		new Vector3(-width / 2 - wallThickness / 2, wallHeight / 2, 0),
		blackColor,
		wallOpacity,
		scene)
	);
	
	walls.push(
		new Wall(new Vector3(wallThickness, wallHeight, height + wallThickness * 2),
		new Vector3(width / 2 + wallThickness / 2, wallHeight / 2, 0),
		blackColor,
		wallOpacity,
		scene)
	);
	
	walls.push(
		new Wall(new Vector3(width, wallHeight, wallThickness),
		new Vector3(0, wallHeight / 2, -height / 2 - wallThickness / 2),
		blackColor,
		wallOpacity,
		scene)
	);
	
	walls.push(
		new Wall(new Vector3(width, wallHeight, wallThickness),
		new Vector3(0, wallHeight / 2, height / 2 + wallThickness / 2),
		blackColor,
		wallOpacity,
		scene)
	);
}

export function createWalls(scene: Scene, walls: Wall[], dimensions: number[], grid: string[][])
{
	createSurroundingWalls(scene, walls, dimensions);

	const gridWidth = grid[0].length;
	const gridHeight = grid.length;
	
	for (let x = 0; x < grid.length; x++)
	{
		for (let y = 0; y < grid[x].length; y++)
		{
			if (grid[x][y] == 'W')
			{
				const [height, width] = getBlockSize(x, y, grid);
				const dimensions = new Vector3(width, ballDiameter * 2, height);
				const position = new Vector3(
					(y - gridWidth / 2 + width / 2),
					ballDiameter,
					(x - gridHeight / 2 + height / 2)
				);
				walls.push(new Wall(dimensions,	position, Color3.Black(), 1, scene));
			}
		}
	}
	Player.wallArray = walls;
}

export function createPaddles(scene: Scene, paddles: Paddle[], grid: string[][])
{
	let playerChar: string;
	const gridWidth = grid[0].length;
	const gridHeight = grid.length;

	for (let i = 1; i <= Player.playerCount; i++)
	{
		playerChar = i.toString();
		for (let x = 0; x < grid.length; x++)
		{
			for (let y = 0; y < grid[x].length; y++)
			{
				if (grid[x][y] == playerChar)
				{
					const [height, width] = getBlockSize(x, y, grid);
					const dimensions = new Vector3(width, ballDiameter * 2, height);
					const position = new Vector3(
						(y - gridWidth / 2 + width / 2),
						ballDiameter,
						(x - gridHeight / 2 + height / 2)
					);
					paddles.push(new Paddle(dimensions,	position, Paddle.paddleColors[i - 1], scene));
				}
			}
		}
	}
	Player.paddleArray = paddles;
}

export function createBalls(scene: Scene, balls: Ball[], amount: number)
{
	for (let i = 0; i < amount; i++)
	{
		balls.push(new Ball(new Vector3(0, ballDiameter, 0), Paddle.paddleColors[clr.Green], 0.5, scene));
	}
	Player.ballArray = balls;
}

export function createGoals(scene: Scene, goals: Goal[])
{
	const goalWidth = 10;
	const goalHeight = 5;

	goals.push(new Goal(
		new Vector3(-14, goalHeight / 2, -goalWidth / 2),
		new Vector3(-14, goalHeight / 2, goalWidth / 2),
		scene
	));

	goals.push(new Goal(
		new Vector3(14, goalHeight / 2, -goalWidth / 2),
		new Vector3(14, goalHeight / 2, goalWidth / 2),
		scene
	));

	Player.goalArray = goals;
}

export function createPlayers(players: Player[])
{
	for (let i = 0; i < Player.playerCount; i++)
	{
		const player = new Player(`Player ${i + 1}`, i, Player.goalArray[i], Player.paddleArray[i]);
		switch (i)
		{
			case 0: player.setControls('ArrowUp', 'ArrowDown'); break;
			case 1: player.setControls('w', 's'); break;
			case 2: player.setControls('i', 'k'); break;
			case 3: player.setControls('t', 'g'); break;
			default: player.setControls('ArrowUp', 'ArrowDown'); break;
		}
		players.push(player);
	}
	Player.playerArray = players;
}

export function	createGround(scene: Scene, dimensions: number[])
{
	const ground = MeshBuilder.CreateGround('ground', {width: dimensions[1], height: dimensions[0], updatable: true}, scene);
	new PhysicsAggregate(
		ground,
		PhysicsShapeType.BOX,
		{ mass: 0, restitution: 0.5 },
		scene
	);
	const mat = new StandardMaterial('floor', ground.getScene());
	mat.diffuseColor = new Color3(0.2, 1, 1);
	mat.ambientColor = new Color3(1, 0.2, 0.2);
	ground.material = mat;
}

export function createScoreboard(scene: Scene): TextBlock[]
{
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("Scores");
	let background = new Rectangle();
	background.widthInPixels = 200;
	background.heightInPixels = 35 * Player.playerCount + 10;
	background.cornerRadius = 10;
	background.color = "black";
	background.thickness = 2;
	background.background = "rgba(0, 0, 0, 0.8)";
	background.isVisible = true;
	background.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
	background.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
	advancedTexture.addControl(background);
	
	let scoreboard = [];

	for (let i = 0; i < Player.playerArray.length; i++)
	{
		const player = Player.playerArray[i];
		const textBlock = new TextBlock();
		textBlock.text = `Player ${player.ID}: ${player.getLives()}`;
		textBlock.color = Paddle.paddleColors[i].toHexString();
		textBlock.fontSize = 30;
		textBlock.top = `${i * 35 - canvas.height / 2 + 20}px`;
		textBlock.left = `${-(canvas.width / 2) + 100}px`;
		// textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		// textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
		advancedTexture.addControl(textBlock);
		scoreboard.push(textBlock);
	}
	return scoreboard;
}
