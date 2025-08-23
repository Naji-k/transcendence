<script lang="ts">
  import '../app.css';
  // import favicon from '$lib/assets/favicon.svg';
  const favicon = '/favicon.svg'; // Place favicon.svg in static/ folder

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
