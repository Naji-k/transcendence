import { Game } from './index';
import HavokPhysics from '@babylonjs/havok';

export async function getPhysics(): Promise<any>
{
	return await HavokPhysics({locateFile: (file: string) => `/${file}`});
}
	
async function startGame()
{
	const havokInstance = await getPhysics();

	if (havokInstance.isError == true)
	{
		console.error('Failed to initialize HavokPhysics.');
		return;
	}
	const game = new Game(havokInstance);
	
	await game.loadMap('crazy1v1.map');
	game.run();
}

startGame();