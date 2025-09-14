<script lang="ts">
  import { onMount } from 'svelte';
  import { setAuthToken } from '$lib/trpc'; // function you use to store JWT

  let name = '';

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userName = params.get('name');

    if (token) {
      setAuthToken(token); // store token in localStorage/sessionStorage
      console.log('Token stored:', token);
    }

    if (userName) {
      name = decodeURIComponent(userName);
    }

    //Remove token and name from URL to clean up
    if (token || userName) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  });
</script>

<div class="flex items-center justify-center min-h-screen font-['Press_Start_2P'] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
  <div class="bg-gradient-to-br from-purple-700 to-indigo-900 text-white p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-8 text-center">
    <h1 class="text-4xl text-cyan-400 drop-shadow-lg">Welcome, {name}!</h1>
  </div>
</div>
