import { Paddle, Wall, Ball, Goal, Game, Colors, ColorMap } from '../game/index';
import { Editor } from './editor';
import { Button } from '@babylonjs/gui';
import HavokPhysics from '@babylonjs/havok';

const paddles: Paddle[] = [];
const balls: Ball[] = [];
const walls: Wall[] = [];
const goals: Goal[] = [];

const buttonLoadMap = Button.CreateSimpleButton('load', 'Load Map');
const buttonSaveMap = Button.CreateSimpleButton('save', 'Save Map');
const buttonReset = Button.CreateSimpleButton('reset', 'Reset');

export async function getPhysics(): Promise<any>
{
	return await HavokPhysics({locateFile: (file: string) => `/${file}`});
}

async function startEditor()
{
	const havokInstance = await getPhysics();

	if (havokInstance.isError == true)
	{
		console.error('Failed to initialize HavokPhysics.');
		return;
	}
	const editor = new Editor(havokInstance);

	editor.start();
}

startEditor();