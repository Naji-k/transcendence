import { GameState, PlayerAction } from '@repo/trpc/src/types/gameState';
import { TRPCError } from '@trpc/server';
import { EventEmitter } from 'events';
import { startGame } from './main';
import { ServerGame } from './index';

export class GameStateManager extends EventEmitter {
  private gameStates = new Map<number, GameState>();
  private serverGames = new Map<number, ServerGame>();

  subscribe(matchId: number, callback: (state: GameState) => void) {
    console.log(`SUBSCRIBING to gameState:${matchId}`);
    this.on(`gameState:${matchId}`, callback);
    return () => {
      this.off(`gameState:${matchId}`, callback);
    };
  }

  notifySubs(matchId: number, gameState: GameState) {
    this.emit(`gameState:${matchId}`, gameState);
  }

  getGameState(matchId: number): GameState | null {
    return this.gameStates.get(matchId) ?? null;
  }

  /**
   *
   * @param matchId The unique identifier for the match
   * @param players Array of players participating in the match still not sure from where we get this
   * @returns
   */

  //this will be called after GameLoop (matchmaking is done and players are assigned to a match)
  async initGameState(
    matchId: number,
    players: { id: number; alias: string }[]
  ): Promise<GameState> {
    if (this.gameStates.has(matchId)) {
      return this.gameStates.get(matchId) as GameState;
    }
    console.log(`Initializing game state for match ${matchId}...`);
    const initialState: GameState = {
      matchId,
      status: 'waiting' as const,
      lastUpdate: new Date(),
      players: players.map((p) => ({
        id: p.id,
        alias: p.alias,
        lives: 3,
        position: { x: 0, z: 0 },
        isAlive: true,
        isReady: false,
        action: { playerId: p.id, matchId, action: '0' },
      })),
      balls: [{ x: 0, z: 0 }],
    };

    this.gameStates.set(matchId, initialState);
    const serverGame = await startGame(initialState, this); // startGame should return ServerGame instance
    this.serverGames.set(matchId, serverGame);
    this.notifySubs(matchId, initialState);
    return initialState;
  }

  /**
   * Handles player actions such as moving paddles or marking readiness.
   * @param action The action performed by the player
   * @returns
   */
  handlePlayerAction(action: PlayerAction): void {
    const currentState = this.getGameState(action.matchId);
    const serverGame = this.serverGames.get(action.matchId); // Get the game instance

    if (!currentState || !serverGame) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Match not found in manager',
      });
    }
    serverGame.enqueueAction(action); // ← This is the key connection!

    if (action.action === 'ready') {
      console.log(
        `Player ${action.playerId} is ready in match ${currentState.matchId}.`
      );
      const player = currentState.players.find((p) => p.id === action.playerId);
      if (player) {
        player.isReady = true;
        if (currentState.players.every((p) => p.isReady)) {
          console.log(`All players ready in match ${action.matchId}.`);
          currentState.status = 'in_progress';
        }
      } else {
        console.log(
          `Player ${action.playerId} not found in match ${currentState.matchId}.`
        );
      }

      // const player = currentState.players.find(
      //   (p) => p.id === action.playerId
      // ) as Player;
      // if (!player) {
      //   console.error('Player not found in match: ', action.matchId);
      //   throw new TRPCError({
      //     code: 'NOT_FOUND',
      //     message: 'Player not found in this match ' + action.matchId,
      //   });
      // }
      // switch (action.action) {
      //   case '1':
      //     player.action.action = action.action;
      //     break;
      //   case '-1':
      //     player.action.action = action.action;
      //     break;
      //   case '0':
      //     // Stop player's paddle
      //     player.action.action = action.action;
      //     break;
      //   case 'ready':
      //     player.isReady = true;
      //     // Check if all players are ready to start the game
      //     if (currentState.players.every((p) => p.isReady)) {
      //       currentState.status = 'in_progress';
      //       console.log(`All players ready in match Game starting.`);
      //     }
      //     break;
      // }
      this.gameStates.set(action.matchId, currentState);
    }
  }
}
