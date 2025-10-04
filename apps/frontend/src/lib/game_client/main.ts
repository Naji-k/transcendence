import { ClientGame, type GameState } from '../index';

export async function startGame(map: string, gameState: GameState): Promise<ClientGame>
{
	const game = new ClientGame(gameState);
	
	await game.loadMap(map);
	game.run();
	return game;
}
