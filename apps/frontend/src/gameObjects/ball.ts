import { StandardMaterial, Color3, Vector3, MeshBuilder, Mesh, PhysicsShapeType, PhysicsAggregate, Scene } from '@babylonjs/core';
import { Paddle } from './paddle';

export class Ball
{
	private velocity:	Vector3;
	private mesh:		Mesh;
	private diameter:	number;
	private aggregate:	PhysicsAggregate;
	private minimumSpeed: number = 20;
	private lasthit:	number;

	constructor(_center: Vector3, _color: Color3, _diameter: number, scene: Scene)
	{
		this.mesh = MeshBuilder.CreateSphere("sphere", {diameter: _diameter}, scene);
		this.mesh.position = _center;

		this.aggregate = new PhysicsAggregate(
			this.mesh,
			PhysicsShapeType.SPHERE,
			{ mass: 1, restitution: 1 },
			scene
		);
		this.diameter = _diameter;
		this.lasthit = -1;
		this.velocity = Vector3.Zero();
		this.aggregate.body.setLinearVelocity(this.randomVector().scale(Math.random() * this.minimumSpeed));
		this.aggregate.body.setLinearDamping(0.1);
		this.aggregate.body.setAngularDamping(0.1);

		const mat = new StandardMaterial("ballMat", this.mesh.getScene());
		mat.diffuseColor = _color;
		this.mesh.material = mat;
	}
	
	destroy()
	{
		this.mesh.dispose();
		this.aggregate.dispose();
	}

	randomVector(): Vector3
	{
		const angle: number = Math.random() * 2 * Math.PI;
		const randomVec = new Vector3(Math.cos(angle), 0, Math.sin(angle));
		randomVec.normalize();
		return randomVec;
	}

	update(paddles: Paddle[])
	{
		for (let i = 0; i < paddles.length; i++)
		{
			if (this.mesh.intersectsMesh(paddles[i].getMesh(), false) == true)
			{
				this.lasthit = i;
			}
		}

		const currentVelocity = this.aggregate.body.getLinearVelocity();

		this.velocity.x = currentVelocity.x;
		this.velocity.y = 0;
		this.velocity.z = currentVelocity.z;

		if (this.mesh.position.y > this.diameter / 2)
		{
			this.velocity.y = -this.diameter / 3;
		}

		let currentSpeed = this.velocity.length();

		if (currentSpeed < this.minimumSpeed)
		{
			if (currentSpeed > 0.001)
			{
				this.velocity = this.velocity.normalize().scale(this.minimumSpeed);
			}
			else
			{
				this.velocity = this.randomVector().scale(this.minimumSpeed);
			}
		}
		this.aggregate.body.setLinearVelocity(this.velocity);
	}

	getMesh(): Mesh
	{
		return this.mesh;
	}

	lastHit(): number
	{
		return this.lasthit;
	}
}
