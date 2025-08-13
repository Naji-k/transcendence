import { Wall, Ball, Paddle, Goal, Player, Colors, ColorMap } from '../lib/index';
import { Scene, Vector3, Color3, StandardMaterial, MeshBuilder, PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core';
import { AdvancedDynamicTexture, Rectangle, TextBlock, Control, Button } from '@babylonjs/gui';

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
	const wallHeight = ballDiameter * 8;
	const wallOpacity = 0.3;
	const blackColor = Color3.Black();
	const whiteColor = Color3.White();

	/* | on right */
	walls.push(
		new Wall(new Vector3(wallThickness, wallHeight, height + wallThickness * 2),
		new Vector3(-width / 2 - wallThickness / 2, wallHeight / 2, 0),
		whiteColor,
		wallOpacity,
		scene)
	);

	/* | on left */
	walls.push(
		new Wall(new Vector3(wallThickness, wallHeight, height + wallThickness * 2),
		new Vector3(width / 2 + wallThickness / 2, wallHeight / 2, 0),
		whiteColor,
		wallOpacity,
		scene)
	);

	walls.push(
		new Wall(new Vector3(width, wallHeight, wallThickness),
		new Vector3(0, wallHeight / 2, -height / 2 - wallThickness / 2),
		whiteColor,
		wallOpacity,
		scene)
	);

	walls.push(
		new Wall(new Vector3(width, wallHeight, wallThickness),
		new Vector3(0, wallHeight / 2, height / 2 + wallThickness / 2),
		whiteColor,
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
}

function setGoalToPlayerNum(grid: string[][], x: number, y: number, num: string)
{
	let height = 1;
	let width = 1;

	while (y - 1 >= 0 && grid[x][y - 1] == 'G')
	{
		y--;
	}
	while (x - 1 >= 0 && grid[x - 1][y] == 'G')
	{
		x--;
	}
	grid[x][y] = num;
	if (y + 1 < grid[x].length && grid[x][y + 1] == 'G')
	{
		while (y + width < grid[x].length && grid[x][y + width] == 'G')
		{
			grid[x][y + width] = num;
			width++;
		}
	}
	if (x + 1 < grid.length && grid[x + 1][y] == 'G')
	{
		if (width != 1)
		{
			throw new Error(`Invalid grid: element at (${x}, ${y}) is part of a horizontal and vertical element.`);
		}
		while (x + height < grid.length && grid[x + height][y] == 'G')
		{
			grid[x + height][y] = num;
			height++;
		}
	}
}

function findNearestGoal(x: number, y: number, grid: string[][], playerNum: number): Vector3
{
	const gridWidth = grid[0].length;
	const gridHeight = grid.length;
	let nearestGoal = Vector3.Zero();
	let count = 0;

	while (x - count >= 0 && x + count < gridHeight && y - count >= 0 && y + count < gridWidth)
	{
		if (grid[x - count][y] == 'G')
		{
			nearestGoal.x = x - count;
			nearestGoal.y = y;
			break;
		}
		else if (grid[x + count][y] == 'G')
		{
			nearestGoal.x = x + count;
			nearestGoal.y = y;
			break;
		}
		else if (grid[x][y - count] == 'G')
		{
			nearestGoal.x = x;
			nearestGoal.y = y - count;
			break;
		}
		else if (grid[x][y + count] == 'G')
		{
			nearestGoal.x = x;
			nearestGoal.y = y + count;
			break;
		}
		count++;
	}
	if (nearestGoal.equals(Vector3.Zero()))
	{
		throw new Error(`No goal found for player at (${x}, ${y})`);
	}
	setGoalToPlayerNum(grid, nearestGoal.x, nearestGoal.y, playerNum.toString());
	nearestGoal.x -= x;
	nearestGoal.y -= y;
	return nearestGoal;
}

function createPaddle(scene: Scene, grid: string[][], player: number): Paddle
{
	const playerChar = player.toString();
	const gridWidth = grid[0].length;
	const gridHeight = grid.length;

	for (let x = 0; x < grid.length; x++)
	{
		for (let y = 0; y < grid[x].length; y++)
		{
			if (grid[x][y] == playerChar)
			{
				const orientation = findNearestGoal(x, y, grid, player);
				const [height, width] = getBlockSize(x, y, grid);
				const dimensions = new Vector3(width, ballDiameter * 2, height);
				const position = new Vector3(
					(y - gridWidth / 2 + width / 2),
					ballDiameter,
					(x - gridHeight / 2 + height / 2)
				);
				return new Paddle(dimensions, position, Colors[player - 1].color, scene);
			}
		}
	}
	throw new Error(`Player ${player} not found in grid.`);
}

function createGoal(scene: Scene, grid: string[][], num: number): Goal
{
	const goalHeight = Goal.getHeight();
	const gridWidth = grid[0].length;
	const gridHeight = grid.length;
	const playerChar = num.toString();

	for (let x = 0; x < grid.length; x++)
	{
		for (let y = 0; y < grid[x].length; y++)
		{
			if (grid[x][y] == playerChar)
			{
				const [height, width] = getBlockSize(x, y, grid);
				const adjustment = Math.max(height, width);
				const post1 = new Vector3(
					y - gridWidth / 2,
					goalHeight / 2,
					x - gridHeight / 2
				);
				const post2 = new Vector3(
					y - gridWidth / 2,
					goalHeight / 2,
					x - gridHeight / 2 + adjustment
				);
				return new Goal(post1, post2, Colors[num - 1].color, new Vector3(0, 0, 1), scene);
			}
		}
	}
	throw new Error(`Goal for player ${num} not found in grid.`);
}

function createPlayerAttributes(scene: Scene, paddles: Paddle[], goals: Goal[], grid: string[][], player: number)
{
	paddles.push(createPaddle(scene, grid, player));
	goals.push(createGoal(scene, grid, player));
}

export function createBalls(scene: Scene, balls: Ball[], amount: number)
{
	for (let i = 0; i < amount; i++)
	{
		balls.push(new Ball(
			new Vector3(0, ballDiameter, 0),
			ColorMap['green'],
			0.5, scene)
		);
	}
}

export function createPlayers(players: Player[], goals: Goal[], paddles: Paddle[], numPlayers: number, grid: string[][], scene: Scene)
{
	for (let i = 0; i < numPlayers; i++)
	{
		createPlayerAttributes(scene, paddles, goals, grid, i + 1);
		const player = new Player(`Player ${i + 1}`, i + 1, goals[i], paddles[i]);
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
}

export function	createGround(scene: Scene, dimensions: number[])
{
	const ground = MeshBuilder.CreateGround(
		'ground',
		{width: dimensions[1], height: dimensions[0], updatable: true},
		scene
	);
	new PhysicsAggregate(
		ground,
		PhysicsShapeType.BOX,
		{ mass: 0, restitution: 0.5 },
		scene
	);
	const mat = new StandardMaterial('floor', ground.getScene());
	mat.diffuseColor = Color3.Gray();
	mat.ambientColor = Color3.Gray();
	mat.maxSimultaneousLights = 16;
	ground.material = mat;
}

export function createScoreboard(scoreboard: TextBlock[], players: Player[])
{
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('Scores');
	let background = new Rectangle();
	background.widthInPixels = 200;
	background.heightInPixels = 35 * players.length + 10;
	background.cornerRadius = 10;
	background.color = 'black';
	background.thickness = 2;
	background.background = 'rgba(0, 0, 0, 0.8)';
	background.isVisible = true;
	background.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
	background.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
	advancedTexture.addControl(background);

	for (let i = 0; i < players.length; i++)
	{
		const player = players[i];
		const textBlock = new TextBlock();
		textBlock.text = `Player ${player.ID}: ${player.getLives()}`;
		textBlock.color = Colors[i].name;
		textBlock.fontSize = 30;
		textBlock.top = `${i * 35 - canvas.height / 2 + 20}px`;
		textBlock.left = `${-(canvas.width / 2) + 100}px`;
		// textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		// textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
		advancedTexture.addControl(textBlock);
		scoreboard.push(textBlock);
	}
}
