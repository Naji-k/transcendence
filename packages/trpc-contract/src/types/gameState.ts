export interface GameState {
  matchId: number;
  status: 'waiting' | 'in_progress' | 'finished';
  players: Player[];
  lastUpdate: number | Date;
  balls: GamePos[];
}
export interface Player {
  id: number;
  alias: string;
  lives: number;
  position: GamePos;
  isAlive: boolean;
  isReady: boolean;
  action: PlayerAction;
}

export interface PlayerAction {
  action: '1' | '-1' | '0' | 'ready';
  matchId: number;
  playerId?: number;
}

export interface GamePos {
  x: number;
  z: number;
}
