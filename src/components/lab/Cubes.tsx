"use client";

import { useEffect, useRef, useState } from "react";
import type { Axis } from "./layout";
import type { CubeSpec } from "./presets";
import { usePrefersReducedMotion } from "./useReducedMotion";

/**
 * Traffic overhead: now and then a cube tumbles across the page and drags its
 * shadow over the content. In "shadow" mode the cube itself is above the
 * camera and only its shadow crosses the page. Pure CSS 3D, never catches a
 * click, excluded from snapshots (data-lab-nocapture), and keeps flying while
 * the slices turn.
 */

type Pass = {
  id: number;
  size: number;
  from: [number, number];
  to: [number, number];
  tilt: number;
  /** Fixed tumble axis (unit vector) and the total angle turned over the pass. */
  spinAxis: [number, number, number];
  spinDeg: number;
};

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

function unit(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(...v) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

/**
 * Start and end points well outside the viewport, in px. The margin covers
 * the shadow's whole reach (it trails the cube by more than its own size,
 * scaled, tilted and blurred) plus a quarter screen, so a pass starts and
 * ends with nothing of it on screen. A 25vw margin let the shadow sit
 * on-screen when the pass was removed.
 */
function path(
  directions: CubeSpec["directions"],
  size: number,
  blurPx: number,
): Pick<Pass, "from" | "to"> {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const pad = size * 3 + blurPx * 4 + Math.max(w, h) * 0.25;
  const left = -pad;
  const right = w + pad;
  const top = -pad;
  const bottom = h + pad;
  if (directions === "lr") {
    const y = rand(0.06, 0.3) * h;
    return { from: [left, y], to: [right, y] };
  }
  const side = Math.floor(rand(0, 4));
  const from: [number, number] =
    side === 0
      ? [left, rand(0, 0.6) * h]
      : side === 1
        ? [right, rand(0, 0.6) * h]
        : side === 2
          ? [rand(0, 1) * w, top]
          : [rand(0, 1) * w, bottom];
  const to: [number, number] =
    side === 0
      ? [right, rand(-0.1, 0.7) * h]
      : side === 1
        ? [left, rand(-0.1, 0.7) * h]
        : side === 2
          ? [rand(-0.1, 1.1) * w, bottom]
          : [rand(-0.1, 1.1) * w, top];
  return { from, to };
}

/** The flight takes twice the "Pass" setting, since it now covers far more ground. */
const PASS_STRETCH = 2;

function Flyer({
  pass,
  spec,
  axis,
  capColor,
  onDone,
}: {
  pass: Pass;
  spec: CubeSpec;
  axis: Axis;
  capColor: string;
  onDone: () => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const cube = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a pass is fixed once spawned
  useEffect(() => {
    const ms = spec.passS * 1000 * PASS_STRETCH;
    const move = el.current?.animate(
      [
        { transform: `translate(${pass.from[0]}px, ${pass.from[1]}px)` },
        { transform: `translate(${pass.to[0]}px, ${pass.to[1]}px)` },
      ],
      { duration: ms, easing: "linear", fill: "forwards" },
    );
    // One constant-speed rotation about one fixed axis. Composing rotateX
    // and rotateY at different rates is not uniform motion: the silhouette
    // seems to hesitate and lurch, which read as pauses and jumps.
    const ax = pass.spinAxis.join(", ");
    const tumble = [
      { transform: `rotate3d(${ax}, 0deg)` },
      { transform: `rotate3d(${ax}, ${pass.spinDeg}deg)` },
    ];
    const spins = [cube.current, ghost.current].map((n) =>
      n?.animate(tumble, { duration: ms, easing: "linear", fill: "forwards" }),
    );
    move?.finished.then(onDone).catch(() => {});
    return () => {
      move?.cancel();
      for (const s of spins) s?.cancel();
    };
  }, []);

  // Shadow falls away from the key light: down in portrait, right in landscape.
  const offset = axis === "y" ? [12, 115] : [115, 12];
  const faces = [
    ["rotateY(0deg)", 0],
    ["rotateY(180deg)", -45],
    ["rotateY(90deg)", -20],
    ["rotateY(-90deg)", -30],
    ["rotateX(90deg)", 25],
    ["rotateX(-90deg)", -50],
  ] as const;
  const face = (rot: string) => ({
    transform: `${rot} translateZ(${pass.size / 2}px)`,
    backfaceVisibility: "hidden" as const,
  });

  return (
    <div
      ref={el}
      className="absolute top-0 left-0"
      style={{ width: pass.size, height: pass.size }}
    >
      {/* The shadow: a black copy of the same tumbling cube, so its outline
          is the cube's real silhouette. */}
      <div
        className="absolute inset-0"
        style={{
          perspective: 1100,
          transform: `translate(${offset[0]}%, ${offset[1]}%) rotate(${pass.tilt}deg) scale(1.15)`,
          filter: spec.blurPx ? `blur(${spec.blurPx}px)` : undefined,
          opacity: spec.shadowOpacity,
        }}
      >
        <div
          ref={ghost}
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {faces.map(([rot]) => (
            <div
              key={rot}
              className="absolute inset-0 bg-black"
              style={face(rot)}
            />
          ))}
        </div>
      </div>
      {spec.mode === "cube" && (
        <div
          className="absolute inset-0"
          style={{ perspective: 1100, transform: `rotate(${pass.tilt}deg)` }}
        >
          <div
            ref={cube}
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {faces.map(([rot, lum]) => (
              <div
                key={rot}
                className="absolute inset-0"
                style={{
                  ...face(rot),
                  background: `color-mix(in srgb, ${capColor}, ${lum > 0 ? "white" : "black"} ${Math.abs(lum)}%)`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Cubes({
  axis,
  capColor,
  spec,
}: {
  axis: Axis;
  capColor: string;
  spec: CubeSpec;
}) {
  const [passes, setPasses] = useState<Pass[]>([]);
  const specRef = useRef(spec);
  specRef.current = spec;
  const reduced = usePrefersReducedMotion();
  // No cubes fly by for visitors who asked for reduced motion.
  const enabled = spec.enabled && !reduced;

  useEffect(() => {
    if (!enabled) {
      setPasses([]);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let id = 0;
    const spawn = () => {
      const s = specRef.current;
      const size = rand(s.sizeMin, s.sizeMax);
      // Same turning rate as before over the longer flight.
      const spinDeg = rand(200, 520) * PASS_STRETCH;
      setPasses((c) => [
        ...c,
        {
          id: id++,
          size,
          ...path(s.directions, size, s.blurPx),
          tilt: rand(-30, 30),
          spinAxis: unit([rand(-1, 1), rand(-1, 1), rand(-0.4, 0.4)]),
          spinDeg: spinDeg * (Math.random() < 0.5 ? -1 : 1),
        },
      ]);
      timer = setTimeout(spawn, s.everyS * 1000 * rand(0.6, 1.4));
    };
    timer = setTimeout(spawn, 3000);
    return () => clearTimeout(timer);
  }, [enabled]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[15] overflow-hidden"
      data-lab-nocapture
      aria-hidden
    >
      {passes.map((p) => (
        <Flyer
          key={p.id}
          pass={p}
          spec={spec}
          axis={axis}
          capColor={capColor}
          onDone={() => setPasses((all) => all.filter((x) => x.id !== p.id))}
        />
      ))}
    </div>
  );
}
