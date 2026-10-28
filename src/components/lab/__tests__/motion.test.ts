import { describe, expect, it } from "vitest";
import {
  cubicBezier,
  DEFAULT_SPEC,
  faceForQuarter,
  planTurn,
  stepOffsetDeg,
  turnDurationMs,
  turnOffsetDeg,
} from "../motion";

const spec = DEFAULT_SPEC;
const EPS = 1e-6;

describe("cubicBezier", () => {
  it("is the identity for a linear curve", () => {
    const ease = cubicBezier(0, 0, 1, 1);
    for (const x of [0, 0.25, 0.5, 0.75, 1]) {
      expect(ease(x)).toBeCloseTo(x, 5);
    }
  });

  it("hits 0 and 1 at the endpoints", () => {
    const ease = cubicBezier(0.7, 0, 1, 1);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });

  it("starts slow for an ease-in curve", () => {
    const ease = cubicBezier(0.7, 0, 1, 1);
    expect(ease(0.5)).toBeLessThan(0.3);
  });

  it("is monotonic for the accelerate curve", () => {
    const ease = cubicBezier(0.7, 0, 1, 1);
    let prev = -1;
    for (let i = 0; i <= 100; i++) {
      const y = ease(i / 100);
      expect(y).toBeGreaterThanOrEqual(prev - EPS);
      prev = y;
    }
  });
});

describe("stepOffsetDeg", () => {
  const impactT = spec.impactAt * spec.stepMs;
  const reboundT = (spec.impactAt + (1 - spec.impactAt) * 0.45) * spec.stepMs;

  it("starts at 0 and ends at exactly 90", () => {
    expect(stepOffsetDeg(0, spec)).toBe(0);
    expect(stepOffsetDeg(spec.stepMs, spec)).toBe(90);
  });

  it("reaches 90 at the impact point", () => {
    expect(stepOffsetDeg(impactT, spec)).toBeCloseTo(90, 5);
  });

  it("rebounds against the direction of travel by the bounce amount", () => {
    expect(stepOffsetDeg(reboundT, spec)).toBeCloseTo(90 - spec.bounceDeg, 5);
  });

  it("never travels past 90", () => {
    for (let t = 0; t <= spec.stepMs; t += 1) {
      expect(stepOffsetDeg(t, spec)).toBeLessThanOrEqual(90 + EPS);
    }
  });

  it("only moves forward before impact", () => {
    let prev = -1;
    for (let t = 0; t <= impactT; t += 1) {
      const a = stepOffsetDeg(t, spec);
      expect(a).toBeGreaterThanOrEqual(prev - EPS);
      prev = a;
    }
  });

  it("goes straight to 90 with no rebound when bounce is 0", () => {
    const flat = { ...spec, bounceDeg: 0 };
    for (let t = impactT; t <= spec.stepMs; t += 1) {
      expect(stepOffsetDeg(t, flat)).toBeCloseTo(90, 5);
    }
  });

  it("clamps outside the step", () => {
    expect(stepOffsetDeg(-50, spec)).toBe(0);
    expect(stepOffsetDeg(spec.stepMs + 50, spec)).toBe(90);
  });
});

describe("turnOffsetDeg", () => {
  it("is 0 before the turn starts and steps*90 after it ends", () => {
    expect(turnOffsetDeg(-10, 3, spec)).toBe(0);
    expect(turnOffsetDeg(turnDurationMs(3, spec) + 10, 3, spec)).toBe(270);
  });

  it("holds at the step boundary between steps", () => {
    const midHold = spec.stepMs + spec.holdMs / 2;
    expect(turnOffsetDeg(midHold, 3, spec)).toBe(90);
  });

  it("is in the second step after one step and one hold", () => {
    const t = spec.stepMs + spec.holdMs + spec.stepMs / 2;
    const a = turnOffsetDeg(t, 3, spec);
    expect(a).toBeGreaterThan(90);
    expect(a).toBeLessThan(180);
  });

  it("does nothing for a zero-step turn", () => {
    expect(turnOffsetDeg(100, 0, spec)).toBe(0);
    expect(turnDurationMs(0, spec)).toBe(0);
  });

  it("counts holds only between steps", () => {
    expect(turnDurationMs(1, spec)).toBe(spec.stepMs);
    expect(turnDurationMs(3, spec)).toBe(3 * spec.stepMs + 2 * spec.holdMs);
  });
});

describe("planTurn", () => {
  it("staggers every slice start by the stagger, top first", () => {
    const plan = planTurn(0, 1, 6, 70);
    expect(plan.map((s) => s.delayMs)).toEqual([0, 70, 140, 210, 280, 350]);
  });

  it("turns even slices k steps one way and odd slices 4-k the other way", () => {
    const plan = planTurn(0, 3, 4, 70);
    expect(plan[0]).toMatchObject({ dir: -1, steps: 3 });
    expect(plan[1]).toMatchObject({ dir: 1, steps: 1 });
    expect(plan[2]).toMatchObject({ dir: -1, steps: 3 });
    expect(plan[3]).toMatchObject({ dir: 1, steps: 1 });
  });

  it("does not move when the target is the current page", () => {
    expect(planTurn(2, 2, 5, 70).every((s) => s.steps === 0)).toBe(true);
  });

  it("lands every slice on the target page from any starting quarter", () => {
    for (const startQuarter of [-7, -1, 0, 3, 9]) {
      const from = faceForQuarter(startQuarter);
      for (let to = 0; to < 4; to++) {
        for (const s of planTurn(from, to, 7, 70)) {
          expect(faceForQuarter(startQuarter + s.dir * s.steps)).toBe(to);
        }
      }
    }
  });
});
