import { Ball } from './Ball';
import { StandardMaterial, Color3, Vector3, MeshBuilder, Mesh, PhysicsShapeType, PhysicsAggregate, Scene } from '@babylonjs/core';

export class Paddle
{
	private mesh:			Mesh;
	private velocity:		Vector3;
	private aggregate:		PhysicsAggregate;
	private targetSpeed:	number = 1;
	private acceleration: 	number = 0.01;

	constructor(dimensions: Vector3, _position: Vector3, _color: Color3, scene: Scene)
	{
		this.mesh = MeshBuilder.CreateBox
		(
			'box', 
			{width: dimensions.x, height: dimensions.y, depth: dimensions.z},
			scene
		);
		this.mesh.position = _position;
		this.velocity = Vector3.Zero();

		this.aggregate = new PhysicsAggregate(
			this.mesh,
			PhysicsShapeType.BOX,
			{ mass: 0, restitution: 1 },
			scene
		);

		this.aggregate.body.setLinearVelocity(Vector3.Zero());
		// this.aggregate.body.setMotionType(PhysicsMotionType.KINEMATIC);
		const mat = new StandardMaterial("ballMat", this.mesh.getScene());
		mat.diffuseColor = _color;
		mat.ambientColor = Color3.Black();
		mat.alpha = 0.9;
        this.mesh.material = mat;
	}

	move()
	{
		// this.mesh.position.x += this.velocity.x;
		// this.mesh.position.z += this.velocity.z;

		// this.aggregate.body.setLinearVelocity(this.velocity);
		this.mesh.position.x += this.velocity.x;
		this.mesh.position.z += this.velocity.z;

		// Force the physics body to sync with the mesh position
		// this.aggregate.body.setTargetTransform(
		// 	this.mesh.position, 
		// 	this.mesh.rotationQuaternion || this.aggregate.body.transformNode.rotationQuaternion
		// );
		// const currentPos = this.aggregate.body.transformNode.position;
		// const newPos = new Vector3(
		// 	currentPos.x + this.velocity.x,
		// 	currentPos.y,
		// 	currentPos.z + this.velocity.z
		// );
		// this.aggregate.body.setTargetTransform(newPos, this.aggregate.body.transformNode.rotationQuaternion);
	}

	getMesh(): Mesh
	{
		return this.mesh;
	}

	update(direction: number, pressed: boolean)
	{
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

	destroy()
	{
		this.mesh.dispose();
		this.aggregate.dispose();
	}
}
