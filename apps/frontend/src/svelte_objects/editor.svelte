<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    // Here you can put your Babylon editor code, e.g.:
    // import("./map_editor/editor_main").then(mod => mod.initEditor(canvas));
    // For demo:
    const ctx = canvas.getContext("2d");
    ctx!.fillStyle = "#ffe97c";
    ctx!.font = "48px sans-serif";
    ctx!.fillText("Editor Canvas", 100, 100);
  });
</script>

<canvas bind:this={canvas} width="1920" height="1080"
	style="width:100vw;height:100vh;display:block;border:2px solid #ffe97c;background:#000;"></canvas>