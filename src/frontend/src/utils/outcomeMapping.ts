/**
 * Single source of truth for reflection outcome mapping and validation.
 * Prevents inversion bugs by centralizing the thumb-to-outcome logic.
 */

export type ThumbSelection = 'up' | 'down';
export type ReflectionOutcome = 'positive' | 'negative';

/**
 * Canonical mapping from thumb selection to stored outcome.
 * - Thumbs UP = kept promise = POSITIVE
 * - Thumbs DOWN = missed promise = NEGATIVE
 */
export function thumbToOutcome(thumb: ThumbSelection): ReflectionOutcome {
  return thumb === 'up' ? 'positive' : 'negative';
}

/**
 * Reverse mapping: outcome to thumb selection
 */
export function outcomeToThumb(outcome: ReflectionOutcome): ThumbSelection {
  return outcome === 'positive' ? 'up' : 'down';
}

/**
 * Validate and normalize an outcome value.
 * Returns the outcome if valid, or logs an error and returns a safe default.
 */
export function normalizeOutcome(outcome: unknown): ReflectionOutcome {
  if (outcome === 'positive' || outcome === 'negative') {
    return outcome;
  }
  
  console.error('Invalid outcome value detected:', outcome, '- defaulting to negative');
  return 'negative';
}

/**
 * Check if an outcome value is valid
 */
export function isValidOutcome(outcome: unknown): outcome is ReflectionOutcome {
  return outcome === 'positive' || outcome === 'negative';
}

/**
 * Get the icon alt text for a given outcome
 */
export function getOutcomeIconAlt(outcome: ReflectionOutcome): string {
  return outcome === 'positive'
    ? 'Kept promise'
    : 'Did not keep promise';
}
