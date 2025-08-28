import { Wall, Ball, Paddle, Goal, ColorMap, Colors, type MapObject } from '$lib/index';
import { Engine, Scene, FreeCamera, Color3, Vector3, HemisphericLight,
		StandardMaterial, MeshBuilder, PhysicsAggregate, PhysicsShapeType, HavokPlugin, Mesh } from '@babylonjs/core';
import { Button, Control, TextBlock, AdvancedDynamicTexture } from '@babylonjs/gui';

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
	private demoBall: Mesh;
	private demoWall: Wall;
	private demoGoal: Goal;
	
	private mapObjects: MapObject[] = [];
	private loadMap: Button;
	private saveMap: Button;
	private reset: Button;
	private UI: AdvancedDynamicTexture;
	
	constructor(havokInstance: any)
	{
		this.editorCanvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
		this.havokInstance = havokInstance;
		this.dimensions = [20, 28];
		this.engine = new Engine(this.editorCanvas, true, {antialias: true});
		this.scene = this.createScene();
		this.addGui();
	}

	private addGui()
	{
		const buttonLoadMap = Button.CreateSimpleButton('load', 'Load Map');
		const buttonSaveMap = Button.CreateSimpleButton('save', 'Save Map');
		const buttonReset = Button.CreateSimpleButton('reset', 'Reset');
		const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

		advancedTexture.addControl(buttonLoadMap);
		advancedTexture.addControl(buttonSaveMap);
		advancedTexture.addControl(buttonReset);
		buttonLoadMap.width = '150px';
		buttonLoadMap.height = '40px';
		buttonLoadMap.color = 'white';
		buttonLoadMap.background = 'green';
		buttonLoadMap.top = '-45px';
		buttonLoadMap.left = '-200px';
		buttonLoadMap.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		buttonLoadMap.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
		buttonLoadMap.onPointerUpObservable.add(() => {
			console.log('Load Map button clicked');
			// Implement load map functionality here
		});
		buttonSaveMap.width = '150px';
		buttonSaveMap.height = '40px';
		buttonSaveMap.color = 'white';
		buttonSaveMap.background = 'blue';
		buttonSaveMap.top = '-45px';
		buttonSaveMap.left = '0px';
		buttonSaveMap.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		buttonSaveMap.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
		buttonSaveMap.onPointerUpObservable.add(() => {
			console.log('Save Map button clicked');
			// Implement save map functionality here
		});
		buttonReset.width = '150px';
		buttonReset.height = '40px';
		buttonReset.color = 'white';
		buttonReset.background = 'red';
		buttonReset.top = '-45px';
		buttonReset.left = '200px';
		buttonReset.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		buttonReset.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		buttonReset.onPointerUpObservable.add(() => {
			console.log('Reset button clicked');
			// Implement reset functionality here
		});

		this.loadMap = buttonLoadMap;
		this.saveMap = buttonSaveMap;
		this.reset = buttonReset;
		this.UI = advancedTexture;
	}
	
	private createScene(): Scene
	{
		const scene = new Scene(this.engine);
		const havokPlugin = new HavokPlugin(true, this.havokInstance);
		const camera = new FreeCamera('camera1', new Vector3(0, 30, 0), scene);

		scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
		camera.setTarget(Vector3.Zero());
		camera.attachControl(this.editorCanvas, true);
		const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 10, 0), scene);
		hemiLight.intensity = 0.6;

		this.createGround(scene, this.dimensions);
		this.demoBall = MeshBuilder.CreateSphere('sphere', {diameter: 0.5}, scene);
		this.demoBall.position = new Vector3(0, 0.5, 0);

		const mat = new StandardMaterial('demoMat', scene);
		
		console.log('assigning color to demo ball');
		mat.diffuseColor = Colors['green'];
		mat.ambientColor = Colors['green'];
		
		this.demoBall.material = mat;
		this.demoWall = new Wall(new Vector3(1, 1, 1), new Vector3(-15, 3, 5), ColorMap['red'], 1, scene);
		this.demoGoal = new Goal(new Vector3(-15, 0, -5), new Vector3(-15, 0, 5), ColorMap['blue'], new Vector3(1, 0, 0), scene);

		return scene;
	}

	createGround(scene: Scene, dimensions: number[])
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

	start()
	{
		this.engine.runRenderLoop(() =>
		{
			console.log('Rendering a frame');
			this.scene.render();
		});
	}

	dispose()
	{
		if (this.engine == null || this.scene == null) return;

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


/*	Destroys the resources associated with the editor	*/

export async function destroyEditor(editor: Editor)
{
	editor.dispose();
	console.log('Editor destroyed successfully.');
}