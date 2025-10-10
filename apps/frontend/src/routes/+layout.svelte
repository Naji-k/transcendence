<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { initAuthStore } from '$lib/auth/store';

  // import favicon from '$lib/assets/favicon.svg';
  const favicon = '/favicon.svg'; // Place favicon.svg in static/ folder

  onMount(async () => {
    await initAuthStore();
  });
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
