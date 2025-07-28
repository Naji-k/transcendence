import { StandardMaterial, Color3, Vector3, MeshBuilder, Mesh, PhysicsShapeType, PhysicsAggregate, Scene } from '@babylonjs/core';
import { Ball } from './ball';

export class Goal
{
	private post1:	Mesh;
	private post2:	Mesh;
	private back:	Mesh;
	private height:	number;

	constructor(loc1: Vector3, loc2: Vector3, scene: Scene)
	{
		this.height = loc1.y * 2;
		this.post1 = this.createPost(loc1, scene);
		this.post2 = this.createPost(loc2, scene);
		this.back = MeshBuilder.CreateBox("goalBack", { width: 0.1, height: 5, depth: loc2.subtract(loc1).length() }, scene);
		this.back.position = Vector3.Lerp(loc1, loc2, 0.5);
		if (this.post1.position.x < 0)
		{
			this.back.position.x -= 0.25;
		}
		else
		{
			this.back.position.x += 0.25;
		}
		new PhysicsAggregate(
			this.back,
			PhysicsShapeType.BOX,
			{ mass: 0, restitution: 1 },
			scene
		);
		const mat = new StandardMaterial("goalBackMat", scene);

		mat.diffuseColor = new Color3(1, 0, 0);
		mat.ambientColor = new Color3(1, 0, 0);
		this.back.material = mat;
		this.back.material.alpha = 0.4;
	}

	createPost(position: Vector3, scene: Scene): Mesh
	{
		const post = MeshBuilder.CreateCylinder("goalPost", { diameter: 0.5, height: this.height }, scene);
		post.position = position;

		const mat = new StandardMaterial("postMat", scene);
		mat.diffuseColor = new Color3(1, 1, 0);
		post.material = mat;

		new PhysicsAggregate(
			post,
			PhysicsShapeType.CYLINDER,
			{ mass: 0, restitution: 1 },
			scene
		);
		return post;
	}

	score(ball: Ball): boolean
	{
		return this.back.intersectsMesh(ball.getMesh(), false);
	}

	destroy()
	{
		this.post1.dispose();
		this.post2.dispose();
		this.back.dispose();
	}
}