import { TokenState } from './token';

export type PlayerColor = 'blue' | 'yellow' | 'green' | 'red';

export type DiceState = 'IDLE' | 'READY' | 'ROLLING' | 'RESULT' | 'DISABLED';

export type PlayerStatusType =
  | 'WAITING'
  | 'READY'
  | 'ROLLING'
  | 'MOVING'
  | 'FINISHED'
  | 'DISCONNECTED';

export interface PlayerToken {
  id: number;
  state: TokenState;
  stepsFromStart: number;
  pathIndex: number | null;
}

export interface PlayerDiceState {
  playerId: string;
  value: number | null;
  state: DiceState;
  lastRoll?: number;
  rollId?: number;
}

export interface Player {
  id: string;
  color: PlayerColor;
  name: string;
  avatar: string;
  isAi: boolean;
  hasFinished: boolean;
  tokens: PlayerToken[];
  startTrackIndex: number; // 0, 13, 26, 39
  finishedCount: number;
  rank: number | null;
  status: PlayerStatusType;
  connectionStatus: 'ONLINE' | 'OFFLINE' | 'SLOW';
  coins: number;
  level: number;
  dice: PlayerDiceState;
  activeChat?: { text: string, isEmoji: boolean, timestamp: number, id: string };
}


