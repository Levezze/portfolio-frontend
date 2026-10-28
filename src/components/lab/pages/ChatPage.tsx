"use client";

import { motion } from "motion/react";
import { memo, type ReactNode, useEffect, useRef, useState } from "react";
import {
  CHAT_LIMIT,
  CUT_OFF_NOTE,
  MAX_MESSAGE_CHARS,
  type Turn,
} from "../chat";
import { SUGGESTIONS, WELCOME } from "../content";
import { LabMarkdown } from "../LabMarkdown";
import type { Design } from "../presets";
import { useLabChat } from "../useLabChat";
import { ChipRow, Frame, type PageProps, panel } from "./shared";

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

/**
 * One turn of the conversation. Memoized: while a reply types out, the hook
 * rebuilds only the last turn, so the finished ones above skip re-rendering.
 */
const ChatTurn = memo(function ChatTurn({
  turn,
  design,
}: {
  turn: Turn;
  design: Design;
}) {
  if (turn.role === "user") return <UserMessage text={turn.text} />;
  if (!turn.text) return null;
  return (
    <Message from="Gimli" avatar={<GimliAvatar />} design={design}>
      {turn.error && !turn.cut ? (
        <p className="text-[var(--muted)]">{turn.text}</p>
      ) : (
        <LabMarkdown text={turn.text} />
      )}
      {turn.cut && (
        <p className="text-sm text-[var(--muted)]">{CUT_OFF_NOTE}</p>
      )}
    </Message>
  );
});

/** How close to the bottom counts as reading the latest message. */
const PINNED_PX = 80;

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
export function ChatPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const { turns, status, send, left, reset } = useLabChat(nav);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [dockH, setDockH] = useState(0);
  const busy = status === "waiting" || status === "streaming";
  const lastText = turns.at(-1)?.text;
  // Whether the reader is at the bottom; scrolling up to reread unpins it.
  const pinned = useRef(true);

  // A new message always scrolls into view.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs per new message
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    pinned.current = true;
  }, [turns.length]);
  // A reply typing out is followed only while the reader stays at the bottom.
  // biome-ignore lint/correctness/useExhaustiveDependencies: follow streamed text
  useEffect(() => {
    const el = scroller.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [lastText, status]);

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
          onScroll={(e) => {
            const el = e.currentTarget;
            pinned.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < PINNED_PX;
          }}
          className="absolute inset-0 overflow-y-auto pr-1"
          style={{ paddingBottom: `calc(${dockTop} + 8px)` }}
        >
          <div className="flex min-h-full flex-col">
            {/* A log: new replies are announced once they finish typing. */}
            <div
              role="log"
              aria-live="polite"
              aria-busy={busy}
              className="mt-auto flex flex-col gap-6 pt-8 pb-6"
            >
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
              {turns.map((t, i) => (
                <ChatTurn
                  key={`${t.role}${i.toString()}`}
                  turn={t}
                  design={design}
                />
              ))}
              {status === "waiting" && (
                <Message from="Gimli" avatar={<GimliAvatar />} design={design}>
                  <Typing />
                </Message>
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
                  className="shrink-0 rounded-full px-3.5 py-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)] hover:[--panel-line:var(--accent)] focus-visible:[--panel-line:var(--accent)]"
                  style={{ ...panel, borderRadius: 999 }}
                >
                  {s.title}
                </button>
              ))}
            </ChipRow>
          )}
          {left === 0 ? (
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
              // The input itself has no outline; the whole composer shows focus.
              className="flex items-center gap-3 px-5 py-2 focus-within:[--panel-line:var(--accent)]"
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
