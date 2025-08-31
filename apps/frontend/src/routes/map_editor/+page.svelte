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
