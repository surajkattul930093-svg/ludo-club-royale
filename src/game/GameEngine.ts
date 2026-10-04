import { GameMode, GameState, DebugMovementLog } from '../types/game';
import { Player, PlayerColor, PlayerToken } from '../types/player';
import { TokenState } from '../types/token';
import { createInitialGameState } from './GameState';
import { GameRules, MAX_CONSECUTIVE_SIXES } from './GameRules';
import { MovementEngine, MovementStep } from './MovementEngine';
import { TurnManager } from './TurnManager';
import { TOTAL_STEPS_TO_FINISH, getLogicalPosition, SAFE_CELL_SET } from './boardPath';
import { AudioService } from '../services/AudioService';

export type GameStateListener = (state: GameState) => void;

export class GameEngine {
  private state: GameState;
  private listeners: Set<GameStateListener> = new Set();
  private turnManager: TurnManager;
  private animationTimer: any = null;
  private rollCounter: number = 0;

  constructor(initialMode: GameMode = 'pass_and_play', selectedColors?: PlayerColor[]) {
    this.state = createInitialGameState(initialMode, selectedColors);
    this.turnManager = new TurnManager(this.state.activeColors);
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const currentState = this.getState();
    for (const listener of this.listeners) {
      listener(currentState);
    }
  }

  public updateState(partial: Partial<GameState>): void {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.notify();
  }

  public restartGame(mode?: GameMode): void {
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    const currentMode = mode || this.state.mode;
    this.state = createInitialGameState(currentMode);
    this.turnManager = new TurnManager(this.state.activeColors);
    this.notify();

    this.checkAiTurn();
  }

  public setSoundEnabled(enabled: boolean): void {
    this.updateState({ soundEnabled: enabled });
  }

  public setAnimationSpeed(speedMs: number): void {
    this.updateState({ animationSpeed: speedMs });
  }

  public toggleDebugMode(): void {
    this.updateState({ debugMode: !this.state.debugMode });
  }

  public toggleDebugBoard(): void {
    this.updateState({ debugBoard: !this.state.debugBoard });
  }

  /**
   * Execute Dice Roll with authoritative rules per player
   */
  public rollDice(forcedValue?: number): number {
    if (
      this.state.isAnimating ||
      this.state.status === 'rolling' ||
      this.state.status === 'moving' ||
      this.state.winner
    ) {
      return 0;
    }

    const currentColor = this.state.currentTurnColor;
    const player = this.state.players[currentColor];

    // Only current player can roll
    if (player.dice.state !== 'READY') {
      return 0;
    }

    const diceValue = forcedValue ?? Math.floor(Math.random() * 6) + 1;
    this.rollCounter++;
    if (this.state.soundEnabled) {
      AudioService.getInstance().playDiceSound();
    }
    const newConsecutiveSixes =
      diceValue === 6 ? this.state.consecutiveSixes + 1 : 0;

    // Update active player's dice to RESULT state with authoritative rollId
    const updatedActivePlayer: Player = {
      ...player,
      status: 'ROLLING',
      dice: {
        playerId: player.id,
        value: diceValue,
        state: 'RESULT',
        lastRoll: diceValue,
        rollId: this.rollCounter,
      },
    };

    const playersWithRoll = {
      ...this.state.players,
      [currentColor]: updatedActivePlayer,
    };

    // Penalty for 3 consecutive sixes
    if (newConsecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
      updatedActivePlayer.status = 'WAITING';
      updatedActivePlayer.dice.state = 'DISABLED';

      this.updateState({
        players: playersWithRoll,
        diceValue,
        consecutiveSixes: 0,
        status: 'turn_ended',
        lastActionMessage: `3 consecutive sixes! ${player.name} forfeits turn.`,
        movableTokenIds: [],
        selectedTokenId: null,
      });

      setTimeout(() => {
        this.nextTurn();
      }, 1000);

      return diceValue;
    }

    // Calculate strictly movable tokens
    const movableTokenIds = GameRules.getMovableTokens(player, diceValue);
    const playerName = player.name;
    let message = `${playerName} rolled a ${diceValue}!`;

    if (movableTokenIds.length === 0) {
      message += ` No valid moves.`;
      updatedActivePlayer.status = 'WAITING';
      updatedActivePlayer.dice.state = 'DISABLED';

      this.updateState({
        players: playersWithRoll,
        diceValue,
        consecutiveSixes: newConsecutiveSixes,
        status: 'turn_ended',
        movableTokenIds: [],
        selectedTokenId: null,
        lastActionMessage: message,
      });

      setTimeout(() => {
        this.nextTurn();
      }, 1000);

      return diceValue;
    }

    // At least one movable token
    updatedActivePlayer.status = 'READY';

    this.updateState({
      players: playersWithRoll,
      diceValue,
      consecutiveSixes: newConsecutiveSixes,
      status: 'waiting_for_move',
      movableTokenIds,
      selectedTokenId: null,
      lastActionMessage: `${message} Tap a highlighted token to move.`,
    });

    if (player.isAi) {
      setTimeout(() => {
        const bestTokenId = this.chooseAiToken(player.color, movableTokenIds, diceValue);
        this.moveToken(bestTokenId);
      }, 700);
    } else if (movableTokenIds.length === 1) {
      setTimeout(() => {
        if (this.state.status === 'waiting_for_move' && this.state.currentTurnColor === player.color) {
          this.moveToken(movableTokenIds[0]);
        }
      }, 700);
    }

    return diceValue;
  }

  /**
   * Move a chosen token step-by-step through the movement queue
   */
  public async moveToken(
    tokenId: number,
    onStepHook?: (step: MovementStep) => void
  ): Promise<void> {
    if (
      this.state.isAnimating ||
      this.state.status !== 'waiting_for_move' ||
      !this.state.movableTokenIds.includes(tokenId)
    ) {
      return;
    }

    const diceValue = this.state.diceValue;
    if (!diceValue) return;

    const currentColor = this.state.currentTurnColor;
    const player = this.state.players[currentColor];
    const token = player.tokens.find((t) => t.id === tokenId);
    if (!token) return;

    // Generate authoritative movement queue
    const movementQueue = MovementEngine.generateMovementQueue(
      currentColor,
      tokenId,
      token.state,
      token.stepsFromStart,
      diceValue
    );

    if (movementQueue.length === 0) {
      return;
    }

    // Prepare Authoritative Debug Movement Log
    const startPos = getLogicalPosition(
      currentColor,
      tokenId,
      token.state,
      token.stepsFromStart
    );
    const startPathIdx = token.pathIndex;
    const finalStep = movementQueue[movementQueue.length - 1];
    const finalPathIdx = finalStep.logicalPos.pathIndex;

    const sequenceSummary = [
      startPos.cellId,
      ...movementQueue.map((s) => s.logicalPos.cellId),
    ].join(' → ');

    const debugLog: DebugMovementLog = {
      dice: diceValue,
      player: currentColor,
      tokenId,
      fromStep: token.stepsFromStart,
      toStep: finalStep.stepsFromStart,
      fromPathIndex: startPathIdx,
      toPathIndex: finalPathIdx,
      fromCellId: startPos.cellId,
      toCellId: finalStep.logicalPos.cellId,
      pathSequence: sequenceSummary,
      stepCount: movementQueue.length,
    };

    // Update active player's status to MOVING & dice state to DISABLED
    const movingPlayer: Player = {
      ...player,
      status: 'MOVING',
      dice: {
        ...player.dice,
        state: 'DISABLED',
      },
    };

    // LOCK INPUTS: isAnimating = true
    this.updateState({
      players: {
        ...this.state.players,
        [currentColor]: movingPlayer,
      },
      isAnimating: true,
      status: 'moving',
      selectedTokenId: tokenId,
      movableTokenIds: [],
      debugLog,
      lastActionMessage: `${player.name} moving ${movementQueue.length} ${movementQueue.length === 1 ? 'cell' : 'cells'}...`,
    });

    // Play entry sound if token is leaving home
    if (token.state === 'HOME' && this.state.soundEnabled) {
      AudioService.getInstance().playTokenEntry();
    }

    // Animate step-by-step through the queue
    for (let i = 0; i < movementQueue.length; i++) {
      const step = movementQueue[i];

      if (token.state !== 'HOME' && this.state.soundEnabled) {
        AudioService.getInstance().playTokenStep();
      }

      this.updateState({
        animatingToken: {
          color: currentColor,
          tokenId,
          row: step.gridCoord.row,
          col: step.gridCoord.col,
          stepNumber: step.stepNumber,
          totalSteps: movementQueue.length,
        },
      });

      if (onStepHook) {
        onStepHook(step);
      }

      await new Promise<void>((resolve) => {
        this.animationTimer = setTimeout(() => {
          resolve();
        }, this.state.animationSpeed);
      });
    }

    // MOVEMENT COMPLETE: Finalize state
    const wasHome = token.state === 'HOME';
    const finalState: TokenState =
      finalStep.stepsFromStart >= TOTAL_STEPS_TO_FINISH ? 'FINISHED' : 'ON_BOARD';
    const finalStepsFromStart = finalStep.stepsFromStart;
    const finalPathIndex = finalStep.logicalPos.pathIndex;
    const didFinishToken = finalState === 'FINISHED' && token.state !== 'FINISHED';

    const finalTokens: PlayerToken[] = player.tokens.map((t) =>
      t.id === tokenId
        ? {
            ...t,
            state: finalState,
            stepsFromStart: finalStepsFromStart,
            pathIndex: finalPathIndex,
          }
        : t
    );

    const updatedPlayer: Player = {
      ...movingPlayer,
      tokens: finalTokens,
      finishedCount: finalTokens.filter((t) => t.state === 'FINISHED').length,
    };

    let updatedPlayers: Record<PlayerColor, Player> = {
      ...this.state.players,
      [currentColor]: updatedPlayer,
    };

    // Check Capture Logic (strictly on main track)
    let didCapture = false;
    let captureMessage = '';
    const captures = GameRules.checkCapture(
      currentColor,
      finalStepsFromStart,
      updatedPlayers
    );

    if (captures.length > 0) {
      didCapture = true;
      if (this.state.soundEnabled) {
        AudioService.getInstance().playCapture();
      }
      for (const cap of captures) {
        const victimPlayer = updatedPlayers[cap.capturedColor];
        const victimTokens = victimPlayer.tokens.map((t) =>
          t.id === cap.capturedTokenId
            ? { ...t, state: 'HOME' as const, stepsFromStart: 0, pathIndex: null }
            : t
        );
        updatedPlayers = {
          ...updatedPlayers,
          [cap.capturedColor]: {
            ...victimPlayer,
            tokens: victimTokens,
          },
        };
        captureMessage += ` Captured ${victimPlayer.name}'s token!`;
      }
    } else if (didFinishToken && this.state.soundEnabled) {
      AudioService.getInstance().playFinish();
    } else if (
      finalPathIndex !== null &&
      SAFE_CELL_SET.has(finalPathIndex) &&
      this.state.soundEnabled
    ) {
      AudioService.getInstance().playSafe();
    }

    // Check Win Condition
    let winner = this.state.winner;
    const rankings = [...this.state.rankings];

    if (GameRules.hasPlayerWon(updatedPlayer)) {
      if (!updatedPlayer.hasFinished) {
        updatedPlayer.hasFinished = true;
        updatedPlayer.status = 'FINISHED';
        updatedPlayer.rank = rankings.length + 1;
        rankings.push(currentColor);
        if (!winner) {
          winner = currentColor;
        }
      }
    }

    // Evaluate Bonus Roll
    const isBonusRoll = this.turnManager.shouldGrantBonusTurn(
      diceValue,
      this.state.consecutiveSixes,
      didCapture,
      didFinishToken
    );

    let bonusMsg = '';
    if (winner && rankings.length >= this.state.activeColors.length - 1) {
      if (this.state.soundEnabled) {
        AudioService.getInstance().playWin();
      }
      // Game over
      this.updateState({
        players: updatedPlayers,
        status: 'game_over',
        winner,
        rankings,
        isAnimating: false,
        animatingToken: null,
        selectedTokenId: null,
        movableTokenIds: [],
        lastActionMessage: `🏆 Game Over! ${this.state.players[winner].name} wins!`,
      });
      return;
    }

    if (didCapture) {
      bonusMsg = ` ⚔️ ${captureMessage} Bonus roll!`;
    } else if (didFinishToken) {
      bonusMsg = ` ⭐ Token reached HOME! Bonus roll!`;
    } else if (diceValue === 6) {
      bonusMsg = ` 🎲 Rolled a 6! Bonus roll!`;
    }

    // If bonus roll: Player stays active and ready to roll again!
    if (isBonusRoll && !updatedPlayer.hasFinished) {
      if (this.state.soundEnabled) {
        AudioService.getInstance().playExtraTurn();
      }
      updatedPlayer.status = 'READY';
      updatedPlayer.dice = {
        ...updatedPlayer.dice,
        state: 'READY',
      };

      this.updateState({
        players: updatedPlayers,
        winner,
        rankings,
        status: 'idle',
        isAnimating: false,
        animatingToken: null,
        selectedTokenId: null,
        movableTokenIds: [],
        lastActionMessage: wasHome
          ? `${player.name} entered the board!${bonusMsg}`
          : `${player.name} moved.${bonusMsg}`,
      });

      this.checkAiTurn();
    } else {
      updatedPlayer.status = 'WAITING';
      updatedPlayer.dice = {
        ...updatedPlayer.dice,
        state: 'IDLE',
      };

      this.updateState({
        players: updatedPlayers,
        winner,
        rankings,
        status: 'turn_ended',
        isAnimating: false,
        animatingToken: null,
        selectedTokenId: null,
        movableTokenIds: [],
        lastActionMessage: wasHome
          ? `${player.name} entered the board.${captureMessage}`
          : `${player.name} moved.${captureMessage}`,
      });

      setTimeout(() => {
        this.nextTurn();
      }, 500);
    }
  }

  private nextTurn(): void {
    if (this.state.status === 'game_over') return;

    if (this.state.soundEnabled) {
      AudioService.getInstance().playTurnChange();
    }

    const prevColor = this.state.currentTurnColor;
    const nextColor = this.turnManager.getNextPlayer(
      prevColor,
      this.state.players,
      this.state.activeColors
    );

    const prevPlayer = this.state.players[prevColor];
    const nextPlayer = this.state.players[nextColor];

    const updatedPlayers = {
      ...this.state.players,
      [prevColor]: {
        ...prevPlayer,
        status: prevPlayer.hasFinished ? ('FINISHED' as const) : ('WAITING' as const),
        dice: {
          ...prevPlayer.dice,
          state: 'IDLE' as const,
        },
      },
      [nextColor]: {
        ...nextPlayer,
        status: 'READY' as const,
        dice: {
          ...nextPlayer.dice,
          state: 'READY' as const,
        },
      },
    };

    this.updateState({
      players: updatedPlayers,
      currentTurnColor: nextColor,
      currentPlayerId: nextPlayer.id,
      status: 'idle',
      diceValue: null,
      consecutiveSixes: 0,
      turnNumber: this.state.turnNumber + 1,
      selectedTokenId: null,
      movableTokenIds: [],
      isAnimating: false,
      animatingToken: null,
      lastActionMessage: `${nextPlayer.name}'s turn. Roll the dice!`,
    });

    this.checkAiTurn();
  }

  private checkAiTurn(): void {
    const current = this.state.players[this.state.currentTurnColor];
    if (current && current.isAi && this.state.status === 'idle' && !this.state.isAnimating) {
      setTimeout(() => {
        if (
          this.state.status === 'idle' &&
          this.state.currentTurnColor === current.color &&
          !this.state.isAnimating
        ) {
          this.rollDice();
        }
      }, 700);
    }
  }

  /**
   * Smart AI Token Selection
   */
  private chooseAiToken(
    color: PlayerColor,
    movableIds: number[],
    diceValue: number
  ): number {
    const player = this.state.players[color];

    // Priority 1: Check if any move captures an opponent!
    for (const id of movableIds) {
      const token = player.tokens[id];
      const dest = GameRules.calculateDestination(token.stepsFromStart, token.state, diceValue);
      const captures = GameRules.checkCapture(color, dest, this.state.players);
      if (captures.length > 0) {
        return id;
      }
    }

    // Priority 2: Check if any move reaches center HOME (step 56)
    for (const id of movableIds) {
      const token = player.tokens[id];
      if (token.state === 'ON_BOARD' && token.stepsFromStart + diceValue === TOTAL_STEPS_TO_FINISH) {
        return id;
      }
    }

    // Priority 3: Bring token out of HOME if rolled a 6
    if (diceValue === 6) {
      const homeToken = movableIds.find((id) => player.tokens[id].state === 'HOME');
      if (homeToken !== undefined) {
        return homeToken;
      }
    }

    // Priority 4: Advance the furthest token closest to finishing
    let bestId = movableIds[0];
    let maxStep = -1;
    for (const id of movableIds) {
      const token = player.tokens[id];
      if (token.state === 'ON_BOARD' && token.stepsFromStart > maxStep) {
        maxStep = token.stepsFromStart;
        bestId = id;
      }
    }

    return bestId;
  }

  public removePlayer(color: PlayerColor): void {
    const player = this.state.players[color];
    if (!player || player.hasFinished) return;

    // Reset tokens to HOME so they don't block others
    const resetTokens = player.tokens.map(t => ({
       ...t,
       state: 'HOME' as const,
       stepsFromStart: 0,
       pathIndex: null
    }));

    let updatedPlayers = {
      ...this.state.players,
      [color]: {
        ...player,
        tokens: resetTokens,
        hasFinished: true,
        status: 'FINISHED' as const,
        name: player.name + ' (Left)'
      }
    };

    const activeRemaining = this.state.activeColors.filter(c => !updatedPlayers[c].hasFinished);
    
    if (activeRemaining.length === 1) {
      const winner = activeRemaining[0];
      this.updateState({
        players: updatedPlayers,
        status: 'game_over',
        winner,
        rankings: [...this.state.rankings, winner],
        isAnimating: false,
        animatingToken: null,
        selectedTokenId: null,
        movableTokenIds: [],
        lastActionMessage: `${player.name} left. ${updatedPlayers[winner].name} wins!`
      });
      return;
    }

    this.updateState({
      players: updatedPlayers,
      lastActionMessage: `${player.name} left the game.`
    });

    if (this.state.currentTurnColor === color) {
      this.nextTurn();
    }
  }
}
