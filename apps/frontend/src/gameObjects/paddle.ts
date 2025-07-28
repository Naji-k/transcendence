import { Ball, Player, Game } from '../index';
import { StandardMaterial, Color3, Vector3, MeshBuilder, Mesh, PhysicsShapeType, PhysicsAggregate, PhysicsMotionType, Scene } from '@babylonjs/core';

export enum clr
{
	Red = 0,
	Blue = 1,
	Yellow = 2,
	Green = 3,
	Magenta = 4,
	Cyan = 5
}

export class Paddle
{
	private mesh:			Mesh;
	private material:		StandardMaterial;
	private spawnPosition:	Vector3;
	private velocity:		Vector3;
	private aggregate:		PhysicsAggregate;
	private targetSpeed:	number = 1;
	private acceleration: 	number = 0.01;
	private frozen:			boolean;

	static paddleColors: Color3[] =
	[
		new Color3(1, 0, 0), // Red
		new Color3(0, 0, 1), // Blue
		new Color3(1, 1, 0), // Yellow
		new Color3(0, 1, 0), // Green
		new Color3(1, 0, 1), // Magenta
		new Color3(0, 1, 1)  // Cyan
	];

	constructor(dimensions: Vector3, _position: Vector3, _color: Color3, scene: Scene)
	{
		this.mesh = MeshBuilder.CreateBox
		(
			'box', 
			{width: dimensions.x, height: dimensions.y, depth: dimensions.z},
			scene
		);
		this.spawnPosition = _position.clone();
		this.mesh.position = _position;
		this.velocity = Vector3.Zero();

		this.aggregate = new PhysicsAggregate(
			this.mesh,
			PhysicsShapeType.BOX,
			{ mass: 0, restitution: 1 },
			scene
		);

		// this.aggregate.body.setLinearVelocity(Vector3.Zero());
		this.aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
		this.aggregate.body.disablePreStep = false;
		this.material = new StandardMaterial("paddleMat", this.mesh.getScene());
		this.material.diffuseColor = _color;
		this.material.ambientColor = Color3.Black();
		this.material.alpha = 0.9;
        this.mesh.material = this.material;

		this.frozen = false;
	}

	move()
	{
		this.mesh.position.x += this.velocity.x;
		this.mesh.position.z += this.velocity.z;
		for (let i = 0; i < Player.wallArray.length; i++)
		{
			if (this.mesh.intersectsMesh(Player.wallArray[i].getMesh(), false) == true)
			{
				this.mesh.position.x -= this.velocity.x * 2;
				this.mesh.position.z -= this.velocity.z * 2;
				this.velocity.x = 0;
				this.velocity.z = 0;
				return;
			}
		}
	}

	getMesh(): Mesh
	{
		return this.mesh;
	}

	reset()
	{
		if (this.frozen == true)
		{
			return;
		}
		this.mesh.position.x = this.spawnPosition.x;
		this.mesh.position.z = this.spawnPosition.z;
		this.velocity.x = 0;
		this.velocity.z = 0;
	}

	update(direction: number, pressed: boolean)
	{
		if (this.frozen == true)
		{
			return;
		}
		let currentSpeed = this.velocity.length();
	
		if (pressed == false && currentSpeed > 0)
		{
			if (this.velocity.z > 0)
			{
				direction = 1;
			}
			else
			{
				direction = -1;
			}
			this.velocity.z -= this.acceleration * direction;
			if (Math.abs(this.velocity.z) < Math.abs(this.acceleration * direction * 1.5))
			{
				this.velocity.z = 0;
			}
		}
		if (pressed == true && currentSpeed < this.targetSpeed)
		{
			if (this.velocity.z > 0 && direction < 0 || this.velocity.z < 0 && direction > 0)
			{
				direction *= 2;
			}
			this.velocity.z += this.acceleration * direction;
		}
		this.move();
	}

	hits(ball: Ball): boolean
	{
		return this.mesh.intersectsMesh(ball.getMesh(), false);
	}

	eliminate()
	{
		this.mesh.position = this.spawnPosition;
		this.mesh.material = Game.eliminatedMaterial;
		this.frozen = true;
		this.aggregate.body.setLinearVelocity(Vector3.Zero());
	}
}
