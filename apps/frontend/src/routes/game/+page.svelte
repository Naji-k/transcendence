<!-- src/routes/game/+page.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
  
	onMount(async () =>
	{
		const { startGame } = await import('$lib');
		await startGame();
	});
	onDestroy(async () =>
	{
		const { destroyGame } = await import('$lib');
		await destroyGame();
	});
</script>

<canvas id="gameCanvas" width="1920" height="1080"></canvas>
<input id="mapInput" type="file" accept=".map" />
