<!-- src/routes/pong/+page.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	onMount(async () =>
	{
		const { startEditor } = await import('$lib/');
		await startEditor();
	});
	onDestroy(async () =>
	{
		const { destroyEditor } = await import('$lib/');
		await destroyEditor();
	});
</script>

<canvas id="editorCanvas" width="1920" height="1080"></canvas>