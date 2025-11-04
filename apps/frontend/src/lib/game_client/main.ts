import { ClientGame } from './game_objects/client_game';
import { type GameState } from '@repo/trpc/types';

export async function startGame(map: string, gameState: GameState, userId: number): Promise<ClientGame>
{
	console.log('Starting game with map:', map);
	if (gameState == null || gameState === undefined)
	{
		console.log('GameState does not exist');
    	return Promise.reject('GameState does not exist');
	}
	const game = new ClientGame(gameState, userId);
	
	await game.loadMap(map);
	if (gameState.status != 'finished')
	{
		game.run();
	}
	return game;
}
