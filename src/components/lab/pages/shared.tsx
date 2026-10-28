"use client";

import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Media, mediaSrc, videoSrc } from "../content";
import { Drift } from "../Drift";
import { BODY_FONT, HEADING_FONT } from "../fonts";
import { type NavState, PageNav } from "../LabNav";
import {
  DESIGN,
  type Design,
  type Palette,
  paletteById,
  type SkinSpec,
} from "../presets";

export type Skin = { palette: Palette; design: Design; spec: SkinSpec };
/** The skin of one page: palettes are per page, the design is shared. */
export const resolveSkin = (spec: SkinSpec, page: number): Skin => ({
  palette: paletteById(spec.pagePalettes[page] ?? spec.pagePalettes[0]),
  design: DESIGN,
  spec,
});

export type PageProps = {
  skin: Skin;
  nav: NavState;
  ref?: Ref<HTMLDivElement>;
};

/**
 * The border colour goes through --panel-line: an inline `border` beats any
 * class, so hover and focus states recolour it by setting the variable
 * (`hover:[--panel-line:var(--accent)]`) instead of `border-color`.
 */
export const panel: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--panel-line, var(--line))",
  borderRadius: "var(--radius)",
};

/** Page title: size comes from the design (scaled by the slider) via .lab-h1. */
export const h1 = (d: Design) => `lab-h1 ${d.heading}`;

export function Frame({
  index,
  title,
  skin,
  nav,
  children,
  ref,
  blurHeight = "var(--nav-pad)",
  className = "",
}: {
  index: number;
  title: string;
  skin: Skin;
  nav: NavState;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
  /** How far up from the bottom edge the page blurs out. */
  blurHeight?: string;
  /** Extra classes on the page root, e.g. CSS variables `blurHeight` reads. */
  className?: string;
}) {
  const { palette, design, spec } = skin;
  // The pill nav floats over the content, which blurs out as it reaches it
  // (BottomBlur), so the page runs to the bottom edge and each scroll area
  // pads itself by `--nav-pad` instead.
  // This page's copy of the nav shows itself selected, whatever the app's
  // current page is, so a snapshot of it is right the moment it lands.
  const own: NavState = { ...nav, active: index };
  return (
    <div
      ref={ref}
      data-lab-root
      className={`absolute inset-0 overflow-hidden text-base text-[var(--text)] ${className}`}
      style={
        {
          ...palette.vars,
          "--radius": design.radius,
          "--title-scale": spec.titleScale,
          "--nav-pad": "92px",
          "--nav-bg": `color-mix(in srgb, ${palette.capColor} 92%, transparent)`,
          "--font-heading": HEADING_FONT,
          "--font-body": BODY_FONT,
          fontFamily: "var(--font-body)",
          background: palette.sceneBackground,
        } as CSSProperties
      }
    >
      <Drift palette={palette} spec={spec.drift} />
      <style>{`[data-lab-frame] h1, [data-lab-frame] h2, [data-lab-frame] h3 { font-family: var(--font-heading); }
[data-lab-frame] .lab-h1 { font-size: calc(${design.h1Rem[0]}rem * var(--title-scale)); }
@media (min-width: 640px) { [data-lab-frame] .lab-h1 { font-size: calc(${design.h1Rem[1]}rem * var(--title-scale)); } }
[data-lab-root] { --gutter: 1.5rem; --nav-gutter: 1rem; }
@media (min-width: 640px) { [data-lab-root] { --gutter: 3rem; --nav-gutter: 2.5rem; } }
[data-lab-frame] { padding-inline: max(var(--gutter), calc((100% - var(--page)) / 2 + var(--gutter))); }
[data-lab-nav] { left: max(var(--nav-gutter), calc((100% - var(--page)) / 2 + var(--nav-gutter))); right: max(var(--nav-gutter), calc((100% - var(--page)) / 2 + var(--nav-gutter))); }
[data-lab-frame] [data-lab-scroll] { padding-bottom: var(--nav-pad); }
@media (hover: hover) and (pointer: fine) { [data-lab-frame] [data-lab-scroll]::-webkit-scrollbar-track { margin-bottom: var(--nav-pad); } }
[data-lab-root] .lab-noscrollbar { scrollbar-width: none; }
[data-lab-root] .lab-noscrollbar::-webkit-scrollbar { display: none; }
[data-lab-root] button:not(:disabled), [data-lab-root] a[href] { cursor: pointer; }`}</style>
      <div
        className="relative flex h-full flex-col pt-8 sm:pt-10"
        data-lab-frame
      >
        <div
          className={`flex items-baseline justify-between whitespace-nowrap border-b border-[var(--line)] pb-3 ${design.label}`}
        >
          <span className="text-[var(--accent)]">
            0{index + 1} / {title}
          </span>
          <span className="text-[var(--faint)]">levezze.com</span>
        </div>
        {children}
      </div>
      <BottomBlur height={blurHeight} />
      <PageNav nav={own} design={design} />
    </div>
  );
}

/**
 * The page itself fades into a blur from just above the pill nav down to the
 * bottom edge. Each layer blurs what the layers before it already blurred and
 * starts lower, so the blur deepens smoothly instead of switching on at a
 * line. A light fade to the scene colour sits on top for contrast.
 */
export const BLUR_STEPS = [
  { px: 1, from: 0 },
  { px: 2, from: 15 },
  { px: 4, from: 30 },
  { px: 8, from: 45 },
  { px: 16, from: 60 },
];

export function EdgeBlur({
  side,
  className,
  style,
  maxPx = 16,
  children,
}: {
  /** The edge the blur deepens toward. */
  side: "bottom" | "left" | "right";
  className: string;
  style?: CSSProperties;
  /** The deepest blur; the steps past it are left out. */
  maxPx?: number;
  children?: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={style}
    >
      {BLUR_STEPS.filter((s) => s.px <= maxPx).map((s) => {
        const mask = `linear-gradient(to ${side}, transparent ${s.from}%, black ${s.from + 25}%)`;
        return (
          <div
            key={s.px}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${s.px}px)`,
              WebkitBackdropFilter: `blur(${s.px}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
      {children}
    </div>
  );
}

export function BottomBlur({ height }: { height: string }) {
  return (
    <EdgeBlur side="bottom" className="inset-x-0 bottom-0" style={{ height }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--nav-bg) 45%, transparent))",
        }}
      />
    </EdgeBlur>
  );
}

/**
 * A row of chips that scrolls sideways. The chips fade out at an edge with
 * more of them past it, and the fade grows with the distance left to scroll,
 * so it eases in from nothing instead of switching on.
 *
 * What scrolls behind the row is blurred by a band under it, not by the chips
 * themselves: the row's fade mask cuts its children off from the page behind,
 * so a backdrop blur on a chip would have nothing to blur.
 */
const CHIP_FADE_PX = 48;
const CHIP_BLUR = "blur(8px)";
/** The band eases in over this much above the chips. */
const CHIP_BLUR_RISE_PX = 20;

export function ChipRow({ children }: { children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: 0, right: 0 });
  const update = useCallback(() => {
    const el = row.current;
    if (!el) return;
    const rest = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setFade({
      left: Math.min(Math.max(el.scrollLeft, 0), CHIP_FADE_PX),
      right: Math.min(Math.max(rest, 0), CHIP_FADE_PX),
    });
  }, []);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);
  const mask = `linear-gradient(to right, transparent 0, black ${fade.left}px, black calc(100% - ${fade.right}px), transparent 100%)`;
  return (
    <div className="relative -mx-6 sm:-mx-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          top: -CHIP_BLUR_RISE_PX,
          backdropFilter: CHIP_BLUR,
          WebkitBackdropFilter: CHIP_BLUR,
          maskImage: `linear-gradient(to bottom, transparent, black ${CHIP_BLUR_RISE_PX}px)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent, black ${CHIP_BLUR_RISE_PX}px)`,
        }}
      />
      <div
        ref={row}
        onScroll={update}
        className="lab-noscrollbar relative flex gap-2 overflow-x-auto px-6 pb-3 sm:px-12"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * An image with a loading state: a soft shimmer, and a spinner where there is
 * room, until it has loaded; then it fades in. The placeholder fills the
 * parent, so the parent must be positioned.
 */
export function LoadingImg({
  spinner = true,
  shimmer = true,
  alt = "",
  className = "",
  style,
  ...img
}: ComponentProps<"img"> & { spinner?: boolean; shimmer?: boolean }) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const src = typeof img.src === "string" ? img.src : null;
  const loaded = src !== null && loadedSrc === src;
  // A cached image can finish before React attaches onLoad.
  const ref = useCallback(
    (el: HTMLImageElement | null) => {
      if (el?.complete && el.naturalWidth) setLoadedSrc(src);
    },
    [src],
  );
  return (
    <>
      {!loaded && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex items-center justify-center ${shimmer ? "lab-shimmer" : ""}`}
        >
          {spinner && (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/50 motion-reduce:animate-none" />
          )}
        </span>
      )}
      {/* biome-ignore lint/performance/noImgElement: snapshot needs a same-origin plain img */}
      <img
        ref={ref}
        {...img}
        alt={alt}
        onLoad={() => setLoadedSrc(src)}
        // A broken image stops the spinner rather than spinning forever.
        onError={() => setLoadedSrc(src)}
        className={
          className.includes("transition")
            ? className
            : `${className} transition-opacity duration-300`
        }
        style={{ ...style, ...(loaded ? null : { opacity: 0 }) }}
      />
    </>
  );
}

/**
 * One media item filling its box. A video loops silently, like the GIFs it
 * replaces. Videos never go into the page snapshot: modern-screenshot's video
 * clone waits on a "seeked" event that can never fire, which hung the intro.
 * The poster sits beneath each video instead, so a turn shows that frame.
 */
export function MediaFill({ m, className }: { m: Media; className: string }) {
  if (m.kind === "image")
    return (
      <LoadingImg
        src={mediaSrc(m.key, 1200)}
        alt={m.caption}
        draggable={false}
        className={className}
      />
    );
  return (
    <>
      {m.poster && (
        <LoadingImg
          src={mediaSrc(m.poster)}
          alt=""
          draggable={false}
          className={`absolute inset-0 ${className}`}
        />
      )}
      <video
        src={videoSrc(m.key)}
        poster={m.poster}
        autoPlay
        loop
        muted
        playsInline
        aria-label={m.caption}
        className={`relative ${className}`}
        data-lab-nocapture
      />
    </>
  );
}

export const BackArrow = () => (
  <svg
    width="30"
    height="14"
    viewBox="0 0 30 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    role="presentation"
    className="transition-transform duration-200 group-hover:-translate-x-1.5"
  >
    <path d="M29 7H2M8 1 2 7l6 6" />
  </svg>
);

export function OutLink({
  href,
  label,
  design,
}: {
  href: string;
  label: string;
  design: Design;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group inline-flex items-center gap-2 px-5 py-3 transition-colors hover:text-[var(--accent)] hover:[--panel-line:var(--accent)] focus-visible:[--panel-line:var(--accent)] ${design.label}`}
      style={panel}
    >
      {label}
      <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
    </a>
  );
}
