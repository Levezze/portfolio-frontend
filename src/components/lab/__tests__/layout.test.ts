import { describe, expect, it } from "vitest";
import { prismLayout, sliceCount } from "../layout";

describe("sliceCount", () => {
  it("stays between 5 and 8 rows on a portrait screen", () => {
    for (const [w, h] of [
      [240, 320],
      [320, 568],
      [390, 844],
      [1024, 1366],
      [2160, 3840],
    ]) {
      const n = sliceCount(w, h);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(8);
    }
  });

  // Landscape columns cut the four-tab nav: a multiple of four puts a cut on
  // every tab boundary and the same number of cuts inside each tab.
  it("uses 4 or 8 columns on a landscape screen, however big", () => {
    for (const [w, h] of [
      [568, 320],
      [844, 390],
      [1024, 768],
      [1440, 900],
      [1920, 1080],
      [2560, 1440],
      [7680, 4320],
    ]) {
      const n = sliceCount(w, h);
      expect(n % 4).toBe(0);
      expect(n).toBeGreaterThanOrEqual(4);
      expect(n).toBeLessThanOrEqual(8);
    }
  });

  it("counts along the long side", () => {
    expect(sliceCount(390, 844)).toBe(6);
    expect(sliceCount(844, 390)).toBe(8);
  });

  it("uses more slices on bigger screens", () => {
    expect(sliceCount(1440, 900)).toBeGreaterThan(sliceCount(568, 320));
  });

  it("respects a custom target slice size", () => {
    expect(sliceCount(600, 1000, 200)).toBe(5);
    expect(sliceCount(1000, 600, 125)).toBe(8);
    expect(sliceCount(1000, 600, 200)).toBe(4);
  });
});

describe("prismLayout", () => {
  it("uses horizontal rows turning about Y on a portrait screen", () => {
    const l = prismLayout(390, 844, 6);
    expect(l.axis).toBe("y");
    expect(l.depth).toBe(390);
    expect(l.slices).toHaveLength(6);
    expect(l.slices[0].height).toBeCloseTo(844 / 6);
    expect(l.slices[0].width).toBe(390);
  });

  it("uses vertical columns turning about X on a landscape screen", () => {
    const l = prismLayout(1440, 900, 8);
    expect(l.axis).toBe("x");
    expect(l.depth).toBe(900);
    expect(l.slices[0].width).toBeCloseTo(1440 / 8);
    expect(l.slices[0].height).toBe(900);
  });

  it("orders portrait slices top to bottom", () => {
    const l = prismLayout(390, 844, 5);
    const ys = l.slices.map((s) => s.centerY);
    expect([...ys].sort((a, b) => b - a)).toEqual(ys);
  });

  it("orders landscape slices left to right", () => {
    const l = prismLayout(1440, 900, 5);
    const xs = l.slices.map((s) => s.centerX);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it("tiles the screen with no gaps or overlap", () => {
    const l = prismLayout(390, 844, 7);
    const total = l.slices.reduce((sum, s) => sum + s.height, 0);
    expect(total).toBeCloseTo(844);
    expect(l.slices[0].centerY + l.slices[0].height / 2).toBeCloseTo(844 / 2);
  });

  it("gives each slice its strip of the page texture", () => {
    const l = prismLayout(390, 844, 4);
    expect(l.slices[0].uv).toEqual({ u0: 0, u1: 1, v0: 0.75, v1: 1 });
    expect(l.slices[3].uv).toEqual({ u0: 0, u1: 1, v0: 0, v1: 0.25 });
  });
});
