import { Wall, Ball, Paddle, Goal, Player } from './index';
import { Scene, Vector3, Color3, StandardMaterial, MeshBuilder, PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core';

function	createSurroundingWalls(scene: Scene, walls: Wall[], dimensions: number[])
{
	const height = dimensions[0];
	const width = dimensions[1];
	const wallThickness = 0.5;
	const wallHeight = 2;
	const blackColor = Color3.Black();
	
	walls.push(
		new Wall(new Vector3(wallThickness, wallHeight, height + wallThickness * 2),
		new Vector3(-width / 2 - wallThickness / 2, wallHeight / 2, 0),
		blackColor,
		0.3,
		scene)
	);
	
	walls.push(
		new Wall(new Vector3(wallThickness, wallHeight, height + wallThickness * 2),
		new Vector3(width / 2 + wallThickness / 2, wallHeight / 2, 0),
		blackColor,
		0.3,
		scene)
	);
	
	walls.push(
		new Wall(new Vector3(width, wallHeight, wallThickness),
		new Vector3(0, wallHeight / 2, -height / 2 - wallThickness / 2),
		blackColor,
		0.3,
		scene)
	);
	
	walls.push(
		new Wall(new Vector3(width, wallHeight, wallThickness),
		new Vector3(0, wallHeight / 2, height / 2 + wallThickness / 2),
		blackColor,
		0.3,
		scene)
	);
}

export function createWalls(scene: Scene, walls: Wall[], dimensions: number[], grid: string[][])
{
	createSurroundingWalls(scene, walls, dimensions);

}

export function createPaddles(scene: Scene, paddles: Paddle[])
{
	paddles.push(new Paddle(new Vector3(1, 1, 5), new Vector3(-13, 0.5, 0), new Color3(1, 0, 0), scene));
	paddles.push(new Paddle(new Vector3(1, 1, 5), new Vector3(13, 0.5, 0), new Color3(0, 0, 1), scene));
	Player.paddleArray = paddles;
}

export function createBalls(scene: Scene, balls: Ball[])
{
	for (let i = 0; i < 250; i++)
	{
		balls.push(new Ball(new Vector3(i / 10 - 12, 0.5, 0), new Color3(Math.random(), Math.random(), Math.random()), 0.5, scene));
	}
	Player.ballArray = balls;
}

export function createGoals(scene: Scene, goals: Goal[])
{
	const goalWidth = 10;
	const goalHeight = 5;
	const goalDepth = 0.1;

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

export function createPlayers(scene: Scene, players: Player[])
{
	for (let i = 0; i < 2; i++)
	{
		const player = new Player(`Player ${i + 1}`, i, Player.goalArray[i], Player.paddleArray[i]);
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