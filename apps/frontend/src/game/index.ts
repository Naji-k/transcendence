import { Color3 } from "babylonjs";

export * from './game_objects/ball';
export * from './game_objects/paddle';
export * from './game_objects/wall';
export * from './game_objects/player';
export * from './game_objects/goal';
export * from './game_objects/game';
export * from './game_objects/game_menu';
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