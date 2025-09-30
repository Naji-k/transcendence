import { ServerGame, GameState } from './index';
import { GameStateManager } from './game-state-manager';
import path  from 'path';
import fs from 'fs';

/**
 * @returns a Promise that resolves to the HavokPhysics instance 
 */
async function getPhysics(): Promise<any> {
	const HavokPhysics = (await import("@babylonjs/havok")).default;
  
	const wasmPath = path.resolve(
	  __dirname,
	  "../../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm"
	);
	const wasmBinary = fs.readFileSync(wasmPath);
  
	return await HavokPhysics({
	  wasmBinary,
	});
  }
/**
 * Utility function to load a file and return its text content.
 * @param gameState 
 * @param gameStateManager 
 * @param map Optional path to the map file
 * @returns 
 */
export async function startGame(gameState: GameState, gameStateManager: GameStateManager, map?: string): Promise<ServerGame>
{
	//TODO: make map selection dynamic
	if (map)
	{
		map = path.resolve(__dirname, '../../maps/', map);
	}
	else
	{
		map = '../../maps/standard2player.map';
	}
	const havokInstance = await getPhysics();

	if (!havokInstance) {
		console.error('HavokPhysics instance is not available.');
		return Promise.reject('Physics engine is not initialized.');
	}
	const game = new ServerGame(havokInstance, gameState, gameStateManager); // Pass the gameStateManager instance;
	
	await game.loadMap(map);
	game.run();
	return game;
}