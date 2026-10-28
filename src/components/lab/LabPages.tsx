"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  CONTACT,
  mediaSrc,
  PROJECTS,
  type Project,
  RESUME,
  SUGGESTIONS,
  videoSrc,
  WELCOME,
} from "./content";
import { Drift } from "./Drift";
import { fontById } from "./fonts";
import { LabMarkdown } from "./LabMarkdown";
import { IndexNav, type NavState, PageNav } from "./LabNav";
import {
  type Design,
  designById,
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
  design: designById(spec.designId),
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
}: {
  index: number;
  title: string;
  skin: Skin;
  nav: NavState;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  const { palette, design, spec } = skin;
  // Room under the content for the page's own nav build: the rail stacks
  // four rows at the bottom-left from `sm` up, the others are one row.
  // The pill floats over the content, which blurs out as it reaches it
  // (BottomBlur), so the page runs to the bottom edge and each scroll area
  // pads itself by `--nav-pad` instead.
  const bottomPad = {
    tabs: "pb-24",
    rail: "pb-24 sm:pb-44",
    pill: "pb-0",
    index: "pb-10",
  }[design.nav];
  const navPad = design.nav === "pill" ? "92px" : "0px";
  // This page's copy of the nav shows itself selected, whatever the app's
  // current page is, so a snapshot of it is right the moment it lands.
  const own: NavState = { ...nav, active: index };
  return (
    <div
      ref={ref}
      data-lab-root
      className="absolute inset-0 overflow-hidden text-base text-[var(--text)]"
      style={
        {
          ...palette.vars,
          "--radius": design.radius,
          "--title-scale": spec.titleScale,
          "--nav-pad": navPad,
          "--nav-bg": `color-mix(in srgb, ${palette.capColor} 92%, transparent)`,
          "--font-heading": fontById(spec.headingFontId).family,
          "--font-body": fontById(spec.bodyFontId).family,
          fontFamily: "var(--font-body)",
          background: palette.sceneBackground,
        } as CSSProperties
      }
    >
      <Drift palette={palette} spec={spec.drift} />
      <style>{`[data-lab-frame] h1, [data-lab-frame] h2, [data-lab-frame] h3 { font-family: var(--font-heading); }
[data-lab-frame] .lab-h1 { font-size: calc(${design.h1Rem[0]}rem * var(--title-scale)); }
@media (min-width: 640px) { [data-lab-frame] .lab-h1 { font-size: calc(${design.h1Rem[1]}rem * var(--title-scale)); } }
[data-lab-frame] [data-lab-scroll] { padding-bottom: var(--nav-pad); }
[data-lab-frame] [data-lab-scroll]::-webkit-scrollbar-track { margin-bottom: var(--nav-pad); }
[data-lab-root] button:not(:disabled), [data-lab-root] a[href] { cursor: pointer; }`}</style>
      <div
        className={`relative flex h-full flex-col px-6 pt-8 sm:px-12 sm:pt-10 ${bottomPad}`}
        data-lab-frame
      >
        <div
          className={`flex items-baseline justify-between border-b border-[var(--line)] pb-3 ${design.label}`}
        >
          {design.nav === "index" ? (
            <IndexNav nav={own} design={design} />
          ) : (
            <span className="text-[var(--accent)]">
              0{index + 1} / {title}
            </span>
          )}
          <span className="text-[var(--faint)]">levezze.com</span>
        </div>
        {children}
      </div>
      {design.nav === "pill" && <BottomBlur />}
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

function BottomBlur() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0"
      style={{ height: "var(--nav-pad)" }}
    >
      {BLUR_STEPS.map((s) => {
        const mask = `linear-gradient(to bottom, transparent ${s.from}%, black ${s.from + 25}%)`;
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
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--nav-bg) 45%, transparent))",
        }}
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
  if (design.bubble === "plain") {
    return (
      <div className="flex max-w-2xl gap-4 border-t border-[var(--line)] pt-5">
        {avatar}
        <div className="min-w-0">
          <div className={`text-[var(--faint)] ${design.label}`}>{from}</div>
          <div className="mt-2 space-y-2 text-lg leading-snug">{children}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex max-w-2xl gap-4">
      {avatar}
      <div className="min-w-0">
        <div className={`text-[var(--faint)] ${design.label}`}>{from}</div>
        <div className="mt-2 space-y-2 px-5 py-4" style={panel}>
          {children}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ design, text }: { design: Design; text: string }) {
  return (
    <div
      className="ml-auto max-w-xl px-5 py-3 whitespace-pre-wrap"
      style={
        design.bubble === "plain"
          ? { borderRight: "2px solid var(--accent)", paddingRight: 16 }
          : {
              ...panel,
              background:
                "color-mix(in srgb, var(--accent) 16%, var(--surface))",
            }
      }
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
 * The composer is pinned: messages scroll in their own area above it, so a
 * long conversation never pushes it down, even on a 667px-tall phone. The
 * scroller is not a `data-lab-scroll` area; the composer, not the scroller,
 * is what has to clear the nav.
 */
function ChatPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const { turns, status, send } = useLabChat(nav);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const busy = status === "waiting" || status === "streaming";
  const lastText = turns.at(-1)?.text;

  // biome-ignore lint/correctness/useExhaustiveDependencies: follow every new message and streamed chunk
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, lastText, status]);

  const submit = (text: string) => {
    if (busy || !text.trim()) return;
    send(text);
    setDraft("");
  };

  return (
    <Frame index={0} title="Chat" skin={skin} nav={nav} ref={ref}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto pr-1">
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
                  <UserMessage
                    key={`u${i.toString()}`}
                    design={design}
                    text={t.text}
                  />
                ) : t.text ? (
                  <Message
                    key={`a${i.toString()}`}
                    from="Gimli"
                    avatar={<GimliAvatar />}
                    design={design}
                  >
                    <LabMarkdown text={t.text} />
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
        <div className="shrink-0" style={{ marginBottom: "var(--nav-pad)" }}>
          {turns.length === 0 && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
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
            </div>
          )}
          <form
            className="flex items-center gap-3 px-5 py-2"
            style={
              design.bubble === "plain"
                ? { borderBottom: "1px solid var(--muted)", paddingInline: 0 }
                : { ...panel, background: "var(--well)" }
            }
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
              className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[var(--faint)]"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className={`text-[var(--accent)] transition-opacity hover:opacity-70 disabled:opacity-40 ${design.label}`}
            >
              Send
            </button>
          </form>
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
  if (design.card === "row") {
    return (
      <motion.button
        layoutId={`card-${p.slug}`}
        type="button"
        onClick={onOpen}
        className="group grid w-full grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-[var(--line)] py-4 text-left transition-colors hover:border-[var(--accent)] sm:grid-cols-[3rem_1fr_1.3fr]"
      >
        <span className={`text-[var(--faint)] ${design.label}`}>{n}</span>
        <span
          className={`text-2xl transition-colors group-hover:text-[var(--accent)] sm:text-3xl ${design.heading}`}
          style={headingFont}
        >
          {p.name}
        </span>
        <span className="hidden text-[var(--muted)] sm:block">{p.short}</span>
      </motion.button>
    );
  }
  if (design.card === "edge") {
    return (
      <motion.button
        layoutId={`card-${p.slug}`}
        type="button"
        onClick={onOpen}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.99 }}
        className="relative flex min-h-36 flex-col justify-between gap-4 overflow-hidden p-5 pl-6 text-left transition-colors hover:bg-[var(--surface)]"
        style={{
          background: "var(--well)",
          borderLeft: "3px solid var(--accent)",
          borderRadius: "var(--radius)",
        }}
      >
        <span className={`text-[var(--faint)] ${design.label}`}>{n}</span>
        <span>
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
  if (design.card === "tile") {
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
          {/* biome-ignore lint/performance/noImgElement: snapshot needs a same-origin plain img */}
          <img
            src={mediaSrc(p.still, 828)}
            alt=""
            loading="lazy"
            className={`h-full w-full opacity-70 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100 ${p.logo ? "object-scale-down p-8" : "object-cover"}`}
          />
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
  // wire: outline only, the number drawn big and light, fills on hover
  return (
    <motion.button
      layoutId={`card-${p.slug}`}
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      className="group relative flex min-h-36 flex-col justify-between gap-4 overflow-hidden border border-[var(--line)] p-5 text-left transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface)]"
      style={{ borderRadius: "var(--radius)" }}
    >
      <span
        className={`text-4xl text-[var(--faint)] transition-colors group-hover:text-[var(--accent)] ${design.heading}`}
        style={headingFont}
      >
        {n}
      </span>
      <span>
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
  const group = useId();
  const grid =
    design.card === "row"
      ? "mt-8 flex flex-col"
      : "mt-8 grid grid-cols-1 content-start gap-3 sm:grid-cols-2";
  return (
    <Frame index={1} title="Projects" skin={skin} nav={nav} ref={ref}>
      <LayoutGroup id={group}>
        <div className={`mt-6 flex h-8 items-center ${design.label}`}>
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.button
                key="back"
                type="button"
                onClick={() => setOpen(null)}
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
              <ProjectDetail key="detail" project={open} design={design} />
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
                      onOpen={() => setOpen(p)}
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

function ProjectDetail({
  project,
  design,
}: {
  project: Project;
  design: Design;
}) {
  // The hero is a still: the GIFs run 10–20MB and every turn re-encodes the
  // page for its snapshot, so they stay further down, loaded lazily.
  const first = project.media[0];
  const heroKey =
    first && first.kind === "image" && !first.key.endsWith(".gif")
      ? first.key
      : project.still;
  const hero = project.media.find((m) => m.key === heroKey);
  const gallery = project.media.filter((m) => m.key !== heroKey);
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
      <motion.div
        layoutId={`card-${project.slug}`}
        className="mt-8 aspect-[16/9] w-full overflow-hidden"
        style={{ ...panel, background: "var(--well)" }}
        transition={{ duration: 0.4, ease: [0.7, 0, 0.3, 1] }}
      >
        {/* biome-ignore lint/performance/noImgElement: snapshot needs a same-origin plain img */}
        <img
          src={mediaSrc(heroKey, 1920)}
          alt={hero?.caption ?? project.name}
          className={`h-full w-full ${project.logo ? "object-scale-down p-12" : "object-contain"}`}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <p className="mt-6 max-w-2xl text-xl">{project.short}</p>
        {(project.demo || project.github) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.demo && (
              <OutLink href={project.demo} label="Live site" design={design} />
            )}
            {project.github && (
              <OutLink href={project.github} label="Source" design={design} />
            )}
          </div>
        )}
        {project.description.map((para) => (
          <p
            key={para.slice(0, 32)}
            className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed"
          >
            {para}
          </p>
        ))}
        <div className={`mt-8 text-[var(--faint)] ${design.label}`}>Stack</div>
        <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
          {project.stack.map((s) => (
            <span key={s} className="px-2.5 py-1 text-sm" style={panel}>
              {s}
            </span>
          ))}
        </div>
        {gallery.length > 0 && (
          <div className="mt-8 grid gap-3 pb-4 sm:grid-cols-2">
            {gallery.map((m) => (
              <figure key={m.key}>
                <div
                  className="aspect-[16/10] overflow-hidden"
                  style={{ ...panel, background: "var(--well)" }}
                >
                  {m.kind === "video" ? (
                    // Served from R2 without CORS, so it can't be drawn into
                    // a snapshot; the turn shows the empty panel instead.
                    <video
                      src={videoSrc(m.key)}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-contain"
                      data-lab-nocapture
                    />
                  ) : (
                    // biome-ignore lint/performance/noImgElement: snapshot needs a same-origin plain img
                    <img
                      src={mediaSrc(m.key, 1200)}
                      alt={m.caption}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                <figcaption className="mt-2 text-sm text-[var(--faint)]">
                  {m.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
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
              className="absolute rounded-full border border-[var(--line)] transition-colors group-hover:border-[var(--accent)]"
              style={{
                width: NODE,
                height: NODE,
                top: NODE_Y - NODE / 2,
                left: 0.5 - NODE / 2,
                background: first ? "var(--accent)" : "var(--well)",
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

function ResumePage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const tag =
    design.card === "row"
      ? "border-b border-[var(--line)] px-1 py-1 text-sm sm:py-1.5"
      : "px-2.5 py-1 text-sm sm:px-3 sm:py-1.5";
  const section = `mt-10 text-[var(--faint)] ${design.label}`;
  return (
    <Frame index={2} title="Resume" skin={skin} nav={nav} ref={ref}>
      <h1 className={`mt-8 ${h1(design)}`}>{RESUME.name}</h1>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2" data-lab-scroll>
        <p className="max-w-2xl">{RESUME.tagline}</p>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{RESUME.summary}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {RESUME.skills.map((g) => (
            <div key={g.group}>
              <div className={`text-[var(--faint)] ${design.label}`}>
                {g.group}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {g.items.map((s) => (
                  <span
                    key={s}
                    className={tag}
                    style={design.card === "row" ? undefined : panel}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
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
                <p className="mt-3 max-w-2xl text-[var(--muted)]">{r.blurb}</p>
                <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-sm text-[var(--muted)]">
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
/** Editorial design: fields are underlines, not boxes. */
const lineField: CSSProperties = {
  background: "transparent",
  borderBottom: "1px solid var(--muted)",
};

function ContactPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const [copied, setCopied] = useState(false);
  const input = design.card === "row" ? lineField : field;
  const inputClass =
    design.card === "row"
      ? "px-0 py-3 text-base outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]"
      : "px-4 py-3 text-base outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]";
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
                className={`py-4 text-lg transition-colors hover:text-[var(--accent)] ${design.card === "row" ? "" : "px-5"}`}
              >
                {CONTACT.email}
              </a>
              <button
                type="button"
                onClick={copy}
                className={`ml-auto py-4 text-[var(--accent)] transition-opacity hover:opacity-70 ${design.card === "row" ? "" : "px-5"} ${design.label}`}
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
        <form
          className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={`text-[var(--faint)] ${design.label}`}>
                Name
              </span>
              <input
                className={inputClass}
                style={input}
                placeholder="Your name"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={`text-[var(--faint)] ${design.label}`}>
                Email
              </span>
              <input
                className={inputClass}
                style={input}
                placeholder="you@company.com"
                type="email"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 lg:min-h-0 lg:flex-1">
            <span className={`text-[var(--faint)] ${design.label}`}>
              Message
            </span>
            <textarea
              className={`min-h-40 resize-none lg:flex-1 ${inputClass}`}
              style={input}
              placeholder="Your message"
            />
          </label>
          <button
            type="submit"
            className={`self-start px-6 py-3 text-[var(--on-accent)] transition-opacity hover:opacity-85 ${design.label}`}
            style={{
              background: "var(--accent)",
              borderRadius: "var(--radius)",
            }}
          >
            Send
          </button>
        </form>
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
