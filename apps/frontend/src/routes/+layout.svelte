<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { authLoaded, isAuthenticated, initAuthStore } from '$lib/auth/store';
  import SignInPage from './signin/+page.svelte'

  const favicon = 'favicon.svg';

  onMount(async () => {
	await initAuthStore();
  });

  let { children } = $props();

  //I think we only need to protect certain routes
//   const publicRoutes = ['/', '/signin', '/signup'];
  const protectedRoutes = ['/profile', '/game', '/game_lobby', '/tournament', '/tournament_brackets', '/welcome'];
//   let isPublicRoute = $derived(publicRoutes.some(route => page.url.pathname.startsWith(route)));
  let isProtectedRoute = $derived(protectedRoutes.some(route => page.url.pathname.startsWith(route)));

  $effect(() => {
	if ($authLoaded && isProtectedRoute && !$isAuthenticated) {
		goto('/signin');
	}
  })

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
