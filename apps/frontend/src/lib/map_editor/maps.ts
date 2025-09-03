import { EditorObject } from '$lib/index';

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
	dimensions: { x: number; y: number; z: number };
	surfaceNormal: { x: number; y: number; z: number };
}

export interface GoalExport
{
	type: string;
	location: { x: number; y: number; z: number };
	dimensions: { x: number; y: number; z: number };
	surfaceNormal: { x: number; y: number; z: number };
}

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
	const mapsContainer = document.createElement('div');
	let selectedMap: string | null = null;
	let selectedBtn: HTMLButtonElement | null = null;
	
	listDiv.innerHTML = '';

	mapsContainer.style.display = 'flex';
	mapsContainer.style.flexDirection = 'column';
	mapsContainer.style.alignItems = 'center';
	mapsContainer.style.gap = '4px';
	mapsContainer.style.maxHeight = '320px';
	mapsContainer.style.overflowY = 'auto';

	maps.forEach(map =>
	{
		const btn = document.createElement('button');
		btn.textContent = map;
		btn.style.margin = '0';
		btn.style.width = '100%';
		btn.onclick = () =>
		{
			if (selectedBtn)
			{
				selectedBtn.style.background = '';
			}
			selectedMap = map;
			selectedBtn = btn;
			btn.style.background = '#ffd700';
		};
		mapsContainer.appendChild(btn);
	});

	listDiv.appendChild(mapsContainer);

	const actionsContainer = document.createElement('div');

	actionsContainer.style.display = 'flex';
	actionsContainer.style.justifyContent = 'center';
	actionsContainer.style.gap = '12px';
	actionsContainer.style.marginTop = '16px';

	const cancelBtn = document.createElement('button');

	cancelBtn.textContent = 'Cancel';
	cancelBtn.style.margin = '0';
	cancelBtn.style.background = '#ffd5d5dd';
	cancelBtn.onclick = () => { listDiv.innerHTML = ''; };
	
	const openBtn = document.createElement('button');
	
	openBtn.textContent = 'Open';
	openBtn.style.background = '#ffd5d5dd';
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

	actionsContainer.appendChild(cancelBtn);
	actionsContainer.appendChild(openBtn);
	listDiv.appendChild(actionsContainer);
}

export async function loadMap(): Promise<EditorObject[]>
{
	const response = await fetch('api/maps');
	if (response.ok == true)
	{
		console.log('Fetched map list successfully');
	}
	const maps = await response.json();
	if (!Array.isArray(maps) || maps.length == 0)
	{
		throw new Error('No maps available');
	}
	else
	{
		console.log(`Available maps: ${maps.join(', ')}`);
	}

	return new Promise<any>((resolve, reject) =>
	{
		displayMapList(maps, async (mapName: string) =>
		{
			try
			{
				const mapRes = await fetch(`/maps/${mapName}`);
				console.log(`Fetching map: ${mapName}`);
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

export async function saveMap
(
	balls: EditorObject[],
	walls: EditorObject[],
	goals: EditorObject[],
	dimensions: [number, number]
)
{
	const ballsExport: BallExport[] = balls.map(ball => ball.getBallExport());
	const wallsExport: WallExport[] = walls.map(wall => wall.getWallExport());
	const goalsExport: GoalExport[] = goals.map(goal => goal.getGoalExport());

	if (balls.length == 0)
	{
		alert('Map must contain at least one ball.');
		return;
	}
	if (goals.length < 2)
	{
		alert('Map must contain at least 2 goals.');
		return;
	}
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