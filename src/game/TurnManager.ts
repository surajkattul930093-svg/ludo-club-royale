import { Player, PlayerColor } from '../types/player';
import { MAX_CONSECUTIVE_SIXES } from './GameRules';

export class TurnManager {
  private turnOrder: PlayerColor[];

  constructor(activeColors: PlayerColor[] = ['blue', 'yellow', 'green', 'red']) {
    this.turnOrder = activeColors;
  }

  /**
   * Determine next player after turn finishes
   */
  getNextPlayer(
    currentColor: PlayerColor,
    players: Record<PlayerColor, Player>,
    activeColors: PlayerColor[]
  ): PlayerColor {
    const currentIndex = activeColors.indexOf(currentColor);
    const total = activeColors.length;

    for (let i = 1; i <= total; i++) {
      const nextColor = activeColors[(currentIndex + i) % total];
      const player = players[nextColor];
      if (player && !player.hasFinished) {
        return nextColor;
      }
    }

    return currentColor;
  }

  /**
   * Checks if player gets a bonus turn
   * Returns true if dice was 6 (and not 3 consecutive 6s) or capture occurred or token finished
   */
  shouldGrantBonusTurn(
    diceValue: number,
    consecutiveSixes: number,
    didCapture: boolean,
    didFinishToken: boolean
  ): boolean {
    if (consecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
      return false; // Penalty: forfeits bonus turn after 3 sixes
    }
    if (diceValue === 6) {
      return true;
    }
    if (didCapture) {
      return true;
    }
    if (didFinishToken) {
      return true;
    }
    return false;
  }
}
