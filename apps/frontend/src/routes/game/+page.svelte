<!-- src/routes/game/+page.svelte -->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { ClientGame } from '$lib/index';
  import { type GameState } from '@repo/trpc/src/types/gameState';
  import { trpc } from '$lib/trpc';
  import { isAuthenticated, currentUser } from '$lib/auth/store';

  let canvas: HTMLCanvasElement | null = null;
  let game: ClientGame | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let subscription: { unsubscribe(): void } | null = null;

  $: matchId = Number($page.url.searchParams.get('matchId') ?? 1);

  function resizeCanvas() {
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    if (game != null && typeof (game as any).resize == 'function') {
      (game as any).resize(width, height, dpr);
    }
  }

  const initialState: GameState = {
    matchId: 1,
    status: 'waiting' as const,
    lastUpdate: 0,
    players: [],
    balls: [],
  };

  onMount(async () => {
    if ($isAuthenticated) {
      console.log('Welcome back!', $currentUser.id);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    if ('ResizeObserver' in window && document.documentElement) {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(document.documentElement);
    }

    const { startGame } = await import('$lib');
    if (game == null) {
      try {
        initialState.matchId = matchId;
        game = await startGame('maps/standard2player.map', initialState, $currentUser.id);
      } catch (err) {
        console.warn(`Game ${matchId}) failed to start:`, err);
      }
      subscription = trpc.game.subscribeToGameState.subscribe(
        { matchId: matchId },
        {
          onData: (data) => {
            if (game) game.updateFromServer(data as GameState);
          },
          onError: (err) => console.error('Subscription error', err),
        }
      );
      resizeCanvas();
    }
  });

  onDestroy(async () => {
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('orientationchange', resizeCanvas);
    resizeObserver?.disconnect();
    subscription = null;

    if (game != null) {
      const { destroyGame } = await import('$lib');
      await destroyGame(game);
      game = null;
    }
  });
</script>

<canvas
  id="gameCanvas"
  bind:this={canvas}
  class="block w-screen h-screen touch-none bg-black"
></canvas>
