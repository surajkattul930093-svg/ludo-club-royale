import { Player, PlayerColor } from './player';

export type GameMode = 'pass_and_play' | 'vs_computer' | '2_player' | 'online_multiplayer';

export type GameStatus =
  | 'idle'
  | 'rolling'
  | 'waiting_for_move'
  | 'moving'
  | 'turn_ended'
  | 'game_over';

export interface DebugMovementLog {
  dice: number;
  player: PlayerColor;
  tokenId: number;
  fromStep: number;
  toStep: number;
  fromPathIndex: number | null;
  toPathIndex: number | null;
  fromCellId: string;
  toCellId: string;
  pathSequence: string;
  stepCount: number;
}

export interface AnimatingTokenInfo {
  color: PlayerColor;
  tokenId: number;
  row: number;
  col: number;
  stepNumber: number;
  totalSteps: number;
}

export interface GameState {
  gameId: string;
  mode: GameMode;
  status: GameStatus;
  players: Record<PlayerColor, Player>;
  activeColors: PlayerColor[];
  currentTurnColor: PlayerColor;
  currentPlayerId: string;
  diceValue: number | null;
  isDiceRolling: boolean;
  consecutiveSixes: number;
  turnNumber: number;
  winner: PlayerColor | null;
  rankings: PlayerColor[];
  movableTokenIds: number[];
  selectedTokenId: number | null;
  lastActionMessage: string;
  soundEnabled: boolean;
  animationSpeed: number; // ms per step, default 180
  isAnimating: boolean;
  animatingToken: AnimatingTokenInfo | null;
  debugMode: boolean;
  debugBoard: boolean;
  debugLog: DebugMovementLog | null;
  explosions?: { id: string, index: number, color: PlayerColor }[];
}


