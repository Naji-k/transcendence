import { StandardMaterial, Color3, Vector3, MeshBuilder, Mesh, PhysicsShapeType, PhysicsAggregate, PointLight, Scene } from '@babylonjs/core';
import { Ball } from '../index';

const goalPostDiameter = 0.5;
const goalThickness = 0.5;
const backplateThickness = 0.05;

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

	private static goalHeight = 4;

	constructor(loc1: Vector3, loc2: Vector3, clr: Color3, scene: Scene)
	{
		this.height = loc1.y * 2;
		this.isAlive = true;
		this.color = clr;
		this.post1 = this.createPost(loc1, scene);
		this.post2 = this.createPost(loc2, scene);
		
		this.front = MeshBuilder.CreateBox('goalFront', { width: goalThickness, height: Goal.goalHeight, depth: loc2.subtract(loc1).length() }, scene);
		this.back = MeshBuilder.CreateBox('goalBack', { width: backplateThickness, height: Goal.goalHeight, depth: loc2.subtract(loc1).length() }, scene);

		const position = Vector3.Lerp(loc1, loc2, 0.5);

		this.front.position = position;
		this.back.position = position.clone();

		if (this.post1.position.x < 0)
		{
			this.front.position.x += goalThickness / 2;
			this.back.position.x += goalThickness / 2 + backplateThickness / 2;
			this.post1.position.x += goalThickness;
			this.post2.position.x += goalThickness;
		}
		else
		{
			this.front.position.x += goalThickness / 2;
			this.back.position.x += goalThickness / 2 + backplateThickness / 2;
		}
		new PhysicsAggregate(
			this.back,
			PhysicsShapeType.BOX,
			{ mass: 0, restitution: 1 },
			scene
		);
		new PhysicsAggregate(
			this.front,
			PhysicsShapeType.BOX,
			{ mass: 0, restitution: 1 },
			scene
		);
		const mat = new StandardMaterial('goalMat', scene);

		mat.diffuseColor = clr;
		mat.ambientColor = clr;
		mat.alpha = 0.4;
		mat.maxSimultaneousLights = 16;
		this.back.material = mat;
		this.front.material = mat;
	}

	createPost(position: Vector3, scene: Scene): Mesh
	{
		const post = MeshBuilder.CreateCylinder('goalPost', { diameter: goalPostDiameter, height: Goal.goalHeight }, scene);
		post.position = position;
		post.material = Goal.goalPostMaterial;

		new PhysicsAggregate(
			post,
			PhysicsShapeType.CYLINDER,
			{ mass: 0, restitution: 1 },
			scene
		);
		const light = new PointLight('goalLight', new Vector3(position.x, this.height, position.z), scene);

		light.diffuse = this.color;
		light.specular = this.color;
		light.intensity = 0.5;
		light.range = 25;
		light.setEnabled(true);
		this.lights.push(light);
		return post;
	}

	score(ball: Ball): boolean
	{
		return this.isAlive == true && this.back.intersectsMesh(ball.getMesh(), false) == true;
	}

	eliminate()
	{
		this.post1.material = Goal.eliminatedMaterial;
		this.post2.material = Goal.eliminatedMaterial;
		this.back.material = Goal.eliminatedMaterial;
		this.front.material = Goal.eliminatedMaterial;
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

	static height(): number
	{
		return Goal.goalHeight;
	}
	
	static createGoalPostMaterial(scene: Scene)
	{
		const mat = new StandardMaterial('goalPostMat', scene);

		mat.diffuseColor = new Color3(0, 0, 0);
		mat.ambientColor = new Color3(0, 0, 0);
		mat.maxSimultaneousLights = 16;
		Goal.goalPostMaterial = mat;
	}
}
