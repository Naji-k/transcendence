import { ColorMap, saveMap, loadMap, EditorObject, startEditor, jsonToVector2, jsonToVector3 } from '$lib/index';
import { Engine, Scene, FreeCamera, Color3, Vector3, HemisphericLight,
		 StandardMaterial, MeshBuilder, HavokPlugin, Mesh, 
		 PointerEventTypes, HighlightLayer, LinesMesh } from '@babylonjs/core';
import { TextBlock, AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';

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
				this.redrawGrid();
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
		const button = Button.CreateSimpleButton('load', 'Load Map');
		
		button.width = '150px';
		button.height = '40px';
		button.color = 'white';
		button.background = 'green';
		button.top = '-45px';
		button.left = '0px';
		button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
		button.onPointerUpObservable.add(async () =>
		{
			console.log('Load Map button clicked');
			const mapObjects = await loadMap();
			this.loadMapFromFile(mapObjects);
		});
		this.loadMap = button;
		advancedTexture.addControl(button);
	}

	private saveButton(advancedTexture: AdvancedDynamicTexture)
	{
		const button = Button.CreateSimpleButton('save', 'Save Map');

		button.width = '150px';
		button.height = '40px';
		button.color = 'white';
		button.background = 'blue';
		button.top = '-45px';
		button.left = '-200px';
		button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
		button.onPointerUpObservable.add(async () =>
		{
			console.log('Save Map button clicked');
			saveMap(this.balls, this.walls, this.goals, this.dimensions);
		});
		advancedTexture.addControl(button);
		this.saveMap = button;

	}

	private resetButton(advancedTexture: AdvancedDynamicTexture)
	{
		const button = Button.CreateSimpleButton('reset', 'Reset');

		button.width = '150px';
		button.height = '40px';
		button.color = 'white';
		button.background = 'red';
		button.top = '-45px';
		button.left = '200px';
		button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		button.onPointerUpObservable.add(() =>
		{
			console.log('Reset button clicked');
			restartEditor(this);
		});
		this.reset = button;
		advancedTexture.addControl(button);
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

	private loadMapFromFile(mapObjects: any)
	{
		this.dimensions = jsonToVector2(mapObjects.dimensions);
		this.balls = [];
		this.walls = [];
		this.goals = [];
		this.redrawGrid();
		this.ground.dispose();

		this.ground = this.createGround(this.scene, [this.dimensions[0], this.dimensions[1]]);

		for (const ball of mapObjects.balls)
		{
			this.balls.push(new EditorObject
			(
				'sphere',
				jsonToVector3(ball.location),
				new Vector3(-1, 0, 0),
				ColorMap['green'],
				this.scene,
				undefined,
				ball.diameter
			));
		}
		for (const wall of mapObjects.walls)
		{
			this.walls.push(new EditorObject
			(
				'wall',
				jsonToVector3(wall.location),
				jsonToVector3(wall.surfaceNormal),
				Color3.Black(),
				this.scene,
				jsonToVector3(wall.dimensions),
				undefined
			));
		}
		for (const obj of mapObjects.goals)
		{
			this.goals.push(new EditorObject
			(
				'goal',
				jsonToVector3(obj.location),
				jsonToVector3(obj.surfaceNormal),
				Color3.Red(),
				this.scene,
				jsonToVector3(obj.dimensions),
				undefined
			));
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
							this.balls.push(new EditorObject
							(
								'sphere',
								placePosition,
								new Vector3(-1, 0, 0),
								ColorMap['green'],
								scene,
								undefined,
								0.3)
							);
							break;
						case this.demoWall.getMesh():
							this.walls.push(new EditorObject
							(
								'wall',
								placePosition,
								new Vector3(-1, 0, 0),
								Color3.Black(),
								scene,
								new Vector3(0.5, 1, 3))
							);
							break;
						case this.demoGoal.getMesh():
						case this.demoGoal.getPost1Mesh():
						case this.demoGoal.getPost2Mesh():
							this.goals.push(new EditorObject
							(
								'goal',
								placePosition,
								new Vector3(-1, 0, 0),
								ColorMap['red'],
								scene,
								new Vector3(0.5, 2, 5))
							);
							break;
					}
					break;

				default: break;
			}
		});
	}

	redrawGrid()
	{
		for (const line of this.lines)
		{
			line.dispose();
		}
		this.lines = [];
		this.lines = drawGrid(this.scene, this.dimensions);
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
		if (this.engine == null || this.scene == null)
		{
			return;
		}

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