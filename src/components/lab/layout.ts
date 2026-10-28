/**
 * Viewport-sized prism layout. World units are CSS pixels.
 *
 * Portrait: horizontal rows turning about Y, depth = screen width.
 * Landscape: vertical columns turning about X, depth = screen height.
 * Either way each slice's cross-section is a square, so it turns cleanly.
 */

export type Axis = "x" | "y";

export type SliceRect = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  /** This slice's strip of the full-page texture. */
  uv: { u0: number; u1: number; v0: number; v1: number };
};

export type PrismLayout = {
  axis: Axis;
  width: number;
  height: number;
  depth: number;
  slices: SliceRect[];
};

export const MIN_SLICES = 5;
export const MAX_LANDSCAPE_SLICES = 12;
export const MAX_SLICES = 10;
export const DEFAULT_SLICE_PX = 150;

export function sliceCount(
  width: number,
  height: number,
  targetPx = DEFAULT_SLICE_PX,
): number {
  const n = Math.round(Math.max(width, height) / targetPx);
  if (height >= width) return Math.min(MAX_SLICES, Math.max(MIN_SLICES, n));
  // Landscape columns cut across the four-tab nav. A multiple of four puts a
  // cut on every tab boundary and the same number of cuts inside each tab.
  const quads = Math.round(n / 4) * 4;
  return Math.min(MAX_LANDSCAPE_SLICES, Math.max(4, quads));
}

export function prismLayout(
  width: number,
  height: number,
  count: number,
): PrismLayout {
  const portrait = height >= width;
  const slices: SliceRect[] = Array.from({ length: count }, (_, i) => {
    if (portrait) {
      const h = height / count;
      return {
        centerX: 0,
        centerY: height / 2 - (i + 0.5) * h,
        width,
        height: h,
        uv: { u0: 0, u1: 1, v0: 1 - (i + 1) / count, v1: 1 - i / count },
      };
    }
    const w = width / count;
    return {
      centerX: -width / 2 + (i + 0.5) * w,
      centerY: 0,
      width: w,
      height,
      uv: { u0: i / count, u1: (i + 1) / count, v0: 0, v1: 1 },
    };
  });
  return {
    axis: portrait ? "y" : "x",
    width,
    height,
    depth: portrait ? width : height,
    slices,
  };
}
