import { ColorMap, saveMap, loadMap, EditorObject, startEditor, jsonToVector2, jsonToVector3 } from '$lib/index';
import { Engine, Scene, FreeCamera, Color3, Vector3, HemisphericLight,
		 StandardMaterial, MeshBuilder, HavokPlugin, Mesh, Observer,
		 PointerEventTypes, HighlightLayer, LinesMesh, PickingInfo, PointerInfo } from '@babylonjs/core';
import { type Nullable } from '@babylonjs/core/types';
import { TextBlock, AdvancedDynamicTexture, Button, Control, Rectangle } from '@babylonjs/gui';

const rotationStep = 6 * Math.PI / 180;
const leftStep = new Vector3(-0.5, 0, 0);
const rightStep = new Vector3(0.5, 0, 0);
const upStep = new Vector3(0, 0, -0.5);
const downStep = new Vector3(0, 0, 0.5);

export class Editor
{
	private engine: Engine;
	private scene: Scene;
	private havokInstance: any;
	private dimensions: [number, number];
	private	editorCanvas: HTMLCanvasElement = null;
	private ground: Mesh;
	private demoBall: EditorObject;
	private demoWall: EditorObject;
	private demoGoal: EditorObject;
	private highlight: HighlightLayer;
	private highlightedMesh: Mesh;
	private isDragging: boolean = false;
	private keydownListener: (event: KeyboardEvent) => void;
	private pointerObserver: Nullable<Observer<PointerInfo>> = null;

	private goals: EditorObject[] = [];
	private balls: EditorObject[] = [];
	private walls: EditorObject[] = [];
	private lines: LinesMesh[] = [];
	private sizeText: TextBlock;
	private UI: AdvancedDynamicTexture;

	private load: Button;
	private save: Button;
	private reset: Button;
	private help: Button;
	
	constructor(havokInstance: any)
	{
		this.start(havokInstance);
	}

	start(havokInstance: any)
	{
		this.editorCanvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
		this.havokInstance = havokInstance;
		this.ground = null;
		this.lines = [];
		this.engine = new Engine(this.editorCanvas, true, {antialias: true});
		this.scene = this.createScene();
		this.addGui();
		this.engine.runRenderLoop(() =>
		{
			this.scene.render();
		});
	}
		
	private addGui()
	{
		const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
		
		this.initSizeText(advancedTexture);
		this.loadButton(advancedTexture);
		this.saveButton(advancedTexture);
		this.resetButton(advancedTexture);
		this.helpButton(advancedTexture);
		this.handleKeyPresses();
		this.UI = advancedTexture;
		this.handleMouseActions();
		this.drawGrid();
		console.log('Editor started');
	}

	/*	These methods create, initialize and add buttons to the UI	*/

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
		button.onPointerEnterObservable.add(() => { button.background = '#c3d1a1ff'; });
		button.onPointerOutObservable.add(() => { button.background = 'green'; });
		button.onPointerUpObservable.add(async () =>
		{
			const mapObjects = await loadMap();
			if (mapObjects == null)
			{
				console.error('Failed to load map.');
				return;
			}
			this.restart();
			this.loadMapFromFile(mapObjects);
		});
		advancedTexture.addControl(button);
		this.load = button;
	}

	private saveButton(advancedTexture: AdvancedDynamicTexture)
	{
		const button = Button.CreateSimpleButton('save', 'Save Map');

		button.width = '150px';
		button.height = '40px';
		button.color = 'white';
		button.background = '#0d439bff';
		button.top = '-45px';
		button.left = '-200px';
		button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
		button.onPointerEnterObservable.add(() => { button.background = '#c3d1a1ff'; });
		button.onPointerOutObservable.add(() => { button.background = '#0d439bff'; });
		button.onPointerUpObservable.add(async () =>
		{
			saveMap(this.balls, this.walls, this.goals, this.dimensions);
		});
		advancedTexture.addControl(button);
		this.save = button;
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
		button.onPointerEnterObservable.add(() => { button.background = '#c3d1a1ff'; });
		button.onPointerOutObservable.add(() => { button.background = 'red'; });
		button.onPointerUpObservable.add(() =>
		{
			this.dispose();
			this.start(this.havokInstance);
		});
		advancedTexture.addControl(button);
		this.reset = button;
	}

	private createScene(): Scene
	{
		const scene = new Scene(this.engine);
		const havokPlugin = new HavokPlugin(true, this.havokInstance);
		const camera = new FreeCamera('camera1', new Vector3(0, 30, 0), scene);

		scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
		camera.setTarget(Vector3.Zero());
		// camera.attachControl(this.editorCanvas, true);
		const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 10, 0), scene);
		hemiLight.intensity = 0.6;

		this.dimensions = [20, 28];
		this.createGround(scene, this.dimensions);

		this.demoBall = new EditorObject(
			'sphere',
			new Vector3(this.dimensions[1] / 2 + 3, 0.5, 0),
			new Vector3(-1, 0, 0),
			ColorMap['green'],
			scene,
			undefined,
			0.5
		);

		this.demoWall = new EditorObject(
			'wall',
			new Vector3(this.dimensions[1] / 2 + 2, 0, 0),
			new Vector3(-1, 0, 0),
			ColorMap['blue'],
			scene,
			new Vector3(0.5, 1, 3),
			undefined
		);
		this.demoGoal = new EditorObject(
			'goal',
			new Vector3(this.dimensions[1] / 2 + 5, 0, 0),
			new Vector3(-1, 0, 0),
			ColorMap['orange'],
			scene,
			new Vector3(0.5, 1, 7),
			undefined
		);
		this.highlight = new HighlightLayer('hl', scene);

		return scene;
	}


	private helpButton(advancedTexture: AdvancedDynamicTexture)
	{
		const button = Button.CreateSimpleButton('help', '?');
		const modalRect = new Rectangle();
		const helpText = new TextBlock();
		const closeButton = Button.CreateSimpleButton("helpClose", "Close");

		button.width = '40px';
		button.height = '40px';
		button.color = 'yellow';
		button.background = '#444';
		button.fontSize = 32;
		button.cornerRadius = 20;
		button.thickness = 2;
		button.top = '20px';
		button.left = '20px';
		button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
		button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		button.onPointerEnterObservable.add(() => { button.background = '#c3d1a1ff'; });
		button.onPointerOutObservable.add(() => { button.background = '#444'; });

		modalRect.width = "450px";
		modalRect.height = "420px";
		modalRect.thickness = 2;
		modalRect.color = "black";
		modalRect.cornerRadius = 18;
		modalRect.background = "rgba(211, 200, 127, 1.0)";
		modalRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
		modalRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
		modalRect.isVisible = false;
		modalRect.isPointerBlocker = true;
		advancedTexture.addControl(modalRect);

		helpText.text =
			"Controls:\n\n" +
			"Arrow Up/Down: Adjust map height\n" +
			"Arrow Left/Right: Adjust map width\n\n" +
			"When object is selected:\n\n" +
			"w/a/s/d: Move\n" +
			"Arrow Left/Right: Rotate selected object\n" +
			"+/-: Increase/Decrease size\n" +
			"Delete/Backspace: Delete object\n" +
			"+ (on demo): Add new object";
		helpText.color = "black";
		helpText.fontSize = 22;
		helpText.paddingTop = "20px";
		helpText.paddingLeft = "28px";
		helpText.paddingRight = "28px";
		helpText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
		helpText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
		modalRect.addControl(helpText);

		closeButton.width = "120px";
		closeButton.height = "50px";
		closeButton.color = "white";
		closeButton.background = "#5b5a5aff";
		closeButton.cornerRadius = 12;
		closeButton.thickness = 2;
		closeButton.top = "0px";
		closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
		closeButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
		closeButton.fontSize = 20;
		closeButton.onPointerUpObservable.add(() =>
		{
			modalRect.isVisible = false;
		});
		modalRect.addControl(closeButton);

		button.onPointerUpObservable.add(() =>
		{
			modalRect.isVisible = true;
		});

		advancedTexture.addControl(button);
		this.help = button;
	}

	private loadMapFromFile(mapObjects: any)
	{
		this.dimensions = jsonToVector2(mapObjects.dimensions);
		this.balls = [];
		this.walls = [];
		this.goals = [];
		this.drawGrid();
		this.createGround(this.scene, [this.dimensions[0], this.dimensions[1]]);

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

	/*	These methods handle the selection and manipulation of objects in the scene	*/

	private handleKeyPresses()
	{
		const dimensions = this.dimensions;

		this.keydownListener = (event) =>
		{
			if (this.isDemoObject(this.highlightedMesh) == true)
			{
				if (event.key == '+')
				{
					switch (this.highlightedMesh)
					{
						case this.demoBall.getMesh(): this.balls.push(this.demoBall.clone(this.scene)); break;
						case this.demoWall.getMesh(): this.walls.push(this.demoWall.clone(this.scene)); break;
						case this.demoGoal.getMesh(): this.goals.push(this.demoGoal.clone(this.scene)); break;
						default: break;
					}
				}
			}
			else if (this.highlightedMesh == null || this.highlightedMesh == this.ground)
			{
				switch (event.key)
				{
					case 'ArrowUp': dimensions[0] += 1;	break;
					case 'ArrowDown': dimensions[0] = Math.max(1, dimensions[0] - 1); break;
					case 'ArrowLeft':
						dimensions[1] -= 1;
						if (dimensions[1] < 1)
						{
							dimensions[1] = 1;
							return;
						}
						this.demoBall.changePosition(leftStep);
						this.demoWall.changePosition(leftStep);
						this.demoGoal.changePosition(leftStep);
						break;
					case 'ArrowRight':
						dimensions[1] += 1;
						this.demoBall.changePosition(rightStep);
						this.demoWall.changePosition(rightStep);
						this.demoGoal.changePosition(rightStep);
						break;
					default: break;
				}
				this.sizeText.text = `Map Size: ${dimensions[0]} x ${dimensions[1]}`;
				this.createGround(this.scene, dimensions);
				this.drawGrid();
			}
			else
			{
				for (const obj of [...this.balls, ...this.walls, ...this.goals])
				{
					if (obj.getMesh() == this.highlightedMesh)
					{
						switch (event.key)
						{
							case 'ArrowUp':
							case 'ArrowRight': obj.rotate(rotationStep); break;
							case 'ArrowDown':
							case 'ArrowLeft': obj.rotate(-rotationStep); break;
							case '+': obj.increaseSize(Math.min(dimensions[0] - 1, dimensions[1] - 1)); break;
							case '-': obj.decreaseSize(); break;
							case 'Delete':
							case 'Backspace':
								this.stopHighlighting();
								switch (obj.objType())
								{
									case 'sphere':
										for (let i = 0; i < this.balls.length; i++)
										{
											if (this.balls[i] == obj)
											{
												this.balls[i].dispose();
												this.balls.splice(i, 1);
												break;
											}
										}
										break;
									case 'wall':
										for (let i = 0; i < this.walls.length; i++)
										{
											if (this.walls[i] == obj)
											{
												this.walls[i].dispose();
												this.walls.splice(i, 1);
												break;
											}
										}
										break;
									case 'goal':
										for (let i = 0; i < this.goals.length; i++)
										{
											if (this.goals[i] == obj)
											{
												this.goals[i].dispose();
												this.goals.splice(i, 1);
												break;
											}
										}
									default: break;
								}
							case 'w': obj.changePosition(upStep); break;
							case 's': obj.changePosition(downStep); break;
							case 'a': obj.changePosition(rightStep); break;
							case 'd': obj.changePosition(leftStep); break;
							default: break;
						}
					}
				}
			}
		};
		window.addEventListener('keydown', this.keydownListener);
	}

	private handleMouseActions()
	{
		const scene = this.scene;
		let pickResult: PickingInfo;
		let clickLogic: (pointerInfo: PointerInfo) => void;

		clickLogic = (pointerInfo) =>
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
					this.stopHighlighting();
					pickResult = pointerInfo.pickInfo;
					if (pickResult != null && pickResult.hit == true && pickResult.pickedMesh != null)
					{
						this.isDragging = true;
						const pickedMesh = pickResult.pickedMesh as Mesh;

						if (this.isDemoObject(pickedMesh) == true)
						{
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
						else
						{
							for (const obj of [...this.balls, ...this.walls, ...this.goals])
							{
								if (obj.getMesh() == pickedMesh)
								{
									this.highlight.addMesh(pickedMesh, Color3.Yellow());
									if (obj.objType() == 'goal')
									{
										this.highlight.addMesh(obj.getPost1Mesh(), Color3.Yellow());
										this.highlight.addMesh(obj.getPost2Mesh(), Color3.Yellow());
									}
									this.highlightedMesh = obj.getMesh();
									return;
								}
							}
						}
					}
					break;

				case PointerEventTypes.POINTERUP:
					this.isDragging = false;
					pickResult = pointerInfo.pickInfo;
					if (pickResult == null || pickResult.hit == false || pickResult.pickedMesh == null)
					{
						this.stopHighlighting();
						break;
					}
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
					for (const obj of [...this.balls, ...this.walls, ...this.goals])
					{
						if (obj.getMesh() == this.highlightedMesh)
						{
							if (isWithinBounds(placePosition, this.dimensions) == false)
							{
								this.stopHighlighting();
								return;
							}
							if (obj.getPosition().equals(placePosition) == true)
							{
								return;
							}
							obj.moveToPosition(placePosition);
							return;
						}
					}
					break;

				case PointerEventTypes.POINTERMOVE:
					if (this.isDragging == false)
					{
						return;
					}
					pickResult = pointerInfo.pickInfo;
					placePosition.y = 0.25;
					for (const obj of [...this.balls, ...this.walls, ...this.goals])
					{
						if (obj.getMesh() == this.highlightedMesh)
						{
							obj.moveToPosition(placePosition);
							return;
						}
					}
					break;

				default: break;
			}
		};
		this.pointerObserver = scene.onPointerObservable.add(clickLogic);
	}

	private isDemoObject(mesh: Mesh): boolean
	{
		if (mesh == null)
		{
			return false;
		}		
		if (mesh == this.demoBall.getMesh() ||
			mesh == this.demoWall.getMesh() ||
			mesh == this.demoGoal.getMesh() ||
			mesh == this.demoGoal.getPost1Mesh() ||
			mesh == this.demoGoal.getPost2Mesh())
		{
			return true;
		}
		return false;
	}

	private stopHighlighting()
	{
		this.highlight.removeAllMeshes();
		this.highlightedMesh = null;
	}

	private drawGrid()
	{
		if (this.lines != null && this.lines.length > 0)
		{
			for (const line of this.lines)
			{
				line.dispose();
			}
		}
		if (this.dimensions[1] > 20 || this.dimensions[0] > 30)
		{
			this.scene.activeCamera.position.y = Math.max(this.dimensions[1] + 10, this.dimensions[0] + 10);
		}
		else
		{
			this.scene.activeCamera.position.y = 30;
		}
		const verticalHalf = this.dimensions[0] / 2;
		const horizontalHalf = this.dimensions[1] / 2;
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
			}, this.scene));
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
			}, this.scene));
			lines[lines.length - 1].color = Color3.Black();
		}
		this.lines = lines;
		this.scene.render();
	}

	private createGround(scene: Scene, dimensions: number[])
	{
		if (this.ground != null)
		{
			this.ground.dispose();
		}
		this.ground = MeshBuilder.CreateGround(
			'ground',
			{width: dimensions[1], height: dimensions[0], updatable: true},
			scene
		);
		const mat = new StandardMaterial('floor', this.scene);
		mat.diffuseColor = Color3.Gray();
		this.ground.material = mat;
	}

	restart()
	{
		this.dispose();
		this.start(this.havokInstance);
	}

	dispose()
	{
		if (!this.engine || !this.scene) return;

		this.stopHighlighting();

		if (this.keydownListener)
		{
			window.removeEventListener('keydown', this.keydownListener);
			this.keydownListener = null;
		}

		if (this.pointerObserver)
		{
			this.scene.onPointerObservable.remove(this.pointerObserver);
			this.pointerObserver = null;
		}

		if (this.highlight) { this.highlight.dispose(); this.highlight = null; }
		if (this.UI) { this.UI.dispose(); this.UI = null; }
		if (this.sizeText) { this.sizeText.dispose(); this.sizeText = null; }
		if (this.load) { this.load.dispose(); this.load = null; }
		if (this.save) { this.save.dispose(); this.save = null; }
		if (this.reset) { this.reset.dispose(); this.reset = null; }

		if (this.demoBall) { this.demoBall.dispose(); this.demoBall = null; }
		if (this.demoWall) { this.demoWall.dispose(); this.demoWall = null; }
		if (this.demoGoal) { this.demoGoal.dispose(); this.demoGoal = null; }

		if (this.balls) { for (const obj of this.balls) obj.dispose(); this.balls = []; }
		if (this.walls) { for (const obj of this.walls) obj.dispose(); this.walls = []; }
		if (this.goals) { for (const obj of this.goals) obj.dispose(); this.goals = []; }
		if (this.ground) { this.ground.dispose(); this.ground = null; }
		if (this.lines) { for (const line of this.lines) line.dispose(); this.lines = []; }
		if (this.scene.activeCamera) { this.scene.activeCamera.dispose(); }

		this.scene.dispose();
		this.engine.stopRenderLoop();
		this.engine.dispose();

		this.scene = null;
		this.engine = null;
		this.editorCanvas = null;

		console.log('Editor stopped.');
	}

	getBalls(): EditorObject[] {return this.balls;}
	getWalls(): EditorObject[] {return this.walls;}
	getGoals(): EditorObject[] {return this.goals;}
	getScene(): Scene {return this.scene;}
}

function isWithinBounds(position: Vector3, dimensions: [number, number]): boolean
{
	const halfX = dimensions[1] / 2;
	const halfZ = dimensions[0] / 2;

	if (position.x < -halfX || position.x > halfX ||
		position.z < -halfZ || position.z > halfZ)
	{
		return false;
	}
	return true;
}

export function destroyEditor(editor: Editor)
{
	editor.dispose();
}

export async function restartEditor(editor: Editor): Promise<Editor>
{
	editor.dispose();
	editor = await startEditor();
	return editor;
}
