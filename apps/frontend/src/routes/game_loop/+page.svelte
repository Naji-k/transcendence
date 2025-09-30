<script>
  import { goto } from '$app/navigation';
  import { trpc } from '$lib/trpc';
  import { onMount } from 'svelte';

  // State management
  let games = [];
  let loading = false;
  let error = null;
  let selectedGameId = null;

  // Reactive statements - these update automatically when dependencies change
  $: availableGames = games.filter(game =>
    game.status === 'waiting' && game.playerCount < game.maxPlayers,
  );
  $: readyGames = games.filter(game =>
    game.status === 'ready' && game.playerCount === game.maxPlayers,
  );

  async function fetchGames() {
    try {
      loading = true;
      error = null;
      const result = await trpc.match.list.query();
      console.log(`Fetched games: ${JSON.stringify(result)}`);
      games = result;
    } catch (err) {
      console.error(`Error fetching games: ${err.message}`);
      error = `Failed to load games: ${err.message}`;
    } finally {
      loading = false;
    }
  }

  async function createGame() {
    try {
      error = null;
      console.log('Creating game...');
      const result = await trpc.match.create.mutate({
        max_players: 2,
      });
      console.log(`Game created: ${JSON.stringify(result)}`);
      await fetchGames(); // Refresh the games list
    } catch (err) {
      console.error(`Error creating game: ${err.message}`);
      error = `Failed to create game: ${err.message}`;
    }
  }

  async function joinGame(gameId) {
    try {
      error = null;
      console.log(`Joining game ${gameId}...`);
      const result = await trpc.match.joinGame.mutate({ matchId: gameId });
      console.log(`Joined game: ${JSON.stringify(result)}`);
      await fetchGames(); // Refresh the games list
    } catch (err) {
      console.error(`Error joining game: ${err.message}`);
      error = `Failed to join game: ${err.message}`;
    }
  }

  async function startGame(gameId) {
    try {
      error = null;
      console.log(`Starting game ${gameId}...`);
      await trpc.game.initializeMatch.mutate({ matchId: gameId });
      await goto(`/game?matchId=${gameId}`);
    } catch (err) {
      console.error(`Error starting game: ${err.message}`);
      error = `Failed to start game: ${err.message}`;
    }
  }

  onMount(() => {
    fetchGames();
  });
</script>

<!-- Main Container -->
<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Header Section -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Game Lobby</h1>
      <p class="text-lg text-gray-600">Create or join a multiplayer tournament game</p>
    </div>

    <!-- Error Alert -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Actions Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          on:click={createGame}
          disabled={loading}
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create New Game
        </button>

        <button
          on:click={fetchGames}
          disabled={loading}
          class="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh Games'}
        </button>
      </div>
    </div>

    <!-- Games Table Section -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Available Games</h2>
      </div>

      {#if loading}
        <!-- Loading State -->
        <div class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading games...</p>
        </div>
      {:else if games.length === 0}
        <!-- Empty State -->
        <div class="p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No games available</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new game.</p>
        </div>
      {:else}
        <!-- Games Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            {#each games as game}
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">Game #{game.id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm text-gray-900">
                      {game.playerCount}/{game.maxPlayers}
                    </div>
                    <div class="ml-2">
                      {#if game.playerCount === game.maxPlayers}
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Full
                          </span>
                      {:else}
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Open
                          </span>
                      {/if}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      {game.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                       game.status === 'ready' ? 'bg-green-100 text-green-800' :
                       game.status === 'playing' ? 'bg-blue-100 text-blue-800' :
                       'bg-gray-100 text-gray-800'}">
                      {game.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    {#if game.playerCount < game.maxPlayers && game.status === 'waiting'}
                      <button
                        on:click={() => joinGame(game.id)}
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        Join Game
                      </button>
                    {/if}
                    {#if game.playerCount === game.maxPlayers}
                      <button
                        on:click={() => startGame(game.id)}
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                      >
                        Start Game
                      </button>
                    {/if}

                    {#if game.status === 'playing'}
                        <span class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500">
                          In Progress
                        </span>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

  </div>
</div>