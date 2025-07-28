import { Game } from './index';
import { CreateStreamingSoundAsync, CreateAudioEngineAsync } from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const keys: Record<string, boolean> = {};

export async function getPhysics(): Promise<any>
{
	const havok = await HavokPhysics(
	{
		locateFile: (file: string) => `/${file}`
	});
	return havok;
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

	const audioEngine = await CreateAudioEngineAsync();
	const frogs = await CreateStreamingSoundAsync("music", "/sounds/frogs.mp3");
	await audioEngine.unlockAsync();
	frogs.play()
	game.run();
}

startGame();