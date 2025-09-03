import { ColorMap, saveMap, loadMap, EditorObject, startEditor, parseMap, jsonToVector3 } from '$lib/index';
import { Engine, Scene, FreeCamera, Color3, Vector3, HemisphericLight,
		 StandardMaterial, MeshBuilder, HavokPlugin, Mesh, 
		 PointerEventTypes, HighlightLayer, LinesMesh } from '@babylonjs/core';
import { TextBlock, AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import { json } from 'zod';

const maxPlayerCount = 6;

export class Editor
{
	private engine: Engine;
	private scene: Scene;
	private havokInstance: any;
	private dimensions: [number, number];
	private	editorCanvas: HTMLCanvasElement;
	private ground: Mesh;
	private demoBall: EditorObject;
	private demoWall: EditorObject;
	private demoGoal: EditorObject;
	private highlight: HighlightLayer;
	private highlightedMesh: Mesh;
	
	private goals: EditorObject[] = [];
	private balls: EditorObject[] = [];
	private walls: EditorObject[] = [];
	private loadMap: Button;
	private saveMap: Button;
	private reset: Button;
	private lines: LinesMesh[] = [];
	private sizeText: TextBlock;
	private UI: AdvancedDynamicTexture;
	
	constructor(havokInstance: any)
	{
		this.editorCanvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
		this.havokInstance = havokInstance;
		this.dimensions = [10, 15];
		this.engine = new Engine(this.editorCanvas, true, {antialias: true});
		this.scene = this.createScene();
		this.handleSelectionLogic();
		this.addGui();
	}

	private addGui()
	{
		const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

		this.initSizeText(advancedTexture);
		this.loadButton(advancedTexture);
		this.saveButton(advancedTexture);
		this.resetButton(advancedTexture);
		this.updateMapSize();
		this.UI = advancedTexture;
		this.lines = drawGrid(this.scene, this.dimensions);
		console.log('Editor started');
	}

	/*	These methods create, initialize and add buttons to the UI	*/

	private updateMapSize()
	{
		const dimensions = this.dimensions;
		window.addEventListener('keydown', (event) =>
		{
			if (this.highlightedMesh == null || this.highlightedMesh == this.ground)
			{
				switch (event.key)
				{
					case 'ArrowUp': dimensions[0] += 1;	break;
					case 'ArrowDown': dimensions[0] = Math.max(1, dimensions[0] - 1); break;
					case 'ArrowLeft':
						dimensions[1] = Math.max(1, dimensions[1] - 1);
						this.demoBall.changePosition(new Vector3(-0.5, 0, 0));
						this.demoWall.changePosition(new Vector3(-0.5, 0, 0));
						this.demoGoal.changePosition(new Vector3(-0.5, 0, 0));
						break;
					case 'ArrowRight':
						dimensions[1] += 1;
						this.demoBall.changePosition(new Vector3(0.5, 0, 0));
						this.demoWall.changePosition(new Vector3(0.5, 0, 0));
						this.demoGoal.changePosition(new Vector3(0.5, 0, 0));
						break;
					default: return;
				}
				this.sizeText.text = `Map Size: ${dimensions[0]} x ${dimensions[1]}`;
				this.ground.dispose();
				this.ground = this.createGround(this.scene, dimensions);
				for (const line of this.lines)
				{
					line.dispose();
				}
				this.lines = [];
				this.lines = drawGrid(this.scene, dimensions);
			}
			else
			{
				for (const obj of [...this.walls, ...this.goals])
				{
					if (obj.getMesh() == this.highlightedMesh)
					{
						const rotationStep = 360 / 16 * Math.PI / 180;
						switch (event.key)
						{
							case 'ArrowUp':
							case 'ArrowRight': obj.rotate(rotationStep); break;
							case 'ArrowDown':
							case 'ArrowLeft': obj.rotate(-rotationStep); break;
							case '+': obj.increaseSize(); break;
							case '-': obj.decreaseSize(); break;
							default: return;
						}
					}
				}
			}
		});
	}

	private initSizeText(advancedTexture: AdvancedDynamicTexture)
	{
		const sizeText = new TextBlock();
	
		sizeText.text = `Map Size: ${this.dimensions[0]} x ${this.dimensions[1]}`;
		sizeText.color = 'white';
		sizeText.fontSize = 24;
		sizeText.top = '-45%';
		sizeText.left = '0px';
		sizeText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		sizeText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
		advancedTexture.addControl(sizeText);
		this.sizeText = sizeText;
	}

	private loadButton(advancedTexture: AdvancedDynamicTexture)
	{
		const buttonLoadMap = Button.CreateSimpleButton('load', 'Load Map');
		
		buttonLoadMap.width = '150px';
		buttonLoadMap.height = '40px';
		buttonLoadMap.color = 'white';
		buttonLoadMap.background = 'green';
		buttonLoadMap.top = '-45px';
		buttonLoadMap.left = '-200px';
		buttonLoadMap.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		buttonLoadMap.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
		buttonLoadMap.onPointerUpObservable.add(async () =>
		{
			console.log('Load Map button clicked');
			const mapObjects = await loadMap();
			this.loadMapFromFile(JSON.stringify(mapObjects));
		});
		this.loadMap = buttonLoadMap;
		advancedTexture.addControl(buttonLoadMap);
	}

	private saveButton(advancedTexture: AdvancedDynamicTexture)
	{
		const buttonSaveMap = Button.CreateSimpleButton('save', 'Save Map');

		buttonSaveMap.width = '150px';
		buttonSaveMap.height = '40px';
		buttonSaveMap.color = 'white';
		buttonSaveMap.background = 'blue';
		buttonSaveMap.top = '-45px';
		buttonSaveMap.left = '0px';
		buttonSaveMap.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		buttonSaveMap.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
		buttonSaveMap.onPointerUpObservable.add(async () =>
		{
			console.log('Save Map button clicked');
			saveMap(this.balls, this.walls, this.goals, this.dimensions);
		});
		advancedTexture.addControl(buttonSaveMap);
		this.saveMap = buttonSaveMap;

	}

	private resetButton(advancedTexture: AdvancedDynamicTexture)
	{
		const buttonReset = Button.CreateSimpleButton('reset', 'Reset');

		buttonReset.width = '150px';
		buttonReset.height = '40px';
		buttonReset.color = 'white';
		buttonReset.background = 'red';
		buttonReset.top = '-45px';
		buttonReset.left = '200px';
		buttonReset.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		buttonReset.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		buttonReset.onPointerUpObservable.add(() =>
		{
			console.log('Reset button clicked');
			restartEditor(this);
		});
		this.reset = buttonReset;
		advancedTexture.addControl(buttonReset);
	}

	private createScene(): Scene
	{
		const scene = new Scene(this.engine);
		const havokPlugin = new HavokPlugin(true, this.havokInstance);
		const camera = new FreeCamera('camera1', new Vector3(0, 30, 0), scene);

		scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
		camera.setTarget(Vector3.Zero());
		const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 10, 0), scene);
		hemiLight.intensity = 0.6;

		this.ground = this.createGround(scene, this.dimensions);

		this.demoBall = new EditorObject(
			'sphere',
			new Vector3(this.dimensions[1] / 2 + 3, 0.5, 0),
			new Vector3(-1, 0, 0),
			Color3.Black(),
			scene,
			undefined,
			0.3
		);

		this.demoWall = new EditorObject(
			'wall',
			new Vector3(this.dimensions[1] / 2 + 2, 0, 0),
			new Vector3(-1, 0, 0),
			Color3.Black(),
			scene,
			new Vector3(0.5, 1, 3),
			undefined
		);
		this.demoGoal = new EditorObject(
			'goal',
			new Vector3(this.dimensions[1] / 2 + 5, 0, 0),
			new Vector3(-1, 0, 0),
			Color3.Black(),
			scene,
			new Vector3(0.5, 1, 7),
			undefined
		);
		this.highlight = new HighlightLayer('hl', scene);

		return scene;
	}

	private loadMapFromFile(mapFile: string)
	{
		const mapObjects = parseMap(mapFile);

		for (const obj of mapObjects)
		{
			switch (obj.objType())
			{
				case 'ball':
					this.balls.push(new EditorObject
					(
						'sphere',
						jsonToVector3(obj.location),
						new Vector3(-1, 0, 0),
						ColorMap['green'],
						this.scene,
						undefined,
						obj.diameter
					));
					break;
				case 'wall':
					this.walls.push(new EditorObject
					(
						'wall',
						jsonToVector3(obj.location),
						jsonToVector3(obj.surfaceNormal),
						Color3.Black(),
						this.scene,
						new Vector3(obj.dimensions.width, obj.dimensions.height, obj.dimensions.depth),
						undefined
					));
					break;
				case 'goal':
					this.goals.push(new EditorObject
					(
						'goal',
						jsonToVector3(obj.location),
						jsonToVector3(obj.surfaceNormal),
						Color3.Red(),
						this.scene,
						new Vector3(obj.dimensions.width, obj.dimensions.height, obj.dimensions.depth),
						undefined
					));
					break;
				default: throw new Error(`Unknown type: ${obj.objType()}`);
			}				
		}
	}
	
	private handleSelectionLogic()
	{
		const scene = this.scene;

		scene.onPointerObservable.add((pointerInfo) =>
		{
			const evt = pointerInfo.event;
			const mouseLocation = scene.pick(evt.clientX, evt.clientY);
			const placePosition = mouseLocation.pickedPoint;
			if (placePosition == null)
			{
				return;
			}

			switch (pointerInfo.type)
			{
				case PointerEventTypes.POINTERDOWN:
					this.highlight.removeAllMeshes();
					this.highlightedMesh = null;
					const pickResult = pointerInfo.pickInfo;
					if (pickResult && pickResult.hit == true && pickResult.pickedMesh)
					{
						const pickedMesh = pickResult.pickedMesh as Mesh;
						this.highlight.addMesh(pickedMesh, Color3.Yellow());
						if (pickedMesh == this.demoGoal.getMesh() ||
							pickedMesh == this.demoGoal.getPost1Mesh() ||
							pickedMesh == this.demoGoal.getPost2Mesh())
						{
							this.highlight.addMesh(this.demoGoal.getMesh(), Color3.Yellow());
							this.highlight.addMesh(this.demoGoal.getPost1Mesh(), Color3.Yellow());
							this.highlight.addMesh(this.demoGoal.getPost2Mesh(), Color3.Yellow());
							this.highlightedMesh = this.demoGoal.getMesh();
						}
						else
						{
							this.highlightedMesh = pickedMesh;
						}
					}
					break;

				case PointerEventTypes.POINTERUP:
					placePosition.y = 0.25;
					placePosition.x = Math.floor(placePosition.x);
					placePosition.z = Math.floor(placePosition.z);
					if (this.dimensions[0] % 2 == 0)
					{
						placePosition.z += 0.5;
					}
					if (this.dimensions[1] % 2 == 0)
					{
						placePosition.x += 0.5;
					}
					switch (this.highlightedMesh)
					{
						case null: break;
						case this.demoBall.getMesh():
							this.balls.push(new EditorObject('sphere', placePosition, new Vector3(-1, 0, 0), ColorMap['green'], scene, undefined, 0.5));
							break;
						case this.demoWall.getMesh():
							this.walls.push(new EditorObject('wall', placePosition, new Vector3(-1, 0, 0), ColorMap['blue'], scene, new Vector3(0.5, 2, 5)));
							break;
						case this.demoGoal.getMesh():
						case this.demoGoal.getPost1Mesh():
						case this.demoGoal.getPost2Mesh():
							this.goals.push(new EditorObject('goal', placePosition, new Vector3(-1, 0, 0), ColorMap['red'], scene, new Vector3(0.5, 2, 5)));
							break;
					}
					break;

				default: break;
			}
		});
	}

	private createGround(scene: Scene, dimensions: number[]): Mesh
	{
		const ground = MeshBuilder.CreateGround(
			'ground',
			{width: dimensions[1], height: dimensions[0], updatable: true},
			scene
		);
		const mat = new StandardMaterial('floor', ground.getScene());
		mat.diffuseColor = Color3.Gray();
		ground.material = mat;
		return ground;
	}

	start()
	{
		this.engine.runRenderLoop(() =>
		{
			this.scene.render();
		});
	}

	dispose()
	{
		if (this.engine == null || this.scene == null) return;

		this.engine.stopRenderLoop();
		this.engine.dispose();
		this.scene.dispose();
		this.UI.dispose();
		this.loadMap = null;
		this.saveMap = null;
		this.reset = null;
		this.engine = null;
		this.scene = null;
		this.highlightedMesh = null;
		this.havokInstance = null;
		this.editorCanvas = null;
		this.balls = [];
		this.walls = [];
		this.goals = [];
		this.demoBall = null;
		this.demoWall = null;
		this.demoGoal = null;
		console.log('Editor stopped.');
	}

	getBalls(): EditorObject[] {return this.balls;}
	getWalls(): EditorObject[] {return this.walls;}
	getGoals(): EditorObject[] {return this.goals;}
	getScene(): Scene {return this.scene;}
}

function drawGrid(scene: Scene, dimensions: [number, number]): LinesMesh[]
{
	const verticalHalf = dimensions[0] / 2;
	const horizontalHalf = dimensions[1] / 2;
	const height = 0.01;
	const lines: LinesMesh[] = [];

	for (let i = -horizontalHalf + 1; i < horizontalHalf; i++)
	{
		lines.push(MeshBuilder.CreateLines(`grid_v_${i}`,
		{
			points:
			[
				new Vector3(i, height, -verticalHalf),
				new Vector3(i, height, verticalHalf)
			]
		}, scene));
		lines[lines.length - 1].color = Color3.Black();
	}

	for (let i = -verticalHalf + 1; i < verticalHalf; i++)
	{
		lines.push(MeshBuilder.CreateLines(`grid_h_${i}`,
		{
			points:
			[
				new Vector3(-horizontalHalf, height, i),
				new Vector3(horizontalHalf, height, i)
			]
		}, scene));
		lines[lines.length - 1].color = Color3.Black();
	}
	return lines;
}

export async function destroyEditor(editor: Editor)
{
	editor.dispose();
}

export async function restartEditor(editor: Editor): Promise<Editor>
{
	destroyEditor(editor);
	return await startEditor();
}