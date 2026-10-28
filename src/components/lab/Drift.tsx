"use client";

import { useEffect, useRef } from "react";
import type { DriftSpec, Palette } from "./presets";

/**
 * The page background: a base gradient whose direction slowly swings, with
 * two soft glows wandering over it. Driven from one shared clock and written
 * as inline styles, so every page's copy is in step and a DOM snapshot taken
 * mid-drift matches what was on screen.
 *
 * The clock pauses while the slices turn (the pages are hidden and the 3D
 * faces show a snapshot), so the live page resumes exactly where the snapshot
 * left it instead of jumping.
 */

type Tick = (t: number) => void;
const ticks = new Set<Tick>();
let raf = 0;
let paused = false;
let pausedAt = 0;
let offset = 0;

const now = () => (paused ? pausedAt : performance.now()) / 1000 - offset;

function loop() {
  const t = now();
  for (const fn of ticks) fn(t);
  raf = ticks.size ? requestAnimationFrame(loop) : 0;
}
function subscribe(fn: Tick) {
  ticks.add(fn);
  fn(now());
  if (!raf) raf = requestAnimationFrame(loop);
  return () => {
    ticks.delete(fn);
  };
}

export const driftClock = {
  pause() {
    if (paused) return;
    paused = true;
    pausedAt = performance.now();
  },
  resume() {
    if (!paused) return;
    paused = false;
    offset += (performance.now() - pausedAt) / 1000;
  },
};

const TAU = Math.PI * 2;

export function Drift({
  palette,
  spec,
}: {
  palette: Palette;
  spec: DriftSpec;
}) {
  const base = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const specRef = useRef(spec);
  specRef.current = spec;

  useEffect(() => {
    const apply = (clock: number) => {
      const { speed, glow, swingDeg } = specRef.current;
      const t = clock * speed;
      if (base.current)
        base.current.style.transform = `rotate(${swingDeg * Math.sin((t / 97) * TAU)}deg)`;
      if (a.current) {
        a.current.style.transform = `translate(${35 + 28 * Math.sin((t / 41) * TAU)}vw, ${18 + 20 * Math.cos((t / 53) * TAU)}vh)`;
        a.current.style.opacity = String(
          glow * (0.7 + 0.3 * Math.sin((t / 29) * TAU)),
        );
      }
      if (b.current) {
        b.current.style.transform = `translate(${70 + 26 * Math.cos((t / 47) * TAU)}vw, ${72 + 22 * Math.sin((t / 37) * TAU)}vh)`;
        b.current.style.opacity = String(
          glow * (0.6 + 0.4 * Math.cos((t / 31) * TAU)),
        );
      }
    };
    if (!spec.enabled) {
      apply(0);
      return;
    }
    return subscribe(apply);
  }, [spec.enabled]);

  const glow = (color: string) => ({
    background: `radial-gradient(closest-side, ${color}, transparent)`,
  });

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        ref={base}
        className="absolute top-1/2 left-1/2 h-[200vmax] w-[200vmax] -translate-x-1/2 -translate-y-1/2"
        style={{ background: palette.base }}
      />
      <div
        ref={a}
        className="absolute top-0 left-0 h-[110vmax] w-[110vmax]"
        style={{
          ...glow(palette.glowA),
          marginLeft: "-55vmax",
          marginTop: "-55vmax",
        }}
      />
      <div
        ref={b}
        className="absolute top-0 left-0 h-[90vmax] w-[90vmax]"
        style={{
          ...glow(palette.glowB),
          marginLeft: "-45vmax",
          marginTop: "-45vmax",
        }}
      />
    </div>
  );
}
