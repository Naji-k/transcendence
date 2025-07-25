import { Game, Paddle, Ball, Wall, createWalls, createPaddles, createBalls, Player, Goal } from './index';
import HavokPhysics from '@babylonjs/havok';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const keys: Record<string, boolean> = {};

async function getPhysics(): Promise<any>
{
	const havokInstance = await HavokPhysics(
	{
		locateFile: (file: string) =>
		{
			if (file.endsWith('.wasm'))
			{
				return 'dist/HavokPhysics.wasm';
			}
			return file;
		}
	});
	return havokInstance;
}

async function startGame()
{
	window.addEventListener('keydown', (event) => {keys[event.key] = true;});
	window.addEventListener('keyup', (event) => {keys[event.key] = false;});
	const havokInstance = await getPhysics();

	if (!havokInstance)
	{
		console.error("Failed to initialize HavokPhysics.");
		return;
	}
	const game = new Game(havokInstance, canvas);

	await game.loadMap('standard1v1.map');
	game.setKeyInfo(keys);
	game.run();
}

startGame();