import {
  GameState
} from '@repo/trpc/src/types/gameState';
import { TRPCError } from '@trpc/server';
import { EventEmitter } from 'events';

export class GameStateManager extends EventEmitter {
  private gameStates = new Map<number, GameState>();

  subscribe(matchId: number, callback: (state: GameState) => void) {
    this.on(`gameState:${matchId}`, callback);
    return () => {
      this.off(`gameState: ${matchId}`, callback);
    };
  }

  notifySubs(matchId: number, gameState: GameState) {
    console.log(`Notifying subscribers of match ${matchId}`);
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
  initGameState(matchId: number, players: { id: number; alias: string }[]): GameState
  {
    const initialState = new GameState(matchId);

    for (const player of players)
    {
      initialState.players.push(
      {
        id: player.id,
        alias: player.alias,
        lives: 3,
        position: { x: 0, z: 0 },
        isAlive: true,
        isReady: false,
        action: []
      });
    }
    this.gameStates.set(matchId, initialState);
    //check what need to be prepared in gameServer
    this.notifySubs(matchId, initialState);
    return initialState;
  }
  //this is for late joiners
  joinGame(matchId: number, player: { id: number; alias: string }): GameState | null
  {
    const gameState = this.gameStates.get(matchId);
    if (!gameState)
    {
      console.error('Match not found: ', matchId);
      return null;
    }
    gameState.players.push(
    {
      id: player.id,
      alias: player.alias,
      lives: 3,
      position: { x: 0, z: 0 },
      isAlive: true,
      isReady: false,
      action: []
    });
    this.gameStates.set(matchId, gameState);
    this.notifySubs(matchId, gameState);
    return gameState;
  }

  /**
   * Handles player actions such as moving paddles or marking readiness.
   * @param action The action performed by the player
   * @returns
   */
  handlePlayerAction(action: PlayerAction): void {
    console.log('Processing action:', action);
    // const currentState = this.getGameState(action.matchId);
    // if (!currentState) {
    //   throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });
    // }
    // const player = currentState.players.find(
    //   (p) => p.id === action.id
    // ) as Player;
    const player = action
    if (!player) {
      console.error('Player not found in match: ', action.id);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Player not found in this match ' + action.id,
      });
    }
    switch (action.action) {
      case '1':
        // Move player's paddle up
        //update player action
        break;
      case '-1':
        // Move player's paddle down
        break;
      case '0':
        // Stop player's paddle
        break;
      // case :
      //   player.isReady = true;
      //   break;
    }
    this.gameStates.set(1, this.gameStates.get(1) as GameState);
  }
}
