import { ServerGame, GameState } from './index';
import { GameStateManager } from './game-state-manager';
import HavokPhysics from '@babylonjs/havok';
import path from 'path';
import fs from 'fs';

/**
* @returns a Promise that resolves to the HavokPhysics instance 
*/

async function getPhysics(): Promise<any>
{
	const wasmPath = path.resolve(
	__dirname,
	"../../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm"
	);
	const buf = fs.readFileSync(wasmPath);
	const wasmBinary = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

	return await HavokPhysics({ wasmBinary});
}

// GPT generated

// async function getPhysics(): Promise<any>
// {
// 	const wasmPath = path.resolve(
// 		__dirname,
// 		'../../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm'
// 	);
// 	const wasmFileUrl = pathToFileURL(wasmPath).toString();

// 	// Monkey-patch global fetch to support file:// URLs in Node.js
// 	// If Havok calls fetch(file://...), this will let it load the WASM from disk.
// 	if (typeof (globalThis as any).fetch != 'function' || !( (globalThis as any).fetch as any).__patchedForFileProtocol)
// 	{
// 		const originalFetch = (globalThis as any).fetch;
// 		(globalThis as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) =>
// 		{
// 			let urlStr: string;
// 			if (typeof input === 'string')
// 			{
// 				urlStr = input;
// 			}
// 			else if (input instanceof URL)
// 			{
// 				urlStr = input.toString();
// 			}
// 			else if (typeof input === 'object' && 'url' in input)
// 			{
// 				urlStr = (input as any).url;
// 			}
// 			else
// 			{
// 				urlStr = String(input);
// 			}

// 			// Handle file:// by reading from disk
// 			if (urlStr.startsWith('file://'))
// 			{
// 				const filePath = urlStr.slice('file://'.length);
// 				const buffer = await fs.readFile(filePath);

// 				// Return a minimal Response-like object that Havok's loader can use
// 				return {
// 					ok: true,
// 					status: 200,
// 					arrayBuffer: async () => buffer.buffer ? buffer.buffer : buffer,
// 					text: async () => buffer.toString('utf8'),
// 				} as any;
// 			}

// 			if (originalFetch)
// 			{
// 				return originalFetch(input as any, init);
// 			}
// 			throw new Error(`No fetch available to handle URL: ${urlStr}`);
// 		};
// 		// Mark as patched so we don't override multiple times
// 		((globalThis as any).fetch as any).__patchedForFileProtocol = true;
// 	}
// 	return await HavokPhysics({ locateFile: () => wasmFileUrl});
// }

/**
 * Utility function to load a file and return its text content.
 * @param gameState 
 * @param gameStateManager 
 * @param map Optional path to the map file
 * @returns 
 */
export async function startGame(gameState: GameState, gameStateManager: GameStateManager, maxPlayers: number): Promise<ServerGame>
{

	const map = `../../maps/standard${maxPlayers}player.map`;	
	
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