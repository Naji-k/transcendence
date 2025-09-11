import { Vector3, Color3, Mesh, MeshBuilder, Scene, StandardMaterial, 
		 PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
import { type BallExport, type WallExport, type GoalExport, vector3ToJson } from "$lib/index";

const goalPostDiameter = 0.5;
const middle = new Vector3(0.5, 0.25, 0.5);

export class EditorObject
{
	private position:			Vector3;
	private surfaceNormal:		Vector3;
	private orientationUp:		Vector3;
	private orientationDown:	Vector3;
	private color:				Color3;
	private type:				string;
	private diameter:			number;
	private dimensions:			Vector3;
	private mesh:				Mesh;
	private physicsAggregate:	PhysicsAggregate;
	private post1:				Mesh;
	private post2:				Mesh;
	private material:			StandardMaterial;

	constructor(type: string, position: Vector3, surfaceNormal: Vector3,
		 color: Color3, scene: Scene, dimensions?: Vector3, diameter?: number)
	{
		this.position = position;
		this.surfaceNormal = surfaceNormal;
		this.orientationUp = rotateVector(surfaceNormal, Math.PI / 2);
		this.orientationDown = rotateVector(surfaceNormal, -Math.PI / 2);
		this.color = color;
		this.type = type;

		const mat = new StandardMaterial('objectMat', scene);
		
		mat.diffuseColor = color;
		mat.maxSimultaneousLights = 16;
		this.material = mat;

		switch (type)
		{
			case 'sphere':
				if (diameter == undefined)
				{
					throw new Error('Diameter must be defined for sphere type');
				}
				this.diameter = diameter;
				this.mesh = MeshBuilder.CreateSphere('sphere', {diameter: diameter}, scene);
				this.mesh.position = position;
				this.physicsAggregate = new PhysicsAggregate(
					this.mesh,
					PhysicsShapeType.SPHERE,
					{ mass: 0, restitution: 0.5 },
					scene
				);
				this.mesh.material = this.material;
				break;
			case 'wall':
			case 'goal':
				if (dimensions == undefined)
				{
					throw new Error(`Dimensions must be defined for ${type} type`);
				}
				this.dimensions = dimensions;
				this.mesh = MeshBuilder.CreateBox('box', {width: dimensions.x, height: dimensions.y, depth: dimensions.z}, scene);
				this.mesh.position = position;
				this.physicsAggregate = new PhysicsAggregate(
					this.mesh,
					PhysicsShapeType.BOX,
					{ mass: 0, restitution: 1 },
					scene
				);
				break;
			default: throw new Error(`Unknown type: ${type}`);
		}
		this.mesh.material = this.material;
		if (this.type == 'goal')
		{
			const directionP1 = this.orientationUp.scale(dimensions.z / 2).add(this.surfaceNormal.scale(0.5));
			const directionP2 = this.orientationDown.scale(dimensions.z / 2).add(this.surfaceNormal.scale(0.5));
			this.post1 = this.createPost(this.position.add(directionP1), scene);
			this.post2 = this.createPost(this.position.add(directionP2), scene);
		}
		this.mesh.rotate(Vector3.Up(), Math.atan2(surfaceNormal.x, surfaceNormal.z) + Math.PI / 2);
		// this.mesh.rotate(Vector3.Up(), Math.atan2(surfaceNormal.x, surfaceNormal.z) + Math.PI / 2);
		// this.rotate(Math.atan2(surfaceNormal.x, surfaceNormal.z) + Math.PI / 2);
	}
	
	createPost(position: Vector3, scene: Scene): Mesh
	{
		const post = MeshBuilder.CreateCylinder('goalPost', { diameter: goalPostDiameter, height: this.dimensions.y }, scene);
		post.position = position;
		post.material = this.material;
	
		new PhysicsAggregate(
			post,
			PhysicsShapeType.CYLINDER,
			{ mass: 0, restitution: 1 },
			scene
		);
		return post;
	}

	changePosition(posChange: Vector3)
	{
		this.position = this.position.add(posChange);
		this.mesh.position = this.mesh.position.add(posChange);
		if (this.type == 'goal')
		{
			this.post1.position = this.post1.position.addInPlace(posChange);
			this.post2.position = this.post2.position.addInPlace(posChange);
		}
	}

	moveToPosition(newPos: Vector3)
	{
		const posChange = newPos.subtract(this.position);
		
		this.changePosition(posChange);
	}

	rotate(angle: number)
	{
		this.orientationDown = rotateVector(this.orientationDown, -angle);
		this.orientationUp = rotateVector(this.orientationUp, -angle);
		this.surfaceNormal = rotateVector(this.surfaceNormal, -angle);
		this.mesh.rotate(Vector3.Up(), angle);

		if (this.type == 'goal')
		{
			const directionP1 = this.orientationUp.scale(this.dimensions.z / 2).add(this.surfaceNormal.scale(0.5));
			const directionP2 = this.orientationDown.scale(this.dimensions.z / 2).add(this.surfaceNormal.scale(0.5));
			this.post1.position = this.position.add(directionP1);
			this.post2.position = this.position.add(directionP2);
		}
	}

	increaseSize(maxSize: number)
	{
		switch (this.type)
		{
			case 'wall': this.dimensions.z = Math.min(this.dimensions.z + 1, maxSize); break;
			case 'goal':
				this.dimensions.z += 1;
				if (this.dimensions.z > maxSize)
				{
					this.dimensions.z = maxSize;
					return;
				}
				this.post1.position = this.post1.position.add(this.orientationUp.scale(0.5));
				this.post2.position = this.post2.position.add(this.orientationDown.scale(0.5));
				break;
			default: return;
		}
		this.mesh.scaling.z = this.dimensions.z / this.mesh.getBoundingInfo().boundingBox.extendSize.z / 2;
	}

	decreaseSize()
	{
		switch (this.type)
		{
			case 'wall': this.dimensions.z = Math.max(this.dimensions.z - 1, 1); break;
			case 'goal':
				this.dimensions.z -= 1;
				if (this.dimensions.z < 1)
				{
					this.dimensions.z = 1;
					return;
				}
				this.post1.position = this.post1.position.add(this.orientationDown.scale(0.5));
				this.post2.position = this.post2.position.add(this.orientationUp.scale(0.5));
				break;
			default: return;
		}
		this.mesh.scaling.z = this.dimensions.z / this.mesh.getBoundingInfo().boundingBox.extendSize.z / 2;
	}

	getMesh(): Mesh
	{
		return this.mesh;
	}

	getPost1Mesh(): Mesh
	{
		if (this.type != 'goal')
		{
			throw new Error('This object is not a goal');
		}
		return this.post1;
	}

	getPost2Mesh(): Mesh
	{
		if (this.type != 'goal')
		{
			throw new Error('This object is not a goal');
		}
		return this.post2;
	}

	objType(): string
	{
		return this.type;
	}

	clone(scene: Scene): EditorObject
	{
		const copy = new EditorObject
		(
			this.type,
			this.position.clone(),
			this.surfaceNormal.clone(),
			this.color,
			scene,
			this.dimensions ? this.dimensions.clone() : undefined,
			this.diameter ? this.diameter : undefined
		);
		copy.moveToPosition(middle);
		return copy;
	}

	getBallExport(): BallExport
	{
		const data =
		{
			type: this.type,
			location: vector3ToJson(this.position),
			diameter: this.diameter
		};
		return data;
	}

	getWallExport(): WallExport
	{
		const data =
		{
			type: this.type,
			location: vector3ToJson(this.position),
			dimensions: vector3ToJson(this.dimensions),
			surfaceNormal: vector3ToJson(this.surfaceNormal)
		};
		return data;
	}

	getGoalExport(): GoalExport
	{
		const data = 
		{
			type: this.type,
			location: vector3ToJson(this.position),
			post1: vector3ToJson(this.post1.position),
			post2: vector3ToJson(this.post2.position),
			dimensions: vector3ToJson(this.dimensions),
			surfaceNormal: vector3ToJson(this.surfaceNormal)
		};
		return data;
	}

	getPosition(): Vector3
	{
		return this.position;
	}

	dispose()
	{
		this.mesh.dispose();
		this.physicsAggregate.dispose();
		if (this.type == 'goal')
		{
			this.post1.dispose();
			this.post2.dispose();
		}
	}
}

export function rotateVector(vector: Vector3, angle: number): Vector3
{
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const x = vector.x * cos - vector.z * sin;
	const z = vector.x * sin + vector.z * cos;
	return new Vector3(x, vector.y, z);
}
