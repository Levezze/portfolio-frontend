"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { CHAT_LIMIT, MAX_MESSAGE_CHARS } from "./chat";
import {
  type ContactErrors,
  type ContactValues,
  emailConfig,
  emailParams,
  validateContact,
} from "./contact";
import {
  CONTACT,
  type Media,
  mediaSrc,
  PROJECTS,
  type Project,
  RESUME,
  SUGGESTIONS,
  videoSrc,
  WELCOME,
} from "./content";
import { Drift } from "./Drift";
import { BODY_FONT, HEADING_FONT } from "./fonts";
import { LabMarkdown } from "./LabMarkdown";
import { type NavState, PageNav } from "./LabNav";
import {
  DESIGN,
  type Design,
  type Palette,
  paletteById,
  type SkinSpec,
} from "./presets";
import { useLabChat } from "./useLabChat";

/**
 * The lab's four pages, with the site's real content (content.ts) and a chat
 * wired to the real backend over the existing WebSocket.
 *
 * A skin is a palette (colour) plus a design (type, cards, labels, nav). The
 * pages read both through `Skin` and never hardcode either.
 */

export const LAB_PAGES = ["Chat", "Projects", "Resume", "Contact"] as const;

export type Skin = { palette: Palette; design: Design; spec: SkinSpec };
/** The skin of one page: palettes are per page, the design is shared. */
export const resolveSkin = (spec: SkinSpec, page: number): Skin => ({
  palette: paletteById(spec.pagePalettes[page] ?? spec.pagePalettes[0]),
  design: DESIGN,
  spec,
});

type PageProps = { skin: Skin; nav: NavState; ref?: Ref<HTMLDivElement> };

const panel: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius)",
};

/** Page title: size comes from the design (scaled by the slider) via .lab-h1. */
const h1 = (d: Design) => `lab-h1 ${d.heading}`;

function Frame({
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
          className={`flex items-baseline justify-between border-b border-[var(--line)] pb-3 ${design.label}`}
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
const BLUR_STEPS = [
  { px: 1, from: 0 },
  { px: 2, from: 15 },
  { px: 4, from: 30 },
  { px: 8, from: 45 },
  { px: 16, from: 60 },
];

function EdgeBlur({
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

function BottomBlur({ height }: { height: string }) {
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
 * A row that scrolls sideways with no scrollbar. It runs out past the page
 * padding to the screen edges, and whatever sits beyond the content column
 * blurs out: on the right while there is more to see, on the left once it
 * has been scrolled.
 */
function ChipRow({ children }: { children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const update = useCallback(() => {
    const el = row.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
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
  const fade = (on: boolean) => ({
    opacity: on ? 1 : 0,
    transition: "opacity 200ms ease",
  });
  return (
    <div className="relative -mx-6 sm:-mx-12">
      <div
        ref={row}
        onScroll={update}
        className="lab-noscrollbar flex gap-2 overflow-x-auto px-6 pb-3 sm:px-12"
      >
        {children}
      </div>
      {/* Softer than the nav's blur: a chip half out of view stays legible. */}
      <EdgeBlur
        side="left"
        className="inset-y-0 left-0 w-10 sm:w-12"
        style={fade(edges.left)}
        maxPx={4}
      />
      <EdgeBlur
        side="right"
        className="inset-y-0 right-0 w-10 sm:w-12"
        style={fade(edges.right)}
        maxPx={4}
      />
    </div>
  );
}

function Avatar({ children }: { children: ReactNode }) {
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
      {children}
    </div>
  );
}

const LevAvatar = () => (
  <Avatar>
    {/* biome-ignore lint/performance/noImgElement: snapshot test needs a plain img */}
    <img
      src="/images/photo-lev.jpg"
      alt=""
      className="h-full w-full object-cover grayscale"
    />
  </Avatar>
);

const GimliAvatar = () => (
  <Avatar>
    {/* biome-ignore lint/performance/noImgElement: snapshot test needs a plain img */}
    <img
      src="/gimli-ai/gimli-ai-avatar-1.webp"
      alt=""
      className="h-full w-full object-cover"
    />
  </Avatar>
);

function Message({
  from,
  avatar,
  design,
  children,
}: {
  from: string;
  avatar: ReactNode;
  design: Design;
  children: ReactNode;
}) {
  // On phones the avatar and name sit on their own row and the bubble goes
  // underneath, so it gets the column's full width; from sm up, side by side.
  const name = (
    <div className={`text-[var(--faint)] ${design.label}`}>{from}</div>
  );
  return (
    <div className="max-w-[85%] sm:flex sm:gap-4">
      <div className="flex items-center gap-3 sm:block">
        {avatar}
        <div className="sm:hidden">{name}</div>
      </div>
      <div className="min-w-0">
        <div className="hidden sm:block">{name}</div>
        <div className="mt-2 space-y-2 px-5 py-4" style={panel}>
          {children}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div
      // Phones share the left side's 85% so both read at one width.
      className="ml-auto max-w-[85%] px-5 py-3 whitespace-pre-wrap sm:max-w-[75%]"
      style={{
        ...panel,
        background: "color-mix(in srgb, var(--accent) 16%, var(--surface))",
      }}
    >
      {text}
    </div>
  );
}

function Typing() {
  return (
    <output className="flex gap-1.5 py-1.5" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-[var(--muted)]"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </output>
  );
}

/**
 * The composer floats just above the nav, and the messages scroll the full
 * height behind it, blurring out as they reach it like every other page does
 * at the nav. The scroller is not a `data-lab-scroll` area: it pads itself by
 * the composer's measured height instead of by `--nav-pad`.
 */
const DOCK_OFFSET = "var(--dock-offset)";
function ChatPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const { turns, status, send, left, reset } = useLabChat(nav);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [dockH, setDockH] = useState(0);
  const busy = status === "waiting" || status === "streaming";
  const lastText = turns.at(-1)?.text;

  // biome-ignore lint/correctness/useExhaustiveDependencies: follow every new message and streamed chunk
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, lastText, status]);

  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDockH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const submit = (text: string) => {
    if (busy || !text.trim()) return;
    send(text);
    setDraft("");
  };

  // From the bottom edge to the top of the composer.
  const dockTop = `calc(${DOCK_OFFSET} + ${dockH}px)`;

  return (
    <Frame
      index={0}
      title="Chat"
      skin={skin}
      nav={nav}
      ref={ref}
      blurHeight={`calc(${dockTop} + 24px)`}
      // Set on the page root: the blur sits there too, and an undefined
      // variable made its height calc() invalid, so nothing blurred.
      className="[--dock-offset:72px] sm:[--dock-offset:84px]"
    >
      <div className="relative min-h-0 flex-1">
        <div
          ref={scroller}
          className="absolute inset-0 overflow-y-auto pr-1"
          style={{ paddingBottom: `calc(${dockTop} + 8px)` }}
        >
          <div className="flex min-h-full flex-col">
            <div className="mt-auto flex flex-col gap-6 pt-8 pb-6">
              <Message
                from={WELCOME.name}
                avatar={<LevAvatar />}
                design={design}
              >
                <p>{WELCOME.intro}</p>
              </Message>
              <Message from="Gimli" avatar={<GimliAvatar />} design={design}>
                <p>{WELCOME.gimli}</p>
              </Message>
              {turns.map((t, i) =>
                t.role === "user" ? (
                  <UserMessage key={`u${i.toString()}`} text={t.text} />
                ) : t.text ? (
                  <Message
                    key={`a${i.toString()}`}
                    from="Gimli"
                    avatar={<GimliAvatar />}
                    design={design}
                  >
                    {t.error ? (
                      <p className="text-[var(--muted)]">{t.text}</p>
                    ) : (
                      <LabMarkdown text={t.text} />
                    )}
                  </Message>
                ) : null,
              )}
              {status === "waiting" && (
                <Message from="Gimli" avatar={<GimliAvatar />} design={design}>
                  <Typing />
                </Message>
              )}
              {status === "offline" && (
                <p className="text-sm text-[var(--faint)]">
                  The chat is offline right now. Try again in a bit, or reach
                  Lev through the contact page.
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          ref={dock}
          className="absolute inset-x-0 z-10"
          style={{ bottom: DOCK_OFFSET }}
        >
          {turns.length === 0 && (
            <ChipRow>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => submit(s.prompt)}
                  className="shrink-0 rounded-full px-3.5 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
                  style={{ ...panel, borderRadius: 999 }}
                >
                  {s.title}
                </button>
              ))}
            </ChipRow>
          )}
          {left === 0 && !busy ? (
            // The soft cap: one chat holds CHAT_LIMIT messages.
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{
                ...panel,
                background: "var(--nav-bg)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
            >
              <p className="min-w-0 flex-1 text-sm text-[var(--muted)]">
                That's {CHAT_LIMIT} messages, the most one chat holds. Start a
                new one to keep talking.
              </p>
              <button
                type="button"
                onClick={reset}
                className={`shrink-0 text-[var(--accent)] transition-opacity hover:opacity-70 ${design.label}`}
              >
                New chat
              </button>
            </div>
          ) : (
            <form
              className="flex items-center gap-3 px-5 py-2"
              style={{
                ...panel,
                // Solid like the nav: the messages scroll behind it.
                background: "var(--nav-bg)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
              onSubmit={(e) => {
                e.preventDefault();
                submit(draft);
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message…"
                aria-label="Message"
                maxLength={MAX_MESSAGE_CHARS}
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[var(--faint)]"
              />
              {left < CHAT_LIMIT && (
                <span
                  className="shrink-0 text-sm tabular-nums"
                  style={{
                    color: left <= 3 ? "var(--accent)" : "var(--faint)",
                  }}
                  title="Messages in this chat"
                >
                  {CHAT_LIMIT - left}/{CHAT_LIMIT}
                </span>
              )}
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className={`text-[var(--accent)] transition-opacity hover:opacity-70 disabled:opacity-40 ${design.label}`}
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </Frame>
  );
}

const swap = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.7, 0, 0.3, 1] as const },
};

const headingFont = { fontFamily: "var(--font-heading)" };

/**
 * An image with a loading state: a soft shimmer, and a spinner where there is
 * room, until it has loaded; then it fades in. The placeholder fills the
 * parent, so the parent must be positioned.
 */
function LoadingImg({
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
function MediaFill({ m, className }: { m: Media; className: string }) {
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

/** One project in the list, in the design's card build. */
function ProjectCard({
  p,
  i,
  design,
  onOpen,
}: {
  p: Project;
  i: number;
  design: Design;
  onOpen: () => void;
}) {
  const n = String(i + 1).padStart(2, "0");
  return (
    <motion.button
      layoutId={`card-${p.slug}`}
      type="button"
      onClick={onOpen}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="group relative flex flex-col overflow-hidden text-left transition-colors hover:bg-[var(--surface)]"
      style={{ background: "var(--well)", borderRadius: "var(--radius)" }}
    >
      <span className="relative block h-40 overflow-hidden sm:h-48">
        {p.thumb ? (
          <MediaFill
            m={p.thumb}
            className="h-full w-full object-cover opacity-70 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : (
          <LoadingImg
            src={mediaSrc(p.still, 828)}
            alt=""
            loading="lazy"
            className={`h-full w-full opacity-70 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100 ${p.logo ? "object-scale-down p-8" : "object-cover"}`}
          />
        )}
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[var(--muted)] ${design.label}`}
          style={{ background: "var(--well)" }}
        >
          {n}
        </span>
      </span>
      <span className="block p-5">
        <span
          className={`block text-2xl ${design.heading}`}
          style={headingFont}
        >
          {p.name}
        </span>
        <span className="mt-1 block text-sm text-[var(--muted)]">
          {p.short}
        </span>
      </span>
    </motion.button>
  );
}

const BackArrow = () => (
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

/**
 * The small row above the scroll area holds the count in the list and the
 * back link in the detail, so Back is always in reach. The big title sits at
 * the top of each scroll area and scrolls away with the content.
 */
function ProjectsPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const [open, setOpen] = useState<Project | null>(null);
  // Closes the open project through history, so browser back stays in step.
  const close = useRef(() => setOpen(null));
  const openProject = (p: Project) => {
    setOpen(p);
    close.current = nav.remember(() => setOpen(null));
  };
  const group = useId();
  const grid = "mt-8 grid grid-cols-1 content-start gap-3 sm:grid-cols-2";
  return (
    <Frame index={1} title="Projects" skin={skin} nav={nav} ref={ref}>
      <LayoutGroup id={group}>
        <div className={`mt-6 flex h-8 items-center ${design.label}`}>
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.button
                key="back"
                type="button"
                onClick={() => close.current()}
                className="group -mx-2 flex items-center gap-3 rounded-full px-2 py-1 text-[var(--accent)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
                {...swap}
              >
                <BackArrow />
                All projects
              </motion.button>
            ) : (
              <motion.span
                key="count"
                className="text-[var(--faint)]"
                {...swap}
              >
                {PROJECTS.length} projects
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="relative mt-2 min-h-0 flex-1">
          <AnimatePresence initial={false}>
            {open ? (
              <ProjectDetail
                key="detail"
                project={open}
                design={design}
                remember={nav.remember}
              />
            ) : (
              <motion.div
                key="list"
                className="absolute inset-0 overflow-y-auto pr-1"
                data-lab-scroll
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className={h1(design)}>Projects</h1>
                <div className={grid}>
                  {PROJECTS.map((p, i) => (
                    <ProjectCard
                      key={p.slug}
                      p={p}
                      i={i}
                      design={design}
                      onOpen={() => openProject(p)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </Frame>
  );
}

function OutLink({
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
      className={`group inline-flex items-center gap-2 px-5 py-3 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] ${design.label}`}
      style={panel}
    >
      {label}
      <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
    </a>
  );
}

/** Drag distance, px, that counts as a swipe to the next item. */
const SWIPE = 60;

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    aria-hidden
    role="presentation"
  >
    <path d="M2 2l14 14M16 2 2 16" />
  </svg>
);

/**
 * One gallery item floating over the site in a modal dialog, at the largest
 * size the window allows. The dialog sits in the top layer, so the page's
 * overflow and the prism's transforms don't clip it. Escape, the backdrop and
 * the close button shut it; the arrow keys step through the items.
 */
function Lightbox({
  items,
  at,
  onStep,
  onClose,
}: {
  items: Media[];
  at: number | null;
  onStep: (d: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = at !== null;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  const m = at === null ? null : items[at];
  return (
    <dialog
      ref={ref}
      aria-label={m?.caption}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d && items.length > 1) onStep(d);
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-white backdrop:bg-black/80 backdrop:backdrop-blur-sm open:flex open:flex-col open:items-center open:justify-center"
      data-lab-nocapture
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-md transition-colors hover:text-white sm:top-6 sm:right-6"
      >
        <CloseIcon />
      </button>
      {m &&
        (m.kind === "image" ? (
          <LoadingImg
            // The dialog is the placeholder's box: a spinner, no shimmer.
            shimmer={false}
            src={mediaSrc(m.key, 1920)}
            alt={m.caption}
            className="max-h-[calc(100dvh-7rem)] max-w-[calc(100vw-2rem)] object-contain sm:max-w-[calc(100vw-8rem)]"
          />
        ) : (
          <video
            src={videoSrc(m.key)}
            poster={m.poster}
            autoPlay
            loop
            muted
            playsInline
            controls
            aria-label={m.caption}
            className="max-h-[calc(100dvh-7rem)] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-8rem)]"
          />
        ))}
      {m && (
        <div className="mt-4 text-sm text-white/70">
          {m.caption}
          {items.length > 1 && (
            <span className="ml-3 tabular-nums text-white/50">
              {(at ?? 0) + 1} / {items.length}
            </span>
          )}
        </div>
      )}
    </dialog>
  );
}

/**
 * The project's media at the top of its page: one item at a time, switched by
 * its thumbnail, a horizontal swipe or the arrow keys. Only the shown item is
 * mounted, so the page snapshot always matches the screen and the large
 * videos load only when picked.
 */
function Gallery({
  project,
  remember,
}: {
  project: Project;
  remember: NavState["remember"];
}) {
  // The list tile's light thumb stays on the list; here it's full quality.
  const items = project.media;
  const [at, setAt] = useState(0);
  const step = (d: number) =>
    setAt((i) => (i + d + items.length) % items.length);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const unzoom = useRef(() => setZoomed(null));
  const zoom = (i: number) => {
    setZoomed(i);
    unzoom.current = remember(() => setZoomed(null));
  };
  // Motion still fires onTap after a drag released over the item, so a press
  // that dragged at all is a swipe, never an open.
  const dragged = useRef(false);
  const m = items[at];
  const many = items.length > 1;
  // Capped narrower than the page column: the content leads, the media supports.
  return (
    <div className="mt-6 max-w-5xl">
      <motion.div
        layoutId={`card-${project.slug}`}
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={{ ...panel, background: "var(--well)" }}
        transition={{ duration: 0.4, ease: [0.7, 0, 0.3, 1] }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={m.key}
            className={`absolute inset-0 cursor-zoom-in ${many ? "touch-pan-y" : ""}`}
            // A tap opens the item larger; a swipe only changes the item.
            onTapStart={() => {
              dragged.current = false;
            }}
            onTap={() => {
              if (!dragged.current) zoom(at);
            }}
            onDragStart={() => {
              dragged.current = true;
            }}
            drag={many ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE || info.velocity.x < -500) step(1);
              else if (info.offset.x > SWIPE || info.velocity.x > 500) step(-1);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <MediaFill
              m={m}
              className={`pointer-events-none h-full w-full ${project.logo ? "object-scale-down p-12" : "object-contain"}`}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="mt-3 flex items-baseline justify-between gap-4 text-sm text-[var(--faint)]">
        <span>{m.caption}</span>
        {many && (
          <span className="shrink-0 tabular-nums">
            {at + 1} / {items.length}
          </span>
        )}
      </div>
      {many && (
        <div className="lab-noscrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto p-1">
          {items.map((it, i) => (
            <button
              key={it.key}
              type="button"
              onClick={() => setAt(i)}
              onKeyDown={(e) => {
                const d =
                  e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!d) return;
                e.preventDefault();
                const next = (i + d + items.length) % items.length;
                setAt(next);
                const strip = e.currentTarget.parentElement;
                (strip?.children[next] as HTMLElement | undefined)?.focus();
              }}
              aria-label={`Show ${it.caption}`}
              aria-current={i === at}
              className={`relative h-14 w-[5.5rem] shrink-0 overflow-hidden transition-[opacity,border-color] duration-200 ${i === at ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
              style={{
                ...panel,
                background: "var(--well)",
                borderColor: i === at ? "var(--accent)" : "var(--line)",
              }}
            >
              <LoadingImg
                spinner={false}
                src={mediaSrc(it.poster ?? it.key, 256)}
                alt=""
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <Lightbox
        items={items}
        at={zoomed}
        onStep={(d) => {
          const next = ((zoomed ?? 0) + d + items.length) % items.length;
          setZoomed(next);
          setAt(next);
        }}
        onClose={() => unzoom.current()}
      />
    </div>
  );
}

function ProjectDetail({
  project,
  design,
  remember,
}: {
  project: Project;
  design: Design;
  remember: NavState["remember"];
}) {
  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto pr-1"
      data-lab-scroll
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className={h1(design)}>{project.name}</h1>
      <Gallery project={project} remember={remember} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <p className="mt-6 text-xl">{project.short}</p>
        {(project.demo || project.github) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.demo && (
              <OutLink href={project.demo} label="Live site" design={design} />
            )}
            {project.github && (
              <OutLink href={project.github} label="GitHub" design={design} />
            )}
          </div>
        )}
        {project.description.map((para) => (
          <p
            key={para.slice(0, 32)}
            className="mt-4 text-[var(--muted)] leading-relaxed"
          >
            {para}
          </p>
        ))}
        <div className={`mt-8 text-[var(--faint)] ${design.label}`}>Stack</div>
        <div className="mt-3 flex flex-wrap gap-1.5 pb-4 sm:gap-2">
          {project.stack.map((s) => (
            <span key={s} className="px-2.5 py-1 text-sm" style={panel}>
              {s}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Node centre, from the top of each entry: py-5 (20px) plus half the h-6
 * years row (12px). The line is drawn per entry from this point, so it
 * starts in the first node and ends in the last.
 */
const NODE_Y = 32;
const NODE = 9;

function Timeline({
  items,
  design,
}: {
  items: { key: string; years: string; body: ReactNode }[];
  design: Design;
}) {
  return (
    <ol className="mt-3 ml-2">
      {items.map((it, i) => {
        const first = i === 0;
        const last = i === items.length - 1;
        return (
          <li
            key={it.key}
            className="group relative py-5 pl-8 transition-colors hover:bg-[var(--surface)]"
            style={{ borderRadius: "var(--radius)" }}
          >
            {items.length > 1 && (
              <span
                aria-hidden
                className="absolute left-0 w-px bg-[var(--line)]"
                style={
                  first
                    ? { top: NODE_Y, bottom: 0 }
                    : last
                      ? { top: 0, height: NODE_Y }
                      : { top: 0, bottom: 0 }
                }
              />
            )}
            <span
              aria-hidden
              className={`absolute rounded-full transition-colors ${
                first
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--faint)] group-hover:bg-[var(--accent)]"
              }`}
              style={{
                width: NODE,
                height: NODE,
                top: NODE_Y - NODE / 2,
                left: 0.5 - NODE / 2,
              }}
            />
            <div
              className={`flex h-6 items-center text-[var(--faint)] ${design.label}`}
            >
              <span className={first ? "text-[var(--accent)]" : ""}>
                {it.years}
              </span>
            </div>
            {it.body}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * One skill group, collapsed to its first row of badges. A click anywhere on
 * it, heading or badge, opens or closes it.
 */
function SkillGroup({
  group,
  items,
  design,
}: {
  group: string;
  items: string[];
  design: Design;
}) {
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLSpanElement>(null);
  // Row height, full height, and how many badges sit below the first row.
  const [size, setSize] = useState({ row: 0, full: 0, hidden: 0 });
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => {
      const badges = [...el.children] as HTMLElement[];
      const top = badges[0]?.offsetTop ?? 0;
      setSize({
        row: badges[0]?.offsetHeight ?? 0,
        full: el.scrollHeight,
        hidden: badges.filter((b) => b.offsetTop > top).length,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const folds = size.hidden > 0;
  return (
    <button
      type="button"
      aria-expanded={folds ? open : undefined}
      onClick={() => folds && setOpen((o) => !o)}
      className="block w-full text-left"
    >
      <span
        className={`flex items-center justify-between gap-3 text-[var(--faint)] ${design.label}`}
      >
        {group}
        {folds && (
          <span className="flex items-center gap-2">
            {!open && <span>+{size.hidden}</span>}
            <motion.span
              aria-hidden
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              ⌄
            </motion.span>
          </span>
        )}
      </span>
      <motion.span
        className="mt-2 block overflow-hidden"
        initial={false}
        animate={{
          height: size.row === 0 ? "auto" : open ? size.full : size.row,
        }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <span ref={list} className="flex flex-wrap gap-1.5 sm:gap-2">
          {items.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 text-sm sm:px-3 sm:py-1.5"
              style={panel}
            >
              {s}
            </span>
          ))}
        </span>
      </motion.span>
    </button>
  );
}

function ResumePage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const section = `mt-10 text-[var(--faint)] ${design.label}`;
  return (
    <Frame index={2} title="Resume" skin={skin} nav={nav} ref={ref}>
      <h1 className={`mt-8 ${h1(design)}`}>{RESUME.name}</h1>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2" data-lab-scroll>
        <p>{RESUME.tagline}</p>
        <p className="mt-3 text-[var(--muted)]">{RESUME.summary}</p>
        <div className="mt-6 grid items-start gap-4 sm:grid-cols-2">
          {RESUME.skills.map((g) => (
            <SkillGroup
              key={g.group}
              group={g.group}
              items={g.items}
              design={design}
            />
          ))}
        </div>
        <div className={section}>Experience</div>
        <Timeline
          design={design}
          items={RESUME.roles.map((r) => ({
            key: r.company,
            years: r.years,
            body: (
              <>
                <h2 className={`mt-2 text-3xl ${design.heading}`}>{r.role}</h2>
                <div className="mt-1 text-[var(--text)]">
                  {r.company}
                  {r.place && (
                    <span className="text-[var(--faint)]"> · {r.place}</span>
                  )}
                </div>
                <p className="mt-3 text-[var(--muted)]">{r.blurb}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--muted)]">
                  {r.bullets.map((b) => (
                    <li key={b.slice(0, 32)}>{b}</li>
                  ))}
                </ul>
              </>
            ),
          }))}
        />
        <div className={section}>Education</div>
        <Timeline
          design={design}
          items={RESUME.education.map((e) => ({
            key: e.title,
            years: e.years,
            body: (
              <>
                <h2 className={`mt-2 text-2xl ${design.heading}`}>{e.title}</h2>
                <div className="mt-1 text-[var(--muted)]">{e.school}</div>
              </>
            ),
          }))}
        />
      </div>
    </Frame>
  );
}

const field: CSSProperties = {
  ...panel,
  background: "var(--well)",
};

const inputClass =
  "px-4 py-3 text-base outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]";

type SendState = "idle" | "sending" | "sent" | "error";

/** Sends through EmailJS, to the same template the old site's form used. */
function ContactForm({ design }: { design: Design }) {
  const [values, setValues] = useState<ContactValues>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [state, setState] = useState<SendState>("idle");
  const set =
    (k: keyof ContactValues) => (e: { target: { value: string } }) => {
      setValues((v) => ({ ...v, [k]: e.target.value }));
      if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
      if (state === "sent" || state === "error") setState("idle");
    };

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const config = emailConfig(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    );
    if (!config) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        config.serviceId,
        config.templateId,
        emailParams(values),
        config.publicKey,
      );
      setValues({ name: "", email: "", message: "" });
      setState("sent");
      window.gtag?.("event", "contact_form_submitted");
    } catch {
      setState("error");
    }
  };

  const fieldError = (k: keyof ContactValues) =>
    errors[k] && (
      <span id={`contact-${k}-error`} className="text-sm text-[var(--accent)]">
        {errors[k]}
      </span>
    );
  const aria = (k: keyof ContactValues) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `contact-${k}-error` : undefined,
  });

  return (
    <form
      className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
      onSubmit={submit}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={`text-[var(--faint)] ${design.label}`}>Name</span>
          <input
            className={inputClass}
            style={field}
            placeholder="Your name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            {...aria("name")}
          />
          {fieldError("name")}
        </label>
        <label className="flex flex-col gap-2">
          <span className={`text-[var(--faint)] ${design.label}`}>Email</span>
          <input
            className={inputClass}
            style={field}
            placeholder="you@company.com"
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            {...aria("email")}
          />
          {fieldError("email")}
        </label>
      </div>
      <label className="flex flex-col gap-2 lg:max-h-[24rem] lg:min-h-0 lg:flex-1">
        <span className={`text-[var(--faint)] ${design.label}`}>Message</span>
        <textarea
          className={`min-h-40 resize-none lg:flex-1 ${inputClass}`}
          style={field}
          placeholder="Your message"
          name="message"
          value={values.message}
          onChange={set("message")}
          {...aria("message")}
        />
        {fieldError("message")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="submit"
          disabled={state === "sending"}
          className={`w-full px-6 py-3 sm:w-auto text-[var(--on-accent)] transition-opacity hover:opacity-85 disabled:opacity-60 ${design.label}`}
          style={{
            background: "var(--accent)",
            borderRadius: "var(--radius)",
          }}
        >
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        <output className="text-sm text-[var(--muted)]">
          {state === "sent" && "Thanks, your message is on its way."}
          {state === "error" &&
            `Couldn't send it. Email me at ${CONTACT.email} instead.`}
        </output>
      </div>
    </form>
  );
}

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: object) => void;
  }
}

function ContactPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const [copied, setCopied] = useState(false);
  const input = field;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the address is on screen to select.
    }
  };
  return (
    <Frame index={3} title="Contact" skin={skin} nav={nav} ref={ref}>
      <div
        className="mt-8 grid min-h-0 flex-1 gap-10 overflow-y-auto lg:grid-cols-[1fr_1.1fr] lg:overflow-visible"
        data-lab-scroll
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full">
              {/* biome-ignore lint/performance/noImgElement: snapshot test needs a plain img */}
              <img
                src="/images/photo-lev.jpg"
                alt="Lev Zhitnik"
                className="h-full w-full object-cover grayscale"
              />
            </div>
            <h1 className={h1(design)}>Contact</h1>
          </div>
          <p className="mt-6 max-w-md text-[var(--muted)]">{CONTACT.blurb}</p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center" style={input}>
              <a
                href={`mailto:${CONTACT.email}`}
                className={`py-4 text-lg transition-colors hover:text-[var(--accent)] px-5`}
              >
                {CONTACT.email}
              </a>
              <button
                type="button"
                onClick={copy}
                className={`ml-auto py-4 text-[var(--accent)] transition-opacity hover:opacity-70 px-5 ${design.label}`}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className={`flex gap-6 text-[var(--muted)] ${design.label}`}>
              {CONTACT.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[var(--accent)]"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-auto hidden pt-8 text-sm text-[var(--faint)] lg:block">
            {CONTACT.location}
          </p>
        </div>
        <ContactForm design={design} />
      </div>
    </Frame>
  );
}

export const PAGE_COMPONENTS = [
  ChatPage,
  ProjectsPage,
  ResumePage,
  ContactPage,
];
