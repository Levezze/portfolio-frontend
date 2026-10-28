"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { type Media, mediaSrc, type Project, videoSrc } from "../content";
import type { NavState } from "../LabNav";
import { LoadingImg, MediaFill, panel } from "./shared";

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
export function Gallery({
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
          <motion.button
            key={m.key}
            type="button"
            className={`absolute inset-0 block cursor-zoom-in ${many ? "touch-pan-y" : ""}`}
            // Keyboard: Motion's tap already answers Enter; Space opens too,
            // and the arrows step like a swipe.
            aria-label={`Enlarge ${m.caption}`}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
                zoom(at);
              } else if (many && e.key === "ArrowRight") step(1);
              else if (many && e.key === "ArrowLeft") step(-1);
            }}
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
          </motion.button>
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
