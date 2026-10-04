import { PlayerColor } from '../types/player';
import {
  getLogicalPosition,
  GridCoord,
  LogicalPosition,
  TOTAL_STEPS_TO_FINISH,
} from './boardPath';

export interface MovementStep {
  stepNumber: number; // 1, 2, ..., diceValue
  stepsFromStart: number;
  logicalPos: LogicalPosition;
  gridCoord: GridCoord;
}

export class MovementEngine {
  /**
   * Generates the authoritative sequence of cells a token will traverse.
   * For HOME entry (with a 6): 1 step moving to start cell.
   * For ON_BOARD movement: exactly `diceValue` steps, moving 1 cell per step.
   */
  static generateMovementQueue(
    color: PlayerColor,
    tokenId: number,
    state: 'HOME' | 'ON_BOARD' | 'FINISHED',
    currentStepsFromStart: number,
    diceValue: number
  ): MovementStep[] {
    const queue: MovementStep[] = [];

    // Case 1: Exiting HOME to start cell
    if (state === 'HOME') {
      if (diceValue === 6) {
        const startPos = getLogicalPosition(color, tokenId, 'ON_BOARD', 0);
        queue.push({
          stepNumber: 1,
          stepsFromStart: 0,
          logicalPos: startPos,
          gridCoord: { row: startPos.row, col: startPos.col },
        });
      }
      return queue;
    }

    // Case 2: On board moving forward
    for (let s = 1; s <= diceValue; s++) {
      const nextStepsFromStart = currentStepsFromStart + s;
      if (nextStepsFromStart > TOTAL_STEPS_TO_FINISH) {
        break; // Cannot exceed finished center
      }

      const nextPos = getLogicalPosition(
        color,
        tokenId,
        nextStepsFromStart >= TOTAL_STEPS_TO_FINISH ? 'FINISHED' : 'ON_BOARD',
        nextStepsFromStart
      );

      queue.push({
        stepNumber: s,
        stepsFromStart: nextStepsFromStart,
        logicalPos: nextPos,
        gridCoord: { row: nextPos.row, col: nextPos.col },
      });
    }

    return queue;
  }
}
