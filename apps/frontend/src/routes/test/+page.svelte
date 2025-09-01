<!-- /apps/frontend/src/routes/test/+page.svelte -->
<script lang="ts">
	import { trpc } from '$lib/trpc';
	import type { GameState } from '@repo/trpc/src/types/gameState';

	// State variables
	let matchId = 'test_match_123';
	let gameState: GameState | null = null;
	let subscription: any = null;
	let messages: string[] = [];
	let isSubscribed = false;
	let connectionStatus = 'Disconnected';
  let playerID :string = '';

	// Initialize game
	async function initGame() {
		try {
			addMessage('Initializing game...');
			const result = await trpc.game.initializeMatch.mutate({
				matchId: 'test_match_123',
			});
			addMessage(`Game initialized: ${JSON.stringify(result)}`);
		} catch (error) {
			addMessage(`Error initializing: ${error.message}`);
		}
	}

	// Subscribe to game updates
	function subscribeToGame() {
		try {
			addMessage('Subscribing to game updates...');
			connectionStatus = 'Connecting...';

			subscription = trpc.game.subscribeToGameState.subscribe(
				{ matchId },
				{
					onData: (data) => {
						gameState = data;
						connectionStatus = 'Connected';
						isSubscribed = true;
						addMessage(`Received update: ${JSON.stringify(data)}`);
					},
					onError: (error) => {
						connectionStatus = 'Error';
						addMessage(`Subscription error: ${error.message}`);
					},
				}
			);
		} catch (error) {
			addMessage(`Subscribe error: ${error.message}`);
		}
	}

	// Send ready action
	async function sendReady(id : string) {

		try {
			addMessage('Sending ready action...');
			const result = await trpc.game.sentPlayerAction.mutate({
        matchId,
        playerId: id,
        action:  'ready',
			});
			addMessage(`Ready action sent for player ${id}: ${JSON.stringify(result)}`);
		} catch (error) {
			addMessage(`Error sending ready: ${error.message}`);
		}
	}

	// Disconnect
	function disconnect() {
		if (subscription) {
			subscription.unsubscribe();
			subscription = null;
			isSubscribed = false;
			connectionStatus = 'Disconnected';
			addMessage('Disconnected from game updates');
		}
	}

	// Helper function
	function addMessage(msg: string) {
		const timestamp = new Date().toLocaleTimeString();
		messages = [`[${timestamp}] ${msg}`, ...messages];
	}

	// Clear messages
	function clearMessages() {
		messages = [];
	}
</script>

<div class="container">
	<h1>🏓 Pong Game Testing Dashboard</h1>

	<!-- Connection Status -->
	<div class="status-bar">
		<span
			>Status: <strong class:connected={connectionStatus === 'Connected'}
				>{connectionStatus}</strong
			></span
		>
		<span>Match ID: <strong>{matchId}</strong></span>
	</div>

	<!-- Action Buttons -->
	<div class="buttons">
		<button on:click={initGame}>🎮 Initialize Game</button>
		<button on:click={subscribeToGame} disabled={isSubscribed}
			>📡 Subscribe to Updates</button
		>
	<input type="text" bind:value={playerID} placeholder="Player ID" style="width: 100px;" />
	<button on:click={() => sendReady(playerID)}>✅ Send Ready</button>
	<p>Current Player ID: {playerID}</p>
		<button on:click={disconnect} disabled={!isSubscribed}>🔌 Disconnect</button
		>
	</div>

	<!-- Current Game State -->
	{#if gameState}
		<div class="game-state">
			<h2>Current Game State</h2>
			<p><strong>Status:</strong> {gameState.status}</p>
			<p><strong>Round:</strong> {gameState.currentRound}</p>
			<p><strong>Last Update:</strong> {gameState.lastUpdate}</p>

			<h3>Players:</h3>
			{#each gameState.players as player}
				<div class="player">
					<strong>{player.name}</strong> - Ready: {player.isReady ? '✅' : '❌'}
					| Lives: {player.lives} | Position: ({player.position.x}, {player
						.position.y})
				</div>
			{/each}

			<h3>Ball:</h3>
			<p>
				Position: ({gameState.ball.position.x}, {gameState.ball.position.y})
			</p>
			<p>
				Velocity: ({gameState.ball.velocity.x}, {gameState.ball.velocity.y})
			</p>
		</div>
	{/if}

	<!-- Messages Log -->
	<div class="messages">
		<div class="messages-header">
			<h2>Messages</h2>
			<button on:click={clearMessages}>Clear</button>
		</div>
		<div class="message-list">
			{#each messages as message}
				<div class="message">{message}</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	.status-bar {
		background: #f0f0f0;
		padding: 10px;
		border-radius: 5px;
		margin-bottom: 20px;
		display: flex;
		gap: 20px;
	}

	.connected {
		color: green;
	}

	.buttons {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.buttons button {
		padding: 10px 15px;
		border: none;
		border-radius: 5px;
		background: #007bff;
		color: white;
		cursor: pointer;
	}

	.buttons button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.game-state {
		background: #f8f9fa;
		padding: 15px;
		border-radius: 5px;
		margin-bottom: 20px;
	}

	.player {
		background: white;
		padding: 8px;
		margin: 5px 0;
		border-radius: 3px;
		border-left: 3px solid #007bff;
	}

	.messages {
		border: 1px solid #ddd;
		border-radius: 5px;
	}

	.messages-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 15px;
		background: #f8f9fa;
		border-bottom: 1px solid #ddd;
	}

	.message-list {
		max-height: 300px;
		overflow-y: auto;
		padding: 10px;
	}

	.message {
		font-family: monospace;
		font-size: 12px;
		padding: 2px 0;
		border-bottom: 1px solid #eee;
	}
</style>
