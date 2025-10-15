<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { authLoaded, initAuthStore } from '$lib/auth/store';

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

{#if $authLoaded}
	{@render children?.()}
{:else}
	<div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mb-4"></div>
      <p class="text-white">Initializing...</p>
    </div>
  </div>
{/if}
