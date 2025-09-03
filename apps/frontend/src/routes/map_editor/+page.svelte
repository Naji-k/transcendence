<!-- src/routes/pong/+page.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '$lib/index';

	let editor: Editor;

	onMount(async () =>
	{
		const { startEditor, restartEditor } = await import('$lib');
		if (editor == null)
		{
			editor = await startEditor();
		}
		else
		{
			editor = await restartEditor(editor);
		}
	});

	onDestroy(async () =>
	{
		const { destroyEditor } = await import('$lib');
		await destroyEditor(editor);
	});
</script>
<canvas id="editorCanvas" width="1920" height="1080"></canvas>
<div id="map-list"></div>
<style>
	#map-list
	{
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		min-width: 240px;
		max-width: 90vw;
		background: rgba(250, 252, 252, 0.95);
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0,0,0,0.30);
		padding: 24px 20px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		font-size: 1.5rem;
	}
	
	#map-list:empty { display: none; }

	#map-list button
	{
		font-size: 1rem;
		padding: 8px 0;
		border-radius: 6px;
		border: none;
		background: #444;
		color: #fff;
		cursor: pointer;
		transition: background 0.2s;
	}

	#map-list button:hover
	{
		background: #666;
	}

	#map-list button[selected]
	{
		color: #ffd700;
		font-weight: bold;
	}
</style>