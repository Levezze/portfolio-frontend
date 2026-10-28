/**
 * Pure pieces of the lab chat: how a server message advances a reply, which
 * page a tool call turns to, and the wire shape of the history. The hook in
 * useLabChat.ts wires these to the WebSocket.
 */

/** `error` marks a reply the site wrote because the backend refused or failed. */
export type Turn = {
  role: "user" | "assistant";
  text: string;
  error?: boolean;
};

/**
 * Messages one chat takes before it asks for a new one. Soft: it lives in the
 * browser and a new chat resets it; the backend's own limits are the guard.
 */
export const CHAT_LIMIT = 20;

/** Backend's maximum message length (input_validation.py). */
export const MAX_MESSAGE_CHARS = 1000;

/** Page order in the lab: Chat, Projects, Resume, Contact. */
const PAGE_INDEX: Record<string, number> = {
  chat: 0,
  projects: 1,
  resume: 2,
  contact: 3,
};

export function pageForTool(
  tool: string,
  params: Record<string, unknown> | undefined,
): number | null {
  if (tool === "navigate_page") {
    const page = typeof params?.page === "string" ? params.page : "";
    return PAGE_INDEX[page] ?? null;
  }
  // The PDF download is gone; the resume lives on its own page now.
  if (tool === "trigger_download") return PAGE_INDEX.resume;
  if (tool === "contact_form") return PAGE_INDEX.contact;
  return null;
}

export type ServerMessage = {
  type: string;
  content?: string;
  error_code?: string;
  details?: { retry_after?: number };
  tool_name?: string;
  parameters?: Record<string, unknown>;
};

export type Step = {
  text: string;
  done: boolean;
  error?: string;
  goTo?: number;
};

export function step(text: string, msg: ServerMessage): Step {
  switch (msg.type) {
    case "greeting":
    case "stream":
      return { text: text + (msg.content ?? ""), done: false };
    case "tool_call": {
      const to = pageForTool(msg.tool_name ?? "", msg.parameters);
      return to === null
        ? { text, done: false }
        : { text, done: false, goTo: to };
    }
    case "end":
      return { text, done: true };
    case "error":
      return { text, done: true, error: msg.content || "Server error" };
    default:
      return { text, done: false };
  }
}

/** Gimli's reply when the backend can't be reached at all. */
export const OFFLINE_REPLY =
  "I can't reach the server right now. Try again in a bit, or reach Lev through the Contact page.";

/** Added under a reply the connection or the backend cut short. */
export const CUT_OFF_NOTE =
  "The connection dropped before I could finish. Ask again in a moment.";

/** What to show for a backend error, in place of its raw text. */
export function errorReply(msg: ServerMessage): string {
  switch (msg.error_code) {
    case "dangerous_content":
      // Already written as a reply by the backend.
      return msg.content || "I can only help with Lev's work and this site.";
    case "rate_limit_exceeded": {
      const wait = msg.details?.retry_after;
      // The daily cap waits until UTC midnight; the per-visitor one, seconds.
      if (wait !== undefined && wait > 3600)
        return "I've answered all the messages I can for today. I'll be back tomorrow, and you can always reach Lev through the Contact page.";
      return wait
        ? `You're sending messages faster than I can answer. Give me ${wait} second${wait === 1 ? "" : "s"} and ask again.`
        : "You're sending messages faster than I can answer. Give me a few seconds and ask again.";
    }
    case "message_too_long":
      return `That message is too long for me. Keep it under ${MAX_MESSAGE_CHARS.toLocaleString("en-US")} characters and try again.`;
    case "empty_message":
    case "invalid_characters":
      return "I couldn't read that message. Try rewording it.";
    default:
      return "Something went wrong on my end. Try again in a moment, or reach Lev through the Contact page.";
  }
}

/** Messages left in this chat; a refused message doesn't count. */
export function messagesLeft(turns: Turn[]): number {
  const answered = turns.filter(
    (t, i) => t.role === "user" && !turns[i + 1]?.error,
  ).length;
  return Math.max(0, CHAT_LIMIT - answered);
}

/**
 * The history the backend sees. An error reply and the question it answered
 * are left out: the model never saw either. So is a question whose reply
 * had no text (a tool call alone), so user turns never come back to back.
 */
export function toWire(turns: Turn[]) {
  return turns
    .filter((t, i) => !t.error && !turns[i + 1]?.error)
    .filter((t) => t.text.trim() !== "")
    .filter((t, i, kept) => t.role !== "user" || kept[i + 1]?.role !== "user")
    .map((t) => ({
      role: t.role,
      content: [{ type: "text" as const, text: t.text }],
    }));
}

/**
 * Turns saved in the browser, read back defensively: anything malformed is
 * dropped, and so is a trailing question that never got its reply.
 */
export function restoreTurns(raw: string | null): Turn[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const turns = parsed.filter(
    (t): t is Turn =>
      typeof t === "object" &&
      t !== null &&
      (t.role === "user" || t.role === "assistant") &&
      typeof t.text === "string" &&
      t.text.trim() !== "",
  );
  return turns.at(-1)?.role === "user" ? turns.slice(0, -1) : turns;
}

/** Characters per second a reply types out at. */
export const TYPE_CPS = 150;
/** However much has arrived, typing catches up within this long. */
export const CATCH_UP_MS = 2500;

export type Typing = { shown: number; rate: number };

/**
 * One frame of the typewriter. The backend sends a reply in a burst, so
 * the client types it out: at TYPE_CPS for short replies, faster when the
 * backlog would take longer than CATCH_UP_MS. The rate only ever rises
 * within a reply, so a long one doesn't crawl at the end. `shown` is
 * fractional; floor it to slice the text.
 */
export function typeStep(t: Typing, target: number, dtMs: number): Typing {
  const rate = Math.max(
    t.rate,
    TYPE_CPS,
    ((target - t.shown) * 1000) / CATCH_UP_MS,
  );
  const shown = Math.min(target, t.shown + Math.max(1, (rate * dtMs) / 1000));
  return { shown, rate };
}
