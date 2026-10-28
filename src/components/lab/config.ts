import type { MotionSpec } from "./motion";
import type { LightSpec } from "./PrismScene";
import type { SkinSpec } from "./presets";

/**
 * Every tunable setting of the site, baked from the lab's tuning panel as the
 * user left it on 2026-10-28. Change a value here and reload; nothing else
 * holds a copy. Fonts are in fonts.ts, palettes and the design in presets.ts.
 */
export type SiteConfig = {
  /** Page turn: heavy slabs that accelerate into a stop and rebound. */
  motion: MotionSpec;
  /** The loading spin behind the veil: slower and softer than a page turn. */
  introMotion: MotionSpec;
  light: LightSpec;
  /** Target slice thickness; the count is clamped in layout.ts. */
  slicePx: number;
  skin: SkinSpec;
};

export const SITE: SiteConfig = {
  motion: {
    stepMs: 410,
    holdMs: 30,
    staggerMs: 70,
    slowStart: 0.7,
    impactAt: 0.9,
    bounceDeg: 2.5,
  },
  // Near-linear steps with no rebound: no slam at the end of each quarter.
  introMotion: {
    stepMs: 1100,
    holdMs: 300,
    staggerMs: 140,
    slowStart: 0.2,
    impactAt: 1,
    bounceDeg: 0,
  },
  light: {
    shadowStrength: 0.85,
    lightAngleDeg: 50,
    tiltDeg: 30,
    shadowRadius: 6,
    fovDeg: 30,
    seamPx: 0,
  },
  slicePx: 150,
  skin: {
    pagePalettes: ["slab", "rain", "violet", "teal"],
    titleScale: 1,
    drift: { enabled: true, speed: 1, glow: 1, swingDeg: 22 },
    cubes: {
      enabled: true,
      mode: "shadow",
      everyS: 25,
      sizeMin: 104,
      sizeMax: 226,
      passS: 14,
      blurPx: 9,
      shadowOpacity: 0.2,
      directions: "any",
    },
  },
};
