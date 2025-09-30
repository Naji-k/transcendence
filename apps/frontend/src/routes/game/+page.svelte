<!-- src/routes/game/+page.svelte -->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { ClientGame } from '$lib/index';
  import { type GameState } from '@repo/trpc/src/types/gameState';
  import { trpc } from '$lib/trpc';

  let canvas: HTMLCanvasElement | null = null;
  let game: ClientGame | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let subscription: { unsubscribe(): void } | null = null;
  const upKeys = ['w', 'ArrowUp', 'd', 'ArrowRight'];
  const downKeys = ['s', 'ArrowDown', 'a', 'ArrowLeft'];

  $: matchId = Number($page.url.searchParams.get('matchId') ?? 1);

  function keyToAction(key: string): number {
    const up = upKeys.includes(key);
    const down = downKeys.includes(key);
    return Number(up) - Number(down);
  }

  function playerInput(event: KeyboardEvent) {
    if (game != null) {
      if (event.type === 'keydown') {
        try {
          trpc.game.sentPlayerAction.mutate({
            matchId: matchId,
            action: keyToAction(event.key).toString() as '1' | '0' | '-1',
          });
        } catch (err) {
          console.error('Error handling key down:', err);
        }
      } else if (event.type === 'keyup') {
        try {
          trpc.game.sentPlayerAction.mutate({
            matchId: matchId,
            action: '0',
          });
        } catch (err) {
          console.error('Error handling key up:', err);
        }
      }
      event.preventDefault();
    }
  }
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
    lastUpdate: Date.now(),
    players: [],
    balls: [],
  };

  onMount(async () => {
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
        game = await startGame('maps/standard2player.map', initialState);
      } catch (err) {
        console.warn(
          'startGame(canvas, map) failed — falling back to startGame(map):',
          err
        );
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

<!-- Tailwind classes: make the canvas fill the viewport layout-wise -->
<canvas
  id="gameCanvas"
  bind:this={canvas}
  class="block w-screen h-screen touch-none bg-black"
></canvas>
<svelte:window on:keydown={playerInput} on:keyup={playerInput} />
