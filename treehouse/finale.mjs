export const FINALE_DURATION = 6;

// The last exit leads to the canopy, never back to level zero.
export function destinationAfterExit(index, count) {
  return index === count - 1 ? 'finale' : 'complete';
}

export function finalePose(elapsed, reducedMotion = false) {
  const progress = Math.max(0, Math.min(1, (elapsed - 2.5) / 3.5));
  const eased = progress * progress * (3 - 2 * progress);
  return {
    girlY: reducedMotion ? 260 : 260 - 155 * eased,
    canopyOffset: reducedMotion ? 0 : 75 * eased,
    won: elapsed >= FINALE_DURATION,
  };
}
