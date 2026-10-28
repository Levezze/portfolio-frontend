/**
 * Slice motion math for the sliced prism.
 *
 * A page change turns every slice in 90° steps. Even slices turn k steps one
 * way, odd slices 4-k steps the other way, so all of them land on the same
 * face. Each step accelerates from a slow start, hits the stop at full speed,
 * kicks back by a small rebound and settles. Holds sit between steps.
 *
 * Everything is a pure function of elapsed time so the animation is frame-rate
 * independent.
 */

export type MotionSpec = {
  stepMs: number;
  holdMs: number;
  staggerMs: number;
  /** First control point x of the accelerate curve, 0..1. Higher = slower start. */
  slowStart: number;
  /** Fraction of the step at which the slice hits the stop, 0..1. */
  impactAt: number;
  /** Rebound against the direction of travel, in degrees. */
  bounceDeg: number;
};

/** Point within the rebound window where the kick-back peaks. */
const REBOUND_PEAK = 0.45;

const mod4 = (n: number) => ((n % 4) + 4) % 4;

/** CSS-style cubic-bezier easing: returns y for a given x in 0..1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveT = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-7) return t;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (hi - lo > 1e-7) {
      if (sampleX(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleY(solveT(x));
  };
}

const easeOut = cubicBezier(0, 0, 0.3, 1);
const easeInOut = cubicBezier(0.5, 0, 0.5, 1);
const accelCache = new Map<number, (x: number) => number>();
const accelFor = (slowStart: number) => {
  let ease = accelCache.get(slowStart);
  if (!ease) {
    ease = cubicBezier(slowStart, 0, 1, 1);
    accelCache.set(slowStart, ease);
  }
  return ease;
};

/** Degrees travelled within one step, 0..90, including the rebound. */
export function stepOffsetDeg(tMs: number, spec: MotionSpec): number {
  if (tMs <= 0) return 0;
  if (tMs >= spec.stepMs) return 90;
  const x = tMs / spec.stepMs;
  const p = spec.impactAt;
  if (x < p) return 90 * accelFor(spec.slowStart)(x / p);
  if (spec.bounceDeg === 0) return 90;
  const peak = p + (1 - p) * REBOUND_PEAK;
  if (x < peak) return 90 - spec.bounceDeg * easeOut((x - p) / (peak - p));
  return 90 - spec.bounceDeg * (1 - easeInOut((x - peak) / (1 - peak)));
}

export function turnDurationMs(steps: number, spec: MotionSpec): number {
  if (steps <= 0) return 0;
  return steps * spec.stepMs + (steps - 1) * spec.holdMs;
}

/** Degrees travelled within a multi-step turn, 0..steps*90. */
export function turnOffsetDeg(
  elapsedMs: number,
  steps: number,
  spec: MotionSpec,
): number {
  if (steps <= 0 || elapsedMs <= 0) return 0;
  if (elapsedMs >= turnDurationMs(steps, spec)) return steps * 90;
  const period = spec.stepMs + spec.holdMs;
  const k = Math.floor(elapsedMs / period);
  const local = elapsedMs - k * period;
  if (local >= spec.stepMs) return (k + 1) * 90;
  return k * 90 + stepOffsetDeg(local, spec);
}

export type SliceTurn = { dir: 1 | -1; steps: number; delayMs: number };

/** Per-slice turn plan for a page change, slice 0 first. */
export function planTurn(
  from: number,
  to: number,
  sliceCount: number,
  staggerMs: number,
): SliceTurn[] {
  const k = mod4(to - from);
  return Array.from({ length: sliceCount }, (_, i) => {
    const even = i % 2 === 0;
    return {
      dir: even ? -1 : 1,
      steps: even ? k : mod4(4 - k),
      delayMs: i * staggerMs,
    };
  });
}

/**
 * Page facing the camera for a slice rotated by `quarter` quarter-turns.
 * Face p sits at +p quarters around the axis, so it faces front at -p.
 */
export function faceForQuarter(quarter: number): number {
  return mod4(-quarter);
}
