/**
 * Centralized Animation Configuration
 * Single source of truth for all animation timings, easing curves, and durations.
 * Supports configurable speeds and reduced motion preferences.
 */

export const ANIMATION_CONFIG = {
  // Dice Animation Durations (ms)
  diceRollDuration: 420,
  diceLandingDuration: 180,
  diceTotalRollTime: 600,

  // Token Animation Durations (ms)
  tokenStepDuration: 180, // Duration per single cell step
  tokenEntryDuration: 320, // Hop out of base socket to start cell
  captureImpactDuration: 220, // Flash at capture cell
  captureReturnDuration: 450, // Opponent flying back to base socket
  safeCellDuration: 380, // Safe star pulse / chime duration
  sixCelebrationDuration: 450, // Golden burst upon rolling a 6
  extraTurnDuration: 400, // Extra turn indicator banner
  turnTransitionDuration: 350, // Seat focus shift to next player
  finishDuration: 550, // Center HOME arrival celebration
  winnerDuration: 1000, // Victory celebration sequence

  // Easing presets
  easings: {
    bounceOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smoothOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    hopArc: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

/**
 * Checks if the user prefers reduced motion
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns effective step duration taking reduced motion into account
 */
export function getEffectiveStepDuration(baseDuration = ANIMATION_CONFIG.tokenStepDuration): number {
  if (isReducedMotionPreferred()) {
    return Math.max(60, Math.floor(baseDuration * 0.4));
  }
  return baseDuration;
}
