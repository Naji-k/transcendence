<!-- src/routes/pong/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
  
	onMount(async () => {
	  const { startGame } = await import('$lib/');
	  await startGame();
	});
  </script>
  
  <canvas id="gameCanvas" width="1280" height="720"></canvas>
  <input id="mapInput" type="file" accept=".map" />
  