import { Editor } from '$lib/index';
import HavokPhysics from '@babylonjs/havok';

export async function getPhysics(): Promise<any>
{
	return await HavokPhysics({locateFile: (file: string) => `/${file}`});
}

export async function startEditor(): Promise<Editor>
{
	const havokInstance = await getPhysics();

	if (havokInstance.isError == true)
	{
		console.error('Failed to initialize HavokPhysics.');
		return;
	}
	const editor = new Editor(havokInstance);

	editor.start();
	return editor;
}