<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { trpc } from '$lib/trpc';
  import { currentUser } from '$lib/auth/store';
  import type {
    TournamentBrackets,
    TournamentMatches,
    TournamentRound,
  } from '@repo/trpc/src/types';

  $: tournamentId = Number($page.url.searchParams.get('id')) || 0;
  let bracket: TournamentBrackets | null = null;
  let myActiveMatch: TournamentMatches | null = null;
  let loading = true;
  let error: string | null = null;
  let subs: { unsubscribe(): void } | null = null;

  $: console.log('🏆 Tournament ID:', tournamentId);

  function findMyActiveMatch(
    rounds: TournamentRound[],
    userId: number
  ): TournamentMatches | null {
    for (const round of rounds) {
      const myMatch = round.matches.find(
        (m) =>
          m.id !== null &&
          m.players.some((p) => p.id === userId) &&
          m.victor === null
      );
      if (myMatch) return myMatch;
    }
    return null;
  }

  function isMyMatch(match: TournamentMatches): boolean {
    if (!myActiveMatch || !match.id) return false;
    return myActiveMatch.id === match.id;
  }

  function getOpponent(match: TournamentMatches) {
    if (!$currentUser?.id) return null;
    return match.players.find((p) => p.id !== $currentUser.id) || null;
  }
  async function startGame(gameId: number) {
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

  function handleBracketUpdate(updatedBracket: TournamentBrackets) {
    console.log('📥 Bracket update received ', bracket);

    // Update state
    bracket = updatedBracket;
    myActiveMatch =
      bracket && $currentUser
        ? findMyActiveMatch(bracket.rounds, $currentUser.id)
        : null;
    loading = false;
  }

  function getCurrentRoundName(): string {
    if (!bracket) return '';
    const currentRound = bracket.rounds.find((r) => r.status === 'in_progress');
    return currentRound?.name || '';
  }

  onMount(async () => {
    console.log(`🔌 Subscribing to tournament ${tournamentId}`);
    bracket = trpc.tournament.getBracket.query({ id: tournamentId });

    subs = trpc.tournament.subscribeBracket.subscribe(
      { id: tournamentId },
      {
        onData: (updatedBracket) => {
          handleBracketUpdate(updatedBracket as TournamentBrackets);
          console.log('✅ Subscription data received', updatedBracket);
        },
        onError: (err) => {
          console.error('❌ Subscription error:', err);
          error = err.message;
          loading = false;
        },
      }
    );
  });

  onDestroy(() => {
    if (subs) {
      console.log('🔌 Unsubscribing from tournament');
      subs.unsubscribe();
      subs = null;
    }
  });
</script>

<div
  class="min-h-screen font-['Press_Start_2P'] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] py-8"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {#if error}
      <div
        class="bg-gradient-to-r from-red-900 to-red-700 border-2 border-red-500 rounded-2xl p-4 mb-6 shadow-lg"
      >
        <p class="text-xs text-red-200">{error}</p>
      </div>
    {/if}

    {#if loading}
      <div class="text-center py-20">
        <div
          class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent"
        ></div>
        <p class="mt-4 text-xs text-cyan-300">CONNECTING...</p>
      </div>
    {:else if bracket}
      <!-- Tournament Header -->
      <div class="text-center mb-8">
        <h1
          class="text-4xl sm:text-5xl font-bold text-cyan-400 drop-shadow-lg mb-4"
        >
          {bracket.tournament.name.toUpperCase()}
        </h1>
        <div
          class="flex justify-center gap-6 text-xs text-cyan-300 tracking-wide"
        >
          <span
            class="px-4 py-2 bg-black/30 rounded-lg border border-cyan-400/30"
          >
            STATUS: <strong class="text-cyan-400"
              >{bracket.tournament.status.toUpperCase()}</strong
            >
          </span>
          <span
            class="px-4 py-2 bg-black/30 rounded-lg border border-cyan-400/30"
          >
            PLAYERS: <strong class="text-cyan-400"
              >{bracket.tournament.playerLimit}</strong
            >
          </span>
        </div>
      </div>

      <!-- My Active Match Alert -->
      {#if myActiveMatch && myActiveMatch.status !== 'finished'}
        {@const opponent = getOpponent(myActiveMatch)}
        <div
          class="bg-gradient-to-r from-green-600 to-green-800 border-2 border-green-400 rounded-2xl p-6 mb-8 shadow-2xl"
        >
          <div class="text-center">
            <h2 class="text-xl text-green-100 mb-4">🎮 YOUR MATCH IS READY!</h2>
            <div class="bg-black/40 rounded-xl p-4 mb-4">
              <p class="text-sm text-white mb-2">
                <span class="text-green-400">YOU</span>
                <span class="text-cyan-400 mx-2">VS</span>
                <span class="text-red-400"
                  >{opponent?.userAlias || 'UNKNOWN'}</span
                >
                <span class="text-cyan-400 mx-2">
                  status: {myActiveMatch.status}</span
                >
              </p>
            </div>
            <button
              on:click={() => startGame(myActiveMatch.id)}
              class="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 active:scale-95 shadow-lg transition-transform rounded-xl font-bold text-black text-sm"
            >
              START GAME NOW!
            </button>
          </div>
        </div>
      {/if}

      <!-- Tournament Bracket - Now using rounds from backend! -->
      <div
        class="bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden mb-8"
      >
        <div class="px-6 py-4 border-b-2 border-cyan-400/30">
          <h2 class="text-lg font-bold text-cyan-400 text-center">
            TOURNAMENT BRACKET
          </h2>
        </div>

        <div class="p-6 space-y-8">
          <!-- ✨ Simply render rounds from backend - no calculation! -->
          {#each bracket.rounds as round}
            <div class="space-y-4">
              <!-- Round Header with Status -->
              <div
                class="bg-black/30 rounded-xl p-3 border border-cyan-400/30 flex justify-between items-center"
              >
                <h3 class="text-sm text-cyan-400 font-bold tracking-wider">
                  {round.name}
                </h3>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-cyan-300">
                    {round.matchesCompleted}/{round.totalMatches}
                  </span>
                  <span
                    class="px-2 py-1 rounded text-[10px] font-bold
                      {round.status === 'completed'
                      ? 'bg-green-500 text-black'
                      : round.status === 'in_progress'
                        ? 'bg-cyan-500 text-black'
                        : 'bg-gray-600 text-white'}"
                  >
                    {round.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <!-- Round Matches -->
              <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {#each round.matches as match, i}
                  <div
                    class="bg-black/40 rounded-xl p-4 border-2 transition-all
                      {isMyMatch(match)
                      ? 'border-green-400 bg-green-900/20'
                      : match.status === 'waiting'
                        ? 'border-cyan-400/20 opacity-60'
                        : 'border-cyan-400/40'}"
                  >
                    <!-- Match Number -->
                    <div class="text-[10px] text-cyan-400/70 mb-2">
                      MATCH #{match.id ?? 'TBD'}
                    </div>

                    <!-- Players -->
                    <div class="space-y-2">
                      <!-- Player 1 -->
                      <div
                        class="flex items-center justify-between px-3 py-2 rounded-lg
                          {match.victor?.id === match.players[0]?.id
                          ? 'bg-green-600'
                          : 'bg-purple-900/50'}"
                      >
                        <span
                          class="text-[10px] font-bold {match.victor?.id ===
                          match.players[0]?.id
                            ? 'text-black'
                            : 'text-white'}"
                        >
                          {match.players[0]?.userAlias || 'TBD'}
                        </span>
                        {#if match.victor?.id === match.players[0]?.id}
                          <span class="text-xs">🏆</span>
                        {/if}
                      </div>

                      <!-- VS -->
                      <div
                        class="text-center text-[10px] text-cyan-400 font-bold"
                      >
                        VS
                      </div>

                      <!-- Player 2 -->
                      <div
                        class="flex items-center justify-between px-3 py-2 rounded-lg
                          {match.victor?.id === match.players[1]?.id
                          ? 'bg-green-600'
                          : 'bg-purple-900/50'}"
                      >
                        <span
                          class="text-[10px] font-bold {match.victor?.id ===
                          match.players[1]?.id
                            ? 'text-black'
                            : 'text-white'}"
                        >
                          {match.players[1]?.userAlias || 'TBD'}
                        </span>
                        {#if match.victor?.id === match.players[1]?.id}
                          <span class="text-xs">🏆</span>
                        {/if}
                      </div>
                    </div>

                    <!-- Match Status/Actions -->
                    <div class="mt-3 flex items-center justify-between">
                      <span
                        class="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase
                          {match.status === 'finished'
                          ? 'bg-green-500 text-black'
                          : match.status === 'waiting' ||
                              match.status === 'ready'
                            ? 'bg-cyan-500 text-black'
                            : 'bg-yellow-500 text-black'}"
                      >
                        {match.status}
                      </span>
                    </div>
                    {#if match.status === 'finished' && match.victor}
                      {#if round.name === 'FINALS'}
                        <div
                          class="mt-2 text-center text-[10px] text-yellow-400"
                        >
                          CHAMPION: {match.victor.userAlias}
                        </div>
                      {/if}

                      <div class="mt-2 text-center text-[10px] text-green-400">
                        WINNER: {match.victor.userAlias}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
