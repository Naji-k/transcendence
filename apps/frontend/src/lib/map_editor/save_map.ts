import { EditorObject } from '$lib/index';
import { Vector3, Color3 } from '@babylonjs/core';
import Editor from '../../svelte_objects/editor.svelte';

export function parseMap(inputFile: string): any
{
	const map = JSON.parse(inputFile);

	if (!map.dimensions || !map.balls || !map.walls || !map.goals)
	{
		throw new Error('Invalid map format');
	}
	return map;
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

export interface BallExport
{
	type: string;
	location: { x: number; y: number; z: number };
	diameter: number;
}

export interface WallExport
{
	type: string;
	location: { x: number; y: number; z: number };
	dimensions: { width: number; height: number; depth: number };
	surfaceNormal: { x: number; y: number; z: number };
}

export interface GoalExport
{
	type: string;
	location: { x: number; y: number; z: number };
	dimensions: { width: number; height: number; depth: number };
	surfaceNormal: { x: number; y: number; z: number };
}

export async function saveMap(
	balls: EditorObject[],
	walls: EditorObject[],
	goals: EditorObject[],
	dimensions: [number, number]
	)
	{
	const ballsExport: BallExport[] = balls.map(ball => ball.getBallExport());
	const wallsExport: WallExport[] = walls.map(wall => wall.getWallExport());
	const goalsExport: GoalExport[] = goals.map(goal => goal.getGoalExport());
	const mapExport =
	{
		dimensions:
		{
			width: dimensions[0],
			height: dimensions[1]
		},
		balls: ballsExport,
		walls: wallsExport,
		goals: goalsExport
	};

	const json = JSON.stringify(mapExport, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "map.map";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}