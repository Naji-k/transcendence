import { EditorObject } from '$lib/map_editor/editor_objects/objects';
import { Vector3, Color3 } from '@babylonjs/core';

export async function saveMap(
	balls: EditorObject[],
	walls: EditorObject[],
	goals: EditorObject[],
	dimensions: [number, number])
{
	
}

export function parseMap(map: string): EditorObject[]
{
	const mapItems: EditorObject[] = [];


	return [];
}

async function displayMapList(maps: string[], onOpen: (mapName: string) => void)
{
	const listDiv = document.getElementById('map-list');
	listDiv.innerHTML = '';

	let selectedMap: string | null = null;
	let selectedBtn: HTMLButtonElement | null = null;

	const cancelBtn = document.createElement('button');
	cancelBtn.textContent = 'Cancel';
	cancelBtn.onclick = () => { listDiv.innerHTML = ''; };
	listDiv.appendChild(cancelBtn);
	const openBtn = document.createElement('button');
	openBtn.textContent = 'Open';
	openBtn.style.margin = '10px';
	openBtn.onclick = () =>
	{
		if (selectedMap)
		{
			listDiv.innerHTML = '';
			onOpen(selectedMap);
		}
		else
		{
			openBtn.textContent = 'No map selected.';
			setTimeout(() => { openBtn.textContent = 'Open'; }, 1200);
		}
	};
	listDiv.appendChild(openBtn);

	maps.forEach(map =>
	{
		const btn = document.createElement('button');
		btn.textContent = map;
		btn.style.margin = '4px';
		btn.onclick = () =>
		{
			if (selectedBtn) selectedBtn.style.background = '';
			selectedMap = map;
			selectedBtn = btn;
			btn.style.background = '#ffd700';
		};
		listDiv.appendChild(btn);
	});
}

export async function loadMap(): Promise<EditorObject[]>
{
	const response = await fetch('/maps');
	const maps = await response.json();

	return new Promise<EditorObject[]>((resolve, reject) =>
	{
		displayMapList(maps, async (mapName: string) =>
		{
			try
			{
				const mapRes = await fetch(`/maps/${mapName}`);
				const mapText = await mapRes.text();
				const objects = parseMap(mapText);
				resolve(objects);
			}
			catch (error)
			{
				reject(error);
			}
		});
	});
}