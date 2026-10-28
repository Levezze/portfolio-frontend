import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHAT_LIMIT, CUT_OFF_NOTE, OFFLINE_REPLY } from "../chat";
import type { NavState } from "../LabNav";

/**
 * The hook against a fake socket: tests drive it the way the backend and
 * the network would, and read only what the chat page reads back.
 */
const socket = vi.hoisted(() => {
  const listeners = new Map<string, Set<(data?: unknown) => void>>();
  return {
    listeners,
    sent: [] as { message_id: string; content: unknown }[],
    connect: () => {},
    send(msg: { message_id: string; content: unknown }) {
      this.sent.push(msg);
    },
    cancel: (_id: string) => {},
    on(e: string, cb: (data?: unknown) => void) {
      if (!listeners.has(e)) listeners.set(e, new Set());
      listeners.get(e)?.add(cb);
      return () => listeners.get(e)?.delete(cb);
    },
    emit(e: string, data?: unknown) {
      for (const cb of [...(listeners.get(e) ?? [])]) cb(data);
    },
  };
});
vi.mock("@/lib/api/core/wsManager", () => ({ wsManager: socket }));

import { useLabChat } from "../useLabChat";

const STORAGE_KEY = "levezze-chat";

function nav(): NavState {
  return { go: vi.fn(() => true) } as unknown as NavState;
}

function setup(n = nav()) {
  const hook = renderHook(() => useLabChat(n));
  return { ...hook, nav: n };
}

/** Send a message and return the id the hook put on the wire. */
function send(result: { current: ReturnType<typeof useLabChat> }, text = "hi") {
  act(() => result.current.send(text));
  const id = socket.sent.at(-1)?.message_id;
  if (!id) throw new Error("nothing sent");
  return id;
}

function server(msg: Record<string, unknown>) {
  act(() => socket.emit("message", msg));
}

/** Let typing and any timers run their course. */
function settle(ms = 10_000) {
  act(() => vi.advanceTimersByTime(ms));
}

const busy = (s: string) => s === "waiting" || s === "streaming";

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  socket.listeners.clear();
  socket.sent = [];
  socket.cancel = vi.fn();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("a reply that never finishes", () => {
  it("frees the chat when the connection drops mid-reply, keeping what arrived", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "Lev built", message_id: id });
    act(() => socket.emit("disconnected"));
    settle();

    expect(busy(result.current.status)).toBe(false);
    const last = result.current.turns.at(-1);
    expect(last?.role).toBe("assistant");
    expect(last?.text).toContain("Lev built");
    expect(last?.error).toBe(true);
  });

  it("frees the chat when a started reply stops arriving", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "Lev built", message_id: id });
    settle(60_000);

    expect(busy(result.current.status)).toBe(false);
    expect(result.current.turns.at(-1)?.error).toBe(true);
  });

  it("marks a reply cut off by a server error, rather than passing it off as whole", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "Lev built", message_id: id });
    server({ type: "error", content: "boom", message_id: id });
    settle();

    expect(busy(result.current.status)).toBe(false);
    const last = result.current.turns.at(-1);
    expect(last?.text).toContain("Lev built");
    expect(last?.error).toBe(true);
  });

  it("doesn't count a cut-off exchange against the chat, nor send it back", () => {
    const { result } = setup();
    const id = send(result, "first");
    server({ type: "stream", content: "partial", message_id: id });
    act(() => socket.emit("disconnected"));
    settle();

    expect(result.current.left).toBe(CHAT_LIMIT);
    send(result, "second");
    expect(socket.sent.at(-1)?.content).toEqual([
      { role: "user", content: [{ type: "text", text: "second" }] },
    ]);
  });
});

describe("a cut-off reply", () => {
  it("keeps the reply's own text, with the cut-off flagged apart from it", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "Lev **built**", message_id: id });
    act(() => socket.emit("disconnected"));
    settle();

    const last = result.current.turns.at(-1);
    expect(last?.text).toBe("Lev **built**");
    expect(last?.cut).toBe(true);
  });

  it("flags the cut only once the reply has typed out", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "x".repeat(400), message_id: id });
    act(() => socket.emit("disconnected"));
    act(() => vi.advanceTimersByTime(50));

    expect(result.current.turns.at(-1)?.cut).toBeFalsy();
    settle();
    expect(result.current.turns.at(-1)?.cut).toBe(true);
  });
});

describe("a slow reply", () => {
  it("waits for a reply the server has started on, past the stall window", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "start", message_id: id });
    act(() => vi.advanceTimersByTime(30_000));

    expect(busy(result.current.status)).toBe(true);
    server({ type: "stream", content: "Lev built", message_id: id });
    server({ type: "end", message_id: id });
    settle();

    expect(result.current.status).toBe("idle");
    expect(result.current.turns.at(-1)).toEqual({
      role: "assistant",
      text: "Lev built",
    });
  });

  it("gives up on a started reply that never comes, without calling the server unreachable", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "start", message_id: id });
    settle(120_000);

    expect(result.current.status).toBe("idle");
    const last = result.current.turns.at(-1);
    expect(last?.error).toBe(true);
    expect(last?.text).not.toBe(OFFLINE_REPLY);
    expect(result.current.left).toBe(CHAT_LIMIT);
  });

  it("says the connection dropped when it closes after the server started", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "start", message_id: id });
    act(() => socket.emit("disconnected"));
    settle();

    expect(result.current.status).toBe("idle");
    expect(result.current.turns.at(-1)).toMatchObject({
      text: CUT_OFF_NOTE,
      error: true,
    });
  });
});

describe("a refusal", () => {
  it("explains a refusal before any text, and doesn't count it", () => {
    const { result } = setup();
    const id = send(result);
    server({
      type: "error",
      error_code: "rate_limit_exceeded",
      content: "raw",
      details: { retry_after: 9 },
      message_id: id,
    });
    settle();

    const last = result.current.turns.at(-1);
    expect(last?.error).toBe(true);
    expect(last?.text).toMatch(/9 seconds/);
    expect(result.current.left).toBe(CHAT_LIMIT);
  });
});

describe("offline", () => {
  it("answers with an offline notice and withdraws the queued message", () => {
    const { result } = setup();
    const id = send(result);
    settle();

    expect(result.current.status).toBe("offline");
    expect(result.current.turns.at(-1)).toMatchObject({
      role: "assistant",
      error: true,
    });
    expect(socket.cancel).toHaveBeenCalledWith(id);
    expect(result.current.left).toBe(CHAT_LIMIT);
  });

  it("ignores a reply that arrives after the chat gave up on it", () => {
    const { result } = setup();
    const id = send(result);
    settle();
    const before = result.current.turns;
    server({ type: "stream", content: "late", message_id: id });
    server({ type: "end", message_id: id });
    settle();

    expect(result.current.turns).toEqual(before);
  });
});

describe("new chat", () => {
  it("clears a chat whose reply is still arriving", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "Lev", message_id: id });
    act(() => result.current.reset());
    server({ type: "stream", content: " built", message_id: id });
    settle();

    expect(result.current.turns).toEqual([]);
    expect(result.current.status).toBe("idle");
  });

  it("cancels a page turn a tool asked for", () => {
    const { result, nav: n } = setup();
    const id = send(result);
    server({
      type: "tool_call",
      tool_name: "navigate_page",
      parameters: { page: "projects" },
      message_id: id,
    });
    server({ type: "stream", content: "Here.", message_id: id });
    server({ type: "end", message_id: id });
    // Typing finishes, then the turn waits a beat; reset inside that beat.
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.reset());
    settle();

    expect(n.go).not.toHaveBeenCalled();
  });

  it("still turns the page when nothing interrupts", () => {
    const { result, nav: n } = setup();
    const id = send(result);
    server({
      type: "tool_call",
      tool_name: "navigate_page",
      parameters: { page: "projects" },
      message_id: id,
    });
    server({ type: "stream", content: "Here.", message_id: id });
    server({ type: "end", message_id: id });
    settle();

    expect(n.go).toHaveBeenCalledWith(1);
  });
});

describe("page turns a tool asks for", () => {
  const toolReply = (id: string, text = "Here.") => {
    server({
      type: "tool_call",
      tool_name: "navigate_page",
      parameters: { page: "projects" },
      message_id: id,
    });
    if (text) server({ type: "stream", content: text, message_id: id });
    server({ type: "end", message_id: id });
  };

  it("turns the page for a reply that is only a tool call", () => {
    const { result, nav: n } = setup();
    toolReply(send(result), "");
    settle();

    expect(n.go).toHaveBeenCalledWith(1);
    expect(result.current.status).toBe("idle");
  });

  it("retries a page turn that lands while another turn is running", () => {
    const go = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const { result } = setup({ go } as unknown as NavState);
    toolReply(send(result));
    settle();

    expect(go).toHaveBeenCalledTimes(2);
    expect(go).toHaveBeenLastCalledWith(1);
  });

  it("keeps the page turn when the visitor sends again right away", () => {
    const { result, nav: n } = setup();
    toolReply(send(result));
    act(() => vi.advanceTimersByTime(300));
    send(result, "and then?");
    settle(1_000);

    expect(n.go).toHaveBeenCalledWith(1);
  });
});

describe("memory across reloads", () => {
  const saved = [
    { role: "user", text: "who is Lev?" },
    { role: "assistant", text: "A software engineer." },
  ];

  it("restores the saved conversation and keeps it saved, even in Strict Mode", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useLabChat(nav()), {
      reactStrictMode: true,
    });

    expect(result.current.turns).toEqual(saved);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual(
      saved,
    );
  });

  it("saves a finished reply", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "A whole answer.", message_id: id });
    server({ type: "end", message_id: id });
    settle();

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([
      { role: "user", text: "hi" },
      { role: "assistant", text: "A whole answer." },
    ]);
  });

  it("doesn't save a reply while it is still arriving", () => {
    const { result } = setup();
    const id = send(result);
    server({ type: "stream", content: "half a sen", message_id: id });

    expect(localStorage.getItem(STORAGE_KEY) ?? "").not.toContain("half a sen");
  });
});
