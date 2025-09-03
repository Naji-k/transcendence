import fs from 'fs/promises';
import path from 'path';
import { json } from '@sveltejs/kit';

export async function GET()
{
	const mapsDir = path.resolve('static/maps');
	const files = await fs.readdir(mapsDir);
	return json(files.filter(f => f.endsWith('.map')));
}