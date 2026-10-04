import { PlayerColor } from '../types/player';
import { ANIMATION_CONFIG, getEffectiveStepDuration } from '../config/animationConfig';
import { AudioService } from './AudioService';

export type GameAnimationEvent =
  | { type: 'DICE_ROLLED'; player: PlayerColor; value: number }
  | { type: 'TOKEN_SELECTED'; player: PlayerColor; tokenId: number }
  | { type: 'TOKEN_STEP'; player: PlayerColor; tokenId: number; stepIndex: number; cellId: string }
  | { type: 'TOKEN_ENTERED'; player: PlayerColor; tokenId: number; startCellId: string }
  | { type: 'TOKEN_CAPTURED'; attackerColor: PlayerColor; victimColor: PlayerColor; cellId: string }
  | { type: 'TOKEN_SAFE'; player: PlayerColor; cellId: string }
  | { type: 'SIX_ROLLED'; player: PlayerColor }
  | { type: 'EXTRA_TURN'; player: PlayerColor }
  | { type: 'TURN_CHANGED'; fromPlayer: PlayerColor; toPlayer: PlayerColor }
  | { type: 'TOKEN_FINISHED'; player: PlayerColor; tokenId: number }
  | { type: 'PLAYER_WON'; winner: PlayerColor };

export type AnimationEventListener = (event: GameAnimationEvent) => void;

/**
 * AnimationService coordinates gameplay animation triggers, timing configurations,
 * audio synchronization, and visual effects across components.
 */
export class AnimationService {
  private static instance: AnimationService;
  private listeners: Set<AnimationEventListener> = new Set();
  private isAnimating = false;

  private constructor() {}

  public static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  public subscribe(listener: AnimationEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: GameAnimationEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in animation event listener:', err);
      }
    }
  }

  public getIsAnimating(): boolean {
    return this.isAnimating;
  }

  public setIsAnimating(animating: boolean): void {
    this.isAnimating = animating;
  }

  public getConfig() {
    return ANIMATION_CONFIG;
  }

  public getStepDuration(): number {
    return getEffectiveStepDuration();
  }

  /**
   * Helper to trigger six celebration
   */
  public triggerSixCelebration(player: PlayerColor): void {
    this.emit({ type: 'SIX_ROLLED', player });
    AudioService.getInstance().playSix();
  }

  /**
   * Helper to trigger extra turn notice
   */
  public triggerExtraTurn(player: PlayerColor): void {
    this.emit({ type: 'EXTRA_TURN', player });
    AudioService.getInstance().playExtraTurn();
  }

  /**
   * Helper to trigger safe cell arrival
   */
  public triggerSafeArrival(player: PlayerColor, cellId: string): void {
    this.emit({ type: 'TOKEN_SAFE', player, cellId });
    AudioService.getInstance().playSafe();
  }

  /**
   * Helper to trigger token finish arrival
   */
  public triggerTokenFinish(player: PlayerColor, tokenId: number): void {
    this.emit({ type: 'TOKEN_FINISHED', player, tokenId });
    AudioService.getInstance().playFinish();
  }

  /**
   * Helper to trigger victory fanfare
   */
  public triggerVictory(winner: PlayerColor): void {
    this.emit({ type: 'PLAYER_WON', winner });
    AudioService.getInstance().playWin();
  }
}
