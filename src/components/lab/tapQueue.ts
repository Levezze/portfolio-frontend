/**
 * A nav tap made while the prism is busy (the intro, a turn) is kept instead
 * of dropped, and runs once the prism comes to rest. Only the latest counts:
 * tapping Projects then Resume mid-turn goes to Resume.
 */
export function createTapQueue() {
  let kept: number | null = null;
  return {
    keep(to: number) {
      kept = to;
    },
    /** The tap to run now the prism rests on `active`, if any; forgets it. */
    take(active: number): number | null {
      const to = kept;
      kept = null;
      return to === active ? null : to;
    },
    clear() {
      kept = null;
    },
  };
}
