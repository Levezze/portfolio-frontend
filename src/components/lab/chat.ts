/**
 * Pure pieces of the lab chat: how a server message advances a reply, which
 * page a tool call turns to, and the wire shape of the history. The hook in
 * useLabChat.ts wires these to the WebSocket.
 */

export type Turn = { role: "user" | "assistant"; text: string };

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

export function toWire(turns: Turn[]) {
  return turns
    .filter((t) => t.text.trim() !== "")
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
