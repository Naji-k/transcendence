export interface MapObject
{
	type: string;
	position: { x: number; y: number; z: number };
	dimensions: { width: number; height: number; depth: number };
	surfaceNormal: { x: number; y: number; z: number };
	color: { r: number; g: number; b: number; a: number };
}