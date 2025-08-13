import { Wall, Ball, Paddle, Goal, ColorMap, Colors } from '../../lib/index';
import { Engine, Scene, FreeCamera, Color3, Vector3, HemisphericLight,
		StandardMaterial, MeshBuilder, PhysicsAggregate, PhysicsShapeType, HavokPlugin, Mesh } from '@babylonjs/core';
import { TextBlock, AdvancedDynamicTexture } from '@babylonjs/gui';

const maxPlayerCount = 6;

export class Editor
{
	private engine: Engine;
	private scene: Scene;
	private havokInstance: any;
	private dimensions: [number, number];
	private	editorCanvas: HTMLCanvasElement;
	private balls: Ball[] = [];
	private walls: Wall[] = [];
	private goals: Goal[] = [];
	private demoBall: Ball;
	private demoWall: Wall;
	private demoGoal: Goal;

	constructor(havokInstance: any)
	{
		this.editorCanvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
		this.havokInstance = havokInstance;
		this.dimensions = [20, 28];
		this.engine = new Engine(this.editorCanvas, true, {antialias: true});
		this.scene = new Scene(this.engine);
		this.start();
	}

	private createScene(): Scene
	{
		const scene = this.scene;
		const havokPlugin = new HavokPlugin(true, this.havokInstance);
		const camera = new FreeCamera('camera1', new Vector3(0, 30, 0), scene);

		scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
		camera.setTarget(Vector3.Zero());
		camera.attachControl(this.editorCanvas, true);
		const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 10, 0), scene);
		hemiLight.intensity = 0.6;

		createGround(scene, this.dimensions);
		this.demoBall = new Ball(new Vector3(-15, 0, 0), ColorMap['green'], 0.5, scene);
		this.demoWall = new Wall(new Vector3(0, 0, 0), new Vector3(-15, 3, 5), Color3.Black(), 1, scene);
		// this.demoGoal = new Goal(new Vector3(15, 0, 0), ColorMap['blue'], scene);

		return scene;
	}

	start()
	{
		this.createScene();
		this.engine.runRenderLoop(() =>
		{
			if (this.scene)
			{
				this.scene.render();
			}
		});
	}

	dispose()
	{
		this.engine.stopRenderLoop();
		this.engine.dispose();
		this.scene.dispose();
		this.havokInstance = null;
		this.editorCanvas = null;
		this.balls = [];
		this.walls = [];
		this.goals = [];
		this.demoBall = null;
		this.demoWall = null;
		this.demoGoal = null;
		console.log('Editor disposed successfully.');
	}

	getBalls(): Ball[] {return this.balls;}
	getWalls(): Wall[] {return this.walls;}
	getGoals(): Goal[] {return this.goals;}
	getScene(): Scene {return this.scene;}
}

function	createGround(scene: Scene, dimensions: number[])
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
	ground.material = mat;
}

/*	Destroys the resources associated with the editor	*/

export async function destroyEditor(editor: Editor)
{
	editor.dispose();
	console.log('Editor destroyed successfully.');
}