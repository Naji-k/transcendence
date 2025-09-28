<script lang="ts">
  import { onMount } from "svelte";
  import { trpc } from "$lib/trpc";

  let name: string = "";
  let limit: number = 4;
  let tournaments: any[] = [];
  let loading = true;

  // Map tournamentName -> players array
  let tournamentPlayersMap: Record<string, any[]> = {};

  const userId = 1; // Replace with actual auth ID

  async function fetchTournaments() {
    loading = true;
    try {
      tournaments = await trpc.tournament.list.query();
      // Preload players for all tournaments
      for (const t of tournaments) {
        await fetchPlayers(t.name);
      }
    } finally {
      loading = false;
    }
  }

  async function fetchPlayers(tournamentName: string) {
    try {
      const players = await trpc.tournament.getPlayers.query({ name: tournamentName });
      tournamentPlayersMap[tournamentName] = players;
    } catch (err) {
      tournamentPlayersMap[tournamentName] = [];
      console.error(`Failed to fetch players for ${tournamentName}`, err);
    }
  }

  onMount(fetchTournaments);

  async function handleCreate() {
    if (!name) return;
    console.log("Creating tournament with:", { name, limit, typeofLimit: typeof limit });

    try {
      // Call the router without ownerId; the backend uses ctx.userToken
      await trpc.tournament.create.mutate({
        name,
        playerLimit: limit,
      });

      // Reset form
      name = "";
      limit = 4;

      // Refresh tournament list
      await fetchTournaments();
    } catch (err) {
      console.error("Failed to create tournament:", err);
      alert("Failed to create tournament. Check console for details.");
    }
  }

  async function joinTournament(tournamentName: string) {
    await trpc.tournament.join.mutate({
      name: tournamentName,
      playerId: userId,
    });
    await fetchTournaments();
  }

  async function startTournament(tournamentName: string) {
    await trpc.tournament.start.mutate({ name: tournamentName });
    await fetchTournaments();
  }
</script>

<div class="flex flex-col items-center min-h-screen w-full font-['Press_Start_2P'] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-8 text-center">
  <h1 class="text-6xl text-cyan-400 drop-shadow-lg mb-8">TOURNAMENTS</h1>

  <!-- Create Tournament Form -->
  <div class="bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl shadow-xl p-6 flex flex-col space-y-4 max-w-md w-full mb-12">
    <input type="text" placeholder="Tournament name" bind:value={name} class="p-3 rounded-lg text-black text-sm" required />
    <select bind:value={limit} class="p-3 rounded-lg text-black text-sm">
      <option value={2}>2 Players</option>
      <option value={4}>4 Players</option>
      <option value={8}>6 Players</option>
    </select>
    <button class="bg-black text-cyan-400 py-3 rounded-xl shadow-md hover:scale-105 transition" on:click={handleCreate}>Create Tournament</button>
  </div>

  <!-- Tournament List -->
  <div class="grid gap-6 w-full max-w-2xl">
    {#if loading}
      <p class="text-cyan-300">Loading tournaments...</p>
    {:else if tournaments.length > 0}
      {#each tournaments as t}
        <div class="bg-gradient-to-r from-[#1e293b] to-[#334155] rounded-2xl shadow-lg p-6 text-cyan-200 flex flex-col gap-3">
          <div class="flex justify-between items-center">
            <div class="flex flex-col text-left">
              <span class="text-xl text-cyan-400">{t.name}</span>
              <span class="text-sm">Limit: {t.playerLimit}</span>
            </div>
            <div class="flex gap-2 items-center">
              <span class="px-4 py-2 rounded-lg text-xs font-bold
                {t.status === 'waiting' ? 'bg-yellow-500 text-black' : ''}
                {t.status === 'ready' ? 'bg-blue-500 text-black' : ''}
                {t.status === 'ongoing' ? 'bg-green-500 text-black' : ''}
                {t.status === 'completed' ? 'bg-gray-500 text-white' : ''}">
                {t.status.toUpperCase()}
              </span>

              {#if t.status === 'waiting'}
                <button class="bg-black text-cyan-400 px-3 py-1 rounded-lg text-xs shadow-md hover:scale-105 transition" on:click={() => joinTournament(t.name)}>Join</button>
              {/if}

              {#if t.status === 'ready'}
                <button class="bg-black text-green-400 px-3 py-1 rounded-lg text-xs shadow-md hover:scale-105 transition" on:click={() => startTournament(t.name)}>Start</button>
              {/if}
            </div>
          </div>

          <!-- Players List -->
          <div class="bg-[#0f2027] rounded-xl p-3 text-left text-sm text-cyan-300">
            <span class="font-bold">Players:</span>
            {#if tournamentPlayersMap[t.name]?.length > 0}
              <ul class="list-disc ml-5">
                {#each tournamentPlayersMap[t.name] as player}
                  <li>{player.playerId} {player.alias || ''}</li>
                {/each}
              </ul>
            {:else}
              <span>None yet</span>
            {/if}
          </div>
        </div>
      {/each}
    {:else}
      <p class="text-cyan-300">No tournaments yet. Create one above!</p>
    {/if}
  </div>
</div>
