import { Color3, Vector3 } from "@babylonjs/core";

export * from './game/game_objects/ball';
export * from './game/game_objects/paddle';
export * from './game/game_objects/wall';
export * from './game/game_objects/player';
export * from './game/game_objects/goal';
export * from './game/game_objects/game';
export * from './game/game_objects/game_menu';
export * from './game/initialize';
export * from './game/main';
export * from './map_editor/editor_objects/editor';
export * from './map_editor/main';
export * from './map_editor/maps';
export * from './map_editor/editor_objects/objects';

export const Colors: { name: string, color: Color3 }[] =
[
	{ name: 'red', color: new Color3(1, 0, 0) },
	{ name: 'blue', color: new Color3(0, 0, 1) },
	{ name: 'green', color: new Color3(0, 1, 0) },
	{ name: 'yellow', color: new Color3(1, 1, 0) },
	{ name: 'purple', color: new Color3(0.5, 0, 0.5) },
	{ name: 'orange', color: new Color3(1, 0.5, 0) }
]

export const ColorMap: Record<string, Color3> = 
	Object.fromEntries(Colors.map(entry => [entry.name, entry.color]));

export function dot2D(a: Vector3, b: Vector3): number
{
	return a.x * b.x + a.z * b.z;
}

export function jsonToVector2(obj: { width: number; height: number }): [number, number]
{
	return [obj.width, obj.height];
}

export function jsonToVector3(obj: { x: number; y: number; z: number }): Vector3
{
    return new Vector3(obj.x, obj.y, obj.z);
}

export function vector3ToJson(vec: Vector3): { x: number; y: number; z: number }
{
	return { x: roundNumber(vec.x), y: roundNumber(vec.y), z: roundNumber(vec.z) };
}

export function roundNumber(n: number): number
{
	return Math.round(n * 1000) / 1000;
}