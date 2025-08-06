import { Color3 } from "babylonjs";

export * from './gameObjects/ball';
export * from './gameObjects/paddle';
export * from './gameObjects/wall';
export * from './gameObjects/player';
export * from './gameObjects/goal';
export * from './gameObjects/game';
export * from './gameObjects/game_menu';
export * from './initialize';
export * from './main';

export enum clr
{
	RED,
	BLUE,
	YELLOW,
	GREEN,
	MAGENTA,
	CYAN
}

export const Colors: Color3[] =
[
	new Color3(1, 0, 0),
	new Color3(0, 0, 1),
	new Color3(1, 1, 0),
	new Color3(0, 1, 0),
	new Color3(1, 0, 1),
	new Color3(0, 1, 1)
];

export const TextColors: string[] =
[
	'Red',
	'Blue',
	'Yellow',
	'Green',
	'Magenta',
	'Cyan'
];