import { Player, PlayerColor, PlayerToken } from '../types/player';
import { Token } from '../types/token';
import {
  PLAYER_START_INDEX,
  SAFE_CELL_SET,
  TOTAL_STEPS_TO_FINISH,
} from './boardPath';

export const MAX_CONSECUTIVE_SIXES = 3;

export class GameRules {
  /**
   * Checks if a token can legally move given the dice roll.
   */
  static canTokenMove(
    token: Token | PlayerToken,
    diceValue: number
  ): boolean {
    if (token.state === 'FINISHED' || token.stepsFromStart >= TOTAL_STEPS_TO_FINISH) {
      return false;
    }

    // Rule 1: A token in HOME can only leave if dice is 6
    if (token.state === 'HOME') {
      return diceValue === 6;
    }

    // Rule 2: Cannot overshoot the final center HOME (TOTAL_STEPS_TO_FINISH = 56)
    if (token.stepsFromStart + diceValue > TOTAL_STEPS_TO_FINISH) {
      return false;
    }

    return true;
  }

  /**
   * Calculates the exact destination stepsFromStart for a move.
   * If exiting HOME with a 6: destination stepsFromStart is 0 (the start cell).
   * If on board: destination is exactly current stepsFromStart + diceValue.
   */
  static calculateDestination(
    currentStepsFromStart: number,
    state: 'HOME' | 'ON_BOARD' | 'FINISHED',
    diceValue: number
  ): number {
    if (state === 'HOME') {
      if (diceValue === 6) {
        return 0; // Enters start cell
      }
      return 0;
    }

    return currentStepsFromStart + diceValue;
  }

  /**
   * Returns IDs of all tokens that can legally move for the given dice value.
   */
  static getMovableTokens(player: Player, diceValue: number): number[] {
    const movableIds: number[] = [];
    for (const token of player.tokens) {
      if (this.canTokenMove(token, diceValue)) {
        movableIds.push(token.id);
      }
    }
    return movableIds;
  }

  /**
   * Checks if landing on a cell results in a capture.
   * Capture rule:
   * Only on the 52-cell main track (stepsFromStart <= 50).
   * Target cell must NOT be in SAFE_CELL_SET.
   * Captures any opponent tokens occupying that exact pathIndex.
   */
  static checkCapture(
    movingColor: PlayerColor,
    targetStepsFromStart: number,
    allPlayers: Record<PlayerColor, Player>
  ): { capturedColor: PlayerColor; capturedTokenId: number }[] {
    // Only captures on main track (0 <= stepsFromStart <= 50)
    if (targetStepsFromStart > 50) {
      return [];
    }

    const startIdx = PLAYER_START_INDEX[movingColor];
    const targetPathIndex = (startIdx + targetStepsFromStart) % 52;

    // Cannot capture on safe star cells or start cells
    if (SAFE_CELL_SET.has(targetPathIndex)) {
      return [];
    }

    const captured: { capturedColor: PlayerColor; capturedTokenId: number }[] = [];

    for (const [colorKey, player] of Object.entries(allPlayers)) {
      const opponentColor = colorKey as PlayerColor;
      if (opponentColor === movingColor) continue;

      for (const token of player.tokens) {
        if (
          token.state === 'ON_BOARD' &&
          token.pathIndex !== null &&
          token.pathIndex === targetPathIndex
        ) {
          captured.push({
            capturedColor: opponentColor,
            capturedTokenId: token.id,
          });
        }
      }
    }

    return captured;
  }

  /**
   * Checks if player has won (all 4 tokens finished).
   */
  static hasPlayerWon(player: Player): boolean {
    return player.tokens.every(
      (t) => t.state === 'FINISHED' || t.stepsFromStart >= TOTAL_STEPS_TO_FINISH
    );
  }
}
