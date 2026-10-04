import { PlayerColor } from './player';

export type TokenState = 'HOME' | 'ON_BOARD' | 'FINISHED';

export interface Token {
  id: number; // 0, 1, 2, 3
  playerId: string;
  color: PlayerColor;
  state: TokenState;
  /**
   * stepsFromStart:
   * When state is HOME: 0
   * When state is ON_BOARD:
   *   0 = at start cell (PLAYER_START_INDEX[color])
   *   1..50 = traversed cells on the 52-cell track
   *   51..55 = traversed cells in the player's 5 home path cells
   *   56 = Center HOME (FINISHED)
   */
  stepsFromStart: number;
  /**
   * pathIndex:
   * 0..51 when on the 52-cell main track, or null when in HOME, home path, or finished.
   */
  pathIndex: number | null;
}
