import HavokPhysics from '@babylonjs/havok';
import { ClientGame, type GameState } from '../index';

async function getPhysics(): Promise<any>
{
	return await HavokPhysics({locateFile: (file: string) => `/${file}`});
}

export async function startGame(map: string, gameState: GameState): Promise<ClientGame>
{
	const havokInstance = await getPhysics();

	if (havokInstance.isError == true)
	{
		console.error('Failed to initialize HavokPhysics.');
		return;
	}
	const game = new ClientGame(gameState);
	
	await game.loadMap(map);
	game.run();
	return game;
}
