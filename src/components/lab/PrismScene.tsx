"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import type { Axis, PrismLayout, SliceRect } from "./layout";
import {
  faceForQuarter,
  type MotionSpec,
  type SliceTurn,
  turnDurationMs,
  turnOffsetDeg,
} from "./motion";

export type LightSpec = {
  /** Share of the front-face light that a cast shadow removes, 0..1. */
  shadowStrength: number;
  /** Angle between the key light and the camera axis, degrees. */
  lightAngleDeg: number;
  /**
   * How far the key light swings off the cut toward the top-left corner,
   * degrees: 0 is straight down the cut, 45 is the corner.
   */
  tiltDeg: number;
  /** Shadow edge blur, in shadow-map texels (about 1px at 1440 wide). */
  shadowRadius: number;
  fovDeg: number;
  seamPx: number;
};

export type PrismHandle = {
  /** Run a page turn; resolves when the last slice has settled. */
  turn: (plan: SliceTurn[]) => Promise<void>;
  /** Start the endless loading spin. */
  startIntro: (dirs: SliceTurn[]) => void;
  /** Let every slice keep stepping until it faces `page`, then stop. */
  lockIntro: (page: number) => Promise<void>;
};

type Motion = {
  start: number;
  /** Dev-only timing log: when each slice first moved and when it settled. */
  log?: { started: (number | null)[]; settled: (number | null)[] };
  plan: SliceTurn[];
  /** Quarter index each slice started from. */
  from: number[];
  /** Step count each slice will make; Infinity while the intro spins. */
  steps: number[];
  done?: () => void;
};

const NEVER = Number.MAX_SAFE_INTEGER;
const UP = new THREE.Vector3(0, 0, 1);

/**
 * Key light, `angle` degrees off the camera axis. It comes from the side the
 * cascade starts on, so slice shadows fall along the cut: from the top for
 * portrait rows, from the left for landscape columns, each swung `tilt`
 * degrees toward the top-left so the shadows are not cast dead along the cut.
 */
function lightDirection(angleDeg: number, tiltDeg: number, axis: Axis) {
  const t = THREE.MathUtils.degToRad(angleDeg);
  const phi = THREE.MathUtils.degToRad(
    axis === "y" ? 90 + tiltDeg : 180 - tiltDeg,
  );
  return new THREE.Vector3(
    Math.sin(t) * Math.cos(phi),
    Math.sin(t) * Math.sin(phi),
    Math.cos(t),
  ).normalize();
}

/**
 * Lambert output is albedo * (ambient + key * cos) / PI. Front faces must come
 * out at exactly the texture colour at rest, so ambient + key * cos = PI, and a
 * shadow removes the key share.
 */
function lightIntensities(light: LightSpec, axis: Axis) {
  const cos = lightDirection(light.lightAngleDeg, light.tiltDeg, axis).dot(UP);
  return {
    ambient: Math.PI * (1 - light.shadowStrength),
    key: (Math.PI * light.shadowStrength) / cos,
  };
}

function stripGeometry(width: number, height: number, uv: SliceRect["uv"]) {
  const g = new THREE.PlaneGeometry(width, height);
  const attr = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < attr.count; i++) {
    attr.setXY(
      i,
      uv.u0 + attr.getX(i) * (uv.u1 - uv.u0),
      uv.v0 + attr.getY(i) * (uv.v1 - uv.v0),
    );
  }
  attr.needsUpdate = true;
  return g;
}

function FitCamera({
  layout,
  fovDeg,
}: {
  layout: PrismLayout;
  fovDeg: number;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const dist =
      layout.height / 2 / Math.tan(THREE.MathUtils.degToRad(fovDeg / 2));
    camera.fov = fovDeg;
    camera.position.set(0, 0, layout.depth / 2 + dist);
    camera.near = 1;
    camera.far = dist + layout.depth * 3;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, layout, fovDeg]);
  return null;
}

function KeyLight({
  layout,
  light,
}: {
  layout: PrismLayout;
  light: LightSpec;
}) {
  const { ambient, key } = lightIntensities(light, layout.axis);
  const dir = lightDirection(light.lightAngleDeg, light.tiltDeg, layout.axis);
  const reach = layout.depth * 2.5;
  const half = Math.max(layout.width, layout.height) * 0.75;
  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight
        castShadow
        intensity={key}
        position={[dir.x * reach, dir.y * reach, dir.z * reach]}
        shadow-mapSize={[2048, 2048]}
        shadow-radius={light.shadowRadius}
        shadow-bias={-0.0004}
        shadow-normalBias={1.5}
        shadow-camera-left={-half}
        shadow-camera-right={half}
        shadow-camera-top={half}
        shadow-camera-bottom={-half}
        shadow-camera-near={1}
        shadow-camera-far={reach * 2 + layout.depth}
      />
    </>
  );
}

const BLANK_COLOR = "#0a0c0f";

function Slices({
  layout,
  textures,
  spec,
  light,
  capColor,
  restPage,
  handleRef,
}: {
  layout: PrismLayout;
  textures: (THREE.Texture | null)[];
  spec: MotionSpec;
  light: LightSpec;
  capColor: string;
  restPage: number;
  handleRef: Ref<PrismHandle>;
}) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const quarters = useRef<number[]>([]);
  const motion = useRef<Motion | null>(null);
  const specRef = useRef(spec);
  specRef.current = spec;

  // A new layout always starts at rest on the current page.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restPage is read only on rebuild
  useLayoutEffect(() => {
    quarters.current = layout.slices.map(() => -restPage);
    motion.current = null;
    for (const g of groups.current) {
      if (!g) continue;
      g.rotation.set(0, 0, 0);
      g.rotation[layout.axis] = THREE.MathUtils.degToRad(-restPage * 90);
    }
  }, [layout]);

  const faceMaterials = useMemo(
    () =>
      textures.map(
        (map) =>
          new THREE.MeshLambertMaterial(map ? { map } : { color: BLANK_COLOR }),
      ),
    [textures],
  );
  useEffect(
    () => () => {
      for (const m of faceMaterials) m.dispose();
    },
    [faceMaterials],
  );
  const capMaterial = useMemo(
    () => new THREE.MeshLambertMaterial({ color: capColor }),
    [capColor],
  );

  const geometry = useMemo(() => {
    const seam = light.seamPx;
    return layout.slices.map((s) => {
      const w = layout.axis === "y" ? layout.depth : s.width - seam;
      const h = layout.axis === "y" ? s.height - seam : layout.depth;
      const box =
        layout.axis === "y"
          ? new THREE.BoxGeometry(layout.depth - 1, h, layout.depth - 1)
          : new THREE.BoxGeometry(w, layout.depth - 1, layout.depth - 1);
      return { face: stripGeometry(w, h, s.uv), box };
    });
  }, [layout, light.seamPx]);

  useImperativeHandle(handleRef, () => ({
    turn: (plan) =>
      new Promise<void>((done) => {
        motion.current = {
          start: performance.now(),
          plan,
          from: [...quarters.current],
          steps: plan.map((p) => p.steps),
          done,
        };
      }),
    startIntro: (dirs) => {
      motion.current = {
        start: performance.now(),
        plan: dirs,
        from: [...quarters.current],
        steps: dirs.map(() => NEVER),
      };
    },
    lockIntro: (page) =>
      new Promise<void>((done) => {
        const m = motion.current;
        if (!m) {
          done();
          return;
        }
        const s = specRef.current;
        const period = s.stepMs + s.holdMs;
        const now = performance.now();
        // Steps already started can't be cut short. Every slice runs at least as
        // many steps as the furthest-along one, so they settle in stagger order.
        const started = m.plan.map((p) => {
          const elapsed = now - m.start - p.delayMs;
          return elapsed <= 0 ? 0 : Math.ceil(elapsed / period);
        });
        const floor = Math.max(...started);
        m.steps = m.plan.map((p, i) => {
          let n = floor;
          while (faceForQuarter(m.from[i] + p.dir * n) !== page) n++;
          return n;
        });
        m.done = done;
      }),
  }));

  useFrame(() => {
    const m = motion.current;
    if (!m) return;
    const s = specRef.current;
    const now = performance.now();
    let finished = true;
    m.log ??= {
      started: m.plan.map(() => null),
      settled: m.plan.map(() => null),
    };
    const log = m.log;
    m.plan.forEach((p, i) => {
      const g = groups.current[i];
      const elapsed = now - m.start - p.delayMs;
      const steps = m.steps[i];
      if (elapsed >= 0 && log.started[i] === null)
        log.started[i] = now - m.start;
      if (steps === NEVER || elapsed < turnDurationMs(steps, s)) {
        finished = false;
      } else if (log.settled[i] === null) {
        log.settled[i] = now - m.start;
      }
      const deg = m.from[i] * 90 + p.dir * turnOffsetDeg(elapsed, steps, s);
      if (g) g.rotation[layout.axis] = THREE.MathUtils.degToRad(deg);
    });
    if (finished) {
      quarters.current = m.plan.map((p, i) => m.from[i] + p.dir * m.steps[i]);
      motion.current = null;
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __prismLog?: unknown[] }).__prismLog ??= [];
        (window as unknown as { __prismLog: unknown[] }).__prismLog.push({
          plan: m.plan.map((p, i) => ({ ...p, steps: m.steps[i] })),
          ...log,
        });
      }
      m.done?.();
    }
  });

  return (
    <>
      {layout.slices.map((s, i) => (
        <group
          // biome-ignore lint/suspicious/noArrayIndexKey: slices are positional
          key={i}
          ref={(g) => {
            groups.current[i] = g;
          }}
          position={[s.centerX, s.centerY, 0]}
        >
          <mesh
            geometry={geometry[i].box}
            material={capMaterial}
            castShadow
            receiveShadow
          />
          {faceMaterials.map((mat, p) => (
            <group
              // biome-ignore lint/suspicious/noArrayIndexKey: faces are positional
              key={p}
              rotation={
                layout.axis === "y"
                  ? [0, (p * Math.PI) / 2, 0]
                  : [(p * Math.PI) / 2, 0, 0]
              }
            >
              <mesh
                geometry={geometry[i].face}
                material={mat}
                position={[0, 0, layout.depth / 2]}
                castShadow
                receiveShadow
              />
            </group>
          ))}
        </group>
      ))}
    </>
  );
}

export default function PrismScene(props: {
  sceneBackground: string;
  layout: PrismLayout;
  textures: (THREE.Texture | null)[];
  spec: MotionSpec;
  light: LightSpec;
  capColor: string;
  restPage: number;
  handleRef: Ref<PrismHandle>;
}) {
  return (
    <Canvas
      flat
      // PCF, not PCF-soft: only PCF honours shadow-radius.
      shadows="percentage"
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ position: "fixed", inset: 0 }}
    >
      <color attach="background" args={[props.sceneBackground]} />
      <FitCamera layout={props.layout} fovDeg={props.light.fovDeg} />
      <KeyLight layout={props.layout} light={props.light} />
      <Slices {...props} />
    </Canvas>
  );
}
