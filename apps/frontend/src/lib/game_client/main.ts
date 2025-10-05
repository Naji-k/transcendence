import { ClientGame, type GameState } from '../index';

export async function startGame(map: string, gameState: GameState): Promise<ClientGame>
{
	if (gameState == null || gameState === undefined)
	{
		return new Promise<ClientGame>((resolve, reject) => {reject('GameState does not exist');});
	}
	const game = new ClientGame(gameState);
	
	await game.loadMap(map);
	game.run();
	return game;
}
