import { StandardMaterial, Color3, Vector3, MeshBuilder, Mesh, PhysicsShapeType, PhysicsAggregate, PointLight, Scene } from '@babylonjs/core';
import { Ball } from '../index';

const goalHeight = 5;
const goalPostDiameter = 0.5;
const goalThickness = 0.5;

export class Goal
{
	private post1:	Mesh;
	private post2:	Mesh;
	private back:	Mesh;
	private front:	Mesh;
	private height:	number;
	private lights:	PointLight[] = [];
	private isAlive:	boolean;
	private color:	Color3;

	private static goalPostMaterial: StandardMaterial;
	private static eliminatedMaterial: StandardMaterial;

	constructor(loc1: Vector3, loc2: Vector3, clr: Color3, scene: Scene)
	{
		this.height = loc1.y * 2;
		this.isAlive = true;
		this.post1 = this.createPost(loc1, scene);
		this.post2 = this.createPost(loc2, scene);
		this.back = MeshBuilder.CreateBox("goalBack", { width: goalThickness, height: goalHeight, depth: loc2.subtract(loc1).length() }, scene);
		this.front = MeshBuilder.CreateBox("goalFront", { width: goalThickness, height: goalHeight, depth: loc2.subtract(loc1).length() }, scene);
		const position = Vector3.Lerp(loc1, loc2, 0.5);

		this.back.position = position;
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

		mat.diffuseColor = clr;
		mat.ambientColor = clr;
		this.back.material = mat;
		this.back.material.alpha = 0.4;
		this.color = clr;
	}

	createPost(position: Vector3, scene: Scene): Mesh
	{
		const post = MeshBuilder.CreateCylinder("goalPost", { diameter: 0.5, height: this.height }, scene);
		post.position = position;
		post.material = Goal.goalPostMaterial;

		new PhysicsAggregate(
			post,
			PhysicsShapeType.CYLINDER,
			{ mass: 0, restitution: 1 },
			scene
		);

		console.log('Made it thus far');
		this.lights.push(new PointLight("goalLight", new Vector3(position.x, this.height, position.z), scene));
		// this.lights[this.lights.length - 1].diffuse = this.color;
		this.lights[this.lights.length - 1].intensity = 0.5;
		return post;
	}

	score(ball: Ball): boolean
	{
		return this.isAlive == true && this.front.intersectsMesh(ball.getMesh(), false) == true;
	}

	eliminate()
	{
		this.post1.material = Goal.eliminatedMaterial;
		this.post2.material = Goal.eliminatedMaterial;
		this.back.material = Goal.eliminatedMaterial;
		for (const light of this.lights)
		{
			light.dispose();
		}
		this.isAlive = false;
	}
	

	static setEliminatedMaterial(mat: StandardMaterial)
	{
		Goal.eliminatedMaterial = mat;
	}
	
	static createGoalPostMaterial(scene: Scene)
	{
		const mat = new StandardMaterial("goalPostMat", scene);

		mat.diffuseColor = new Color3(0, 0, 0);
		mat.ambientColor = new Color3(0, 0, 0);
		Goal.goalPostMaterial = mat;
	}
}