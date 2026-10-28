"use client";

import { domToCanvas } from "modern-screenshot";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Cubes } from "./Cubes";
import { SITE } from "./config";
import { driftClock } from "./Drift";
import type { NavState } from "./LabNav";
import { LAB_PAGES, PAGE_COMPONENTS, resolveSkin } from "./LabPages";
import { prismLayout, sliceCount } from "./layout";
import { planTurn } from "./motion";
import type { PrismHandle } from "./PrismScene";

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
const { motion: spec, light, skin: skinSpec } = SITE;
const skins = LAB_PAGES.map((_, i) => resolveSkin(skinSpec, i));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const on = () => setReduced(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function LabApp() {
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
        // modern-screenshot copies each field's -webkit-text-fill-color (the
        // text colour) inline and not its ::placeholder, and the fill colour
        // paints placeholders too, so they went white mid-turn. An empty
        // field shows only its placeholder, so fill it with that colour.
        onCloneNode: (clone) => {
          const live = el.querySelector("input, textarea");
          if (!live || !(clone instanceof Element)) return;
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

  // Intro: spin while the pages are captured, then lock onto page 1.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per scene
  useEffect(() => {
    if (!sceneReady || !layout || !handle.current) return;
    let cancelled = false;
    (async () => {
      setPhase("intro");
      setDomHidden(true);
      await nextFrames();
      handle.current?.startIntro(
        planTurn(0, 1, layout.slices.length, spec.staggerMs),
      );
      await Promise.all([captureAll(), sleep(MIN_INTRO_MS)]);
      if (cancelled) return;
      setPhase("locking");
      await handle.current?.lockIntro(0);
      if (cancelled) return;
      setActive(0);
      setDomHidden(false);
      setPhase("idle");
    })();
    return () => {
      cancelled = true;
    };
  }, [sceneReady]);

  // Pages render at the new size, so re-snapshot them after a rebuild.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only on rebuild
  useEffect(() => {
    if (phaseRef.current === "idle") captureAll();
  }, [layout]);

  const go = useCallback(
    async (to: number) => {
      if (phase !== "idle" || to === active || !layout || !handle.current)
        return;
      if (reducedMotion) {
        setActive(to);
        return;
      }
      setPhase("turning");
      // Freeze the background first, then snapshot both ends of the turn at
      // that frozen frame: the current page may have changed (scroll, input)
      // and the target's old snapshot has the drift where it was minutes ago.
      // The live target then resumes from exactly the frame the slices show.
      driftClock.pause();
      const [fromTex, toTex] = await Promise.all([
        capture(active),
        capture(to),
      ]);
      const fresh = new Map<number, THREE.Texture>();
      if (fromTex) fresh.set(active, fromTex);
      if (toTex) fresh.set(to, toTex);
      replaceTextures(fresh);
      await nextFrames();
      setDomHidden(true);
      await handle.current.turn(
        planTurn(active, to, layout.slices.length, spec.staggerMs),
      );
      setActive(to);
      setDomHidden(false);
      setPhase("idle");
    },
    [phase, active, layout, reducedMotion, capture, replaceTextures],
  );

  const setHandle = useCallback((h: PrismHandle | null) => {
    handle.current = h;
    if (h) setSceneReady(true);
  }, []);

  const idle = phase === "idle";
  const nav: NavState = useMemo(
    () => ({ pages: LAB_PAGES, active, idle, go }),
    [active, idle, go],
  );

  const palette = skins[active].palette;

  return (
    <div
      className="fixed inset-0 overflow-hidden text-white"
      style={{ background: palette.sceneBackground }}
    >
      {layout && (
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
      )}

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
                transition: reducedMotion ? "opacity 250ms ease" : undefined,
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

      {layout && (
        <Cubes
          axis={layout.axis}
          capColor={palette.capColor}
          spec={skinSpec.cubes}
        />
      )}

      {/* The veil stays up until every slice has settled on page 1, so the
          spin only ever shows as loading; then it fades and unmounts. */}
      {veil && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-md transition-opacity duration-500"
          style={{
            opacity: phase === "idle" ? 0 : 1,
            background: "rgba(3,4,5,0.35)",
          }}
          onTransitionEnd={() => {
            if (phaseRef.current === "idle") setVeil(false);
          }}
        >
          <span className="text-sm tracking-[0.6em] text-white/70 uppercase">
            Loading
          </span>
        </div>
      )}
    </div>
  );
}
