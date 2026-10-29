"use client";

import { domToCanvas } from "modern-screenshot";
import { MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { createBackStack } from "./backStack";
import { Cubes } from "./Cubes";
import { SITE } from "./config";
import { driftClock } from "./Drift";
import type { NavState } from "./LabNav";
import { LAB_PAGES, PAGE_COMPONENTS, resolveSkin } from "./LabPages";
import { prismLayout, sliceCount } from "./layout";
import { planTurn } from "./motion";
import type { PrismHandle } from "./PrismScene";
import { ResumeContext } from "./pages/ResumePage";
import type { Resume } from "./profile";
import { usePrefersReducedMotion } from "./useReducedMotion";

const PrismScene = dynamic(() => import("./PrismScene"), { ssr: false });

type Phase = "intro" | "locking" | "idle" | "turning";
type Size = { w: number; h: number };

const MIN_INTRO_MS = 1800;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrames = () =>
  new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r())),
  );
const readSize = (): Size => ({ w: window.innerWidth, h: window.innerHeight });
const {
  motion: spec,
  introMotion,
  introRevealMs,
  light,
  skin: skinSpec,
} = SITE;
const skins = LAB_PAGES.map((_, i) => resolveSkin(skinSpec, i));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Catches a scene that fails to render, so the site carries on without it. */
class SceneBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Prism scene failed; showing the pages without it.", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function LabApp({ resume }: { resume: Resume }) {
  const [size, setSize] = useState<Size | null>(null);
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [domHidden, setDomHidden] = useState(true);
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>(
    LAB_PAGES.map(() => null),
  );
  const [sceneReady, setSceneReady] = useState(false);
  const [veil, setVeil] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  // Without the prism (no WebGL, or it failed) the pages show directly and
  // turn instantly, as they do for reduced motion.
  const [noPrism, setNoPrism] = useState(false);
  const still = reducedMotion || noPrism;
  // Read inside the intro, which runs once and outlives later renders.
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;
  const noPrismRef = useRef(noPrism);
  noPrismRef.current = noPrism;

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const handle = useRef<PrismHandle | null>(null);
  const texturesRef = useRef(textures);
  texturesRef.current = textures;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const pendingSize = useRef<Size | null>(null);

  const layout = useMemo(
    () =>
      size ? prismLayout(size.w, size.h, sliceCount(size.w, size.h)) : null,
    [size],
  );

  // Resizes rebuild the prism, so they only land while it is at rest.
  useEffect(() => {
    setSize(readSize());
    if (!hasWebGL()) setNoPrism(true);
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (phaseRef.current === "idle") setSize(readSize());
        else pendingSize.current = readSize();
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  useEffect(() => {
    if (phase === "idle" && pendingSize.current) {
      setSize(pendingSize.current);
      pendingSize.current = null;
    }
  }, [phase]);

  useEffect(() => {
    if (!noPrism) return;
    setDomHidden(false);
    setPhase("idle");
  }, [noPrism]);

  // While the pages are hidden the prism shows a snapshot of them, so the
  // background drift freezes with it and picks up from the same frame after.
  useEffect(() => {
    if (domHidden) driftClock.pause();
    else driftClock.resume();
  }, [domHidden]);

  // Scrollbars show only while their area scrolls (globals.css): mark the
  // scrolling element, and unmark it once it has been still for a moment.
  useEffect(() => {
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const onScroll = (e: Event) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      el.setAttribute("data-scrolling", "");
      clearTimeout(timers.get(el));
      timers.set(
        el,
        setTimeout(() => {
          el.removeAttribute("data-scrolling");
          timers.delete(el);
        }, 900),
      );
    };
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("scroll", onScroll, true);
      for (const t of timers.values()) clearTimeout(t);
    };
  }, []);

  const capture = useCallback(
    async (i: number) => {
      const el = pageRefs.current[i];
      if (!el || !size) return null;
      const canvas = await domToCanvas(el, {
        scale: Math.min(window.devicePixelRatio, 2),
        width: size.w,
        height: size.h,
        features: { restoreScrollPosition: true },
        onCloneNode: (clone) => {
          if (!(clone instanceof HTMLElement)) return;
          // The copy pins every box to its on-screen width. Without kerning
          // (modern-screenshot turns it back on in Chrome only) Safari sets
          // the copy's text a hair wider, and a label one line wide on
          // screen wraps to two mid-turn. Kerning on keeps the widths equal.
          clone.style.fontKerning = "normal";
          // modern-screenshot copies each field's -webkit-text-fill-color (the
          // text colour) inline and not its ::placeholder, and the fill colour
          // paints placeholders too, so they went white mid-turn. An empty
          // field shows only its placeholder, so fill it with that colour.
          const live = el.querySelector("input, textarea");
          if (!live) return;
          const color = getComputedStyle(live, "::placeholder").color;
          for (const f of clone.querySelectorAll<HTMLElement>(
            "input[placeholder], textarea[placeholder]",
          )) {
            if (!f.getAttribute("value"))
              f.style.setProperty("-webkit-text-fill-color", color);
          }
        },
        filter: (node) =>
          !(
            node instanceof HTMLElement &&
            node.dataset.labNocapture !== undefined
          ),
      });
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    },
    [size],
  );

  const replaceTextures = useCallback((next: Map<number, THREE.Texture>) => {
    const old = texturesRef.current;
    const merged = old.map((t, i) => {
      const n = next.get(i);
      if (!n) return t;
      t?.dispose();
      return n;
    });
    setTextures(merged);
  }, []);

  const captureAll = useCallback(async () => {
    await document.fonts.ready;
    const next = new Map<number, THREE.Texture>();
    for (let i = 0; i < LAB_PAGES.length; i++) {
      const tex = await capture(i);
      if (tex) next.set(i, tex);
    }
    replaceTextures(next);
  }, [capture, replaceTextures]);

  // Intro: spin while the pages are captured, then lock onto page 1. With
  // reduced motion the slices just rest on page 1 behind the veil. If the
  // scene fails partway, the no-prism fallback has taken over: stop.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per scene
  useEffect(() => {
    if (!sceneReady || !layout || !handle.current) return;
    let cancelled = false;
    let reveal: number | undefined;
    (async () => {
      setPhase("intro");
      setDomHidden(true);
      await nextFrames();
      const spin = !reducedRef.current;
      if (spin)
        handle.current?.startIntro(
          planTurn(0, 1, layout.slices.length, introMotion.staggerMs),
          introMotion,
        );
      await Promise.all([captureAll(), spin && sleep(MIN_INTRO_MS)]);
      if (cancelled || noPrismRef.current) return;
      // The lock can run several steps past ready, so time the veil from its
      // end: it lifts `introRevealMs` before the last slice settles, and only
      // the last of the spin shows in the clear.
      if (spin)
        await handle.current?.lockIntro(0, (endsAt) => {
          reveal = window.setTimeout(
            () => setPhase("locking"),
            Math.max(0, endsAt - introRevealMs - performance.now()),
          );
        });
      else handle.current?.snap(0);
      window.clearTimeout(reveal);
      if (cancelled || noPrismRef.current) return;
      setActive(0);
      setDomHidden(false);
      setPhase("idle");
    })().catch((error) => {
      // A failed snapshot would leave the Loading veil up for good.
      console.error(
        "Intro failed; showing the pages without the prism.",
        error,
      );
      if (!cancelled) setNoPrism(true);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(reveal);
    };
  }, [sceneReady]);

  // Pages render at the new size, so re-snapshot them after a rebuild.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only on rebuild
  useEffect(() => {
    if (phaseRef.current === "idle" && !noPrism) captureAll();
  }, [layout]);

  // The browser's back button undoes page turns and the pages' own steps.
  const back = useRef<ReturnType<typeof createBackStack> | null>(null);
  useEffect(() => {
    const stack = createBackStack(window);
    back.current = stack;
    return () => stack.dispose();
  }, []);
  const remember = useCallback(
    (undo: () => unknown) => back.current?.push(undo) ?? (() => undo()),
    [],
  );

  const turn = useCallback(
    async (from: number, to: number) => {
      const prism = handle.current;
      if (still || !layout || !prism) {
        // Keep the slices on the shown page for when motion comes back.
        prism?.snap(to);
        setActive(to);
        setPhase("idle");
        return;
      }
      // Freeze the background first, then snapshot both ends of the turn at
      // that frozen frame: the current page may have changed (scroll, input)
      // and the target's old snapshot has the drift where it was minutes ago.
      // The live target then resumes from exactly the frame the slices show.
      driftClock.pause();
      try {
        const [fromTex, toTex] = await Promise.all([
          capture(from),
          capture(to),
        ]);
        const fresh = new Map<number, THREE.Texture>();
        if (fromTex) fresh.set(from, fromTex);
        if (toTex) fresh.set(to, toTex);
        replaceTextures(fresh);
        await nextFrames();
        setDomHidden(true);
        await prism.turn(
          planTurn(from, to, layout.slices.length, spec.staggerMs),
        );
      } catch (error) {
        // Still land on the page, just without the animation.
        console.error("Page turn failed; switching without it.", error);
        prism.snap(to);
        driftClock.resume();
      }
      setActive(to);
      setDomHidden(false);
      setPhase("idle");
    },
    [layout, still, capture, replaceTextures],
  );

  // A back press undoes a turn through this ref, so it reads the app as it is
  // then, not as it was when the turn was recorded.
  const goRef = useRef<(to: number, fromHistory?: boolean) => boolean>(
    () => false,
  );
  // Returns false when a turn is already running, so a back press can retry.
  const go = useCallback(
    (to: number, fromHistory = false) => {
      // Busy first: a back press mid-turn, while `active` is still the page
      // it left, must be refused and kept for a retry, not taken as done.
      if (phaseRef.current !== "idle" || !layout) return false;
      if (to === active) return true;
      // Mark the turn started now: two quick calls would both see "idle".
      phaseRef.current = "turning";
      setPhase("turning");
      const from = active;
      if (!fromHistory) remember(() => goRef.current(from, true));
      void turn(from, to);
      return true;
    },
    [active, layout, remember, turn],
  );
  goRef.current = go;

  const setHandle = useCallback((h: PrismHandle | null) => {
    handle.current = h;
    if (h) setSceneReady(true);
  }, []);

  const idle = phase === "idle";
  const nav: NavState = useMemo(
    () => ({ pages: LAB_PAGES, active, idle, go, remember }),
    [active, idle, go, remember],
  );

  const palette = skins[active].palette;

  return (
    // Motion's own transitions (layout, fades, swaps) follow the visitor's
    // reduced-motion setting too.
    <MotionConfig reducedMotion="user">
      <div
        className="fixed inset-0 overflow-hidden text-white"
        style={{ background: palette.sceneBackground }}
      >
        {layout && !noPrism && (
          <SceneBoundary onError={() => setNoPrism(true)}>
            <PrismScene
              layout={layout}
              textures={textures}
              spec={spec}
              light={light}
              capColor={palette.capColor}
              sceneBackground={palette.sceneBackground}
              restPage={active}
              handleRef={setHandle}
            />
          </SceneBoundary>
        )}

        <ResumeContext value={resume}>
          <div className="fixed inset-0 z-10" aria-hidden={domHidden}>
            {PAGE_COMPONENTS.map((Page, i) => {
              const visible = !domHidden && i === active;
              return (
                <div
                  key={LAB_PAGES[i]}
                  className="absolute inset-0"
                  // Hidden pages stay rendered (opacity 0) so they can be
                  // snapshotted, but must not take clicks or focus.
                  inert={!visible}
                  style={{
                    opacity: visible ? 1 : 0,
                    pointerEvents: visible ? "auto" : "none",
                    transition: still ? "opacity 250ms ease" : undefined,
                  }}
                >
                  <Page
                    skin={skins[i]}
                    nav={nav}
                    ref={(el: HTMLDivElement | null) => {
                      pageRefs.current[i] = el;
                    }}
                  />
                </div>
              );
            })}
          </div>
        </ResumeContext>

        {layout && (
          <Cubes
            axis={layout.axis}
            capColor={palette.capColor}
            spec={skinSpec.cubes}
          />
        )}

        {/* The veil stays up while the pages load, then fades and unmounts
          as the slices finish spinning and lock onto page 1. */}
        {veil && (
          <div
            className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-2xl transition-opacity duration-500"
            style={{
              opacity: phase === "intro" ? 1 : 0,
              background: "rgba(3,4,5,0.55)",
            }}
            onTransitionEnd={() => {
              if (phaseRef.current !== "intro") setVeil(false);
            }}
          >
            <span className="text-sm tracking-[0.6em] text-white/70 uppercase">
              Loading
            </span>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
