<!-- src/routes/game/+page.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Game } from '$lib/index';

	let game: Game;
	onMount(async () =>
	{
		const { startGame } = await import('$lib');
		game = await startGame('maps/tragedy.map');
	});
	onDestroy(async () =>
	{
		const { destroyGame } = await import('$lib');
		await destroyGame(game);
	});
</script>

<canvas id="gameCanvas" width="1920" height="1080"></canvas>
<input id="mapInput" type="file" accept=".map" />
