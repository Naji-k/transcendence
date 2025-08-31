import { Vector3, Color3, Mesh, MeshBuilder, Scene, StandardMaterial, 
		 Matrix, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";

const goalPostDiameter = 0.5;

export class EditorObject
{
	private position:			Vector3;
	private surfaceNormal:		Vector3;
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
				break;
			case 'wall':
				if (dimensions == undefined)
				{
					throw new Error('Dimensions must be defined for wall type');
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
			case 'goal':
				if (dimensions == undefined)
				{
					throw new Error('Dimensions must be defined for wall type');
				}
				this.dimensions = dimensions;
				this.mesh = MeshBuilder.CreateBox('box', {width: dimensions.x, height: dimensions.y, depth: dimensions.z}, scene);
				this.mesh.position = position;
				this.physicsAggregate = new PhysicsAggregate(
					this.mesh,
					PhysicsShapeType.BOX,
					{ mass: 0, restitution: 0.5 },
					scene
				);
				const directionP1 = rotateVector(this.surfaceNormal, Math.PI / 2).scale(this.dimensions.z / 2);
				const directionP2 = rotateVector(this.surfaceNormal, -Math.PI / 2).scale(this.dimensions.z / 2);
				directionP1.addInPlace(this.surfaceNormal.scale(0.5));
				directionP2.addInPlace(this.surfaceNormal.scale(0.5));
				this.post1 = this.createPost(this.position.add(directionP1), scene);
				this.post2 = this.createPost(this.position.add(directionP2), scene);
				break;
			default: throw new Error(`Unknown type: ${type}`);
		}
	}
	
	private createPost(position: Vector3, scene: Scene): Mesh
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

	rotate(angle: number)
	{
		const rotationMatrix = Matrix.RotationY(angle);

		this.surfaceNormal = Vector3.TransformNormal(this.surfaceNormal, rotationMatrix).normalize();
		this.mesh.rotate(Vector3.Up(), angle);
		
		if (this.type == 'goal')
		{
			const post1dir = this.post1.position.subtract(this.position);
			const post2dir = this.post2.position.subtract(this.position);
			this.post1.position = this.position.add(Vector3.TransformNormal(post1dir, rotationMatrix));
			this.post2.position = this.position.add(Vector3.TransformNormal(post2dir, rotationMatrix));
		}
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

}

export function rotateVector(vector: Vector3, angle: number): Vector3
{
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = vector.x * cos - vector.z * sin;
    const z = vector.x * sin + vector.z * cos;
    return new Vector3(x, vector.y, z);
}
