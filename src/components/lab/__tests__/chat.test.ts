import { describe, expect, it } from "vitest";
import {
  CATCH_UP_MS,
  CHAT_LIMIT,
  errorReply,
  messagesLeft,
  pageForTool,
  restoreTurns,
  step,
  type Turn,
  TYPE_CPS,
  toWire,
  typeStep,
} from "../chat";

describe("pageForTool", () => {
  it("maps navigate_page to the lab page index", () => {
    expect(pageForTool("navigate_page", { page: "chat" })).toBe(0);
    expect(pageForTool("navigate_page", { page: "projects" })).toBe(1);
    expect(pageForTool("navigate_page", { page: "resume" })).toBe(2);
    expect(pageForTool("navigate_page", { page: "contact" })).toBe(3);
  });

  it("ignores pages the lab does not have", () => {
    expect(pageForTool("navigate_page", { page: "blog" })).toBeNull();
    expect(pageForTool("navigate_page", { page: "secret" })).toBeNull();
    expect(pageForTool("navigate_page", {})).toBeNull();
  });

  it("sends a resume download to the resume page and the contact form to contact", () => {
    expect(pageForTool("trigger_download", { file_type: "resume" })).toBe(2);
    expect(pageForTool("contact_form", { message: "hi" })).toBe(3);
  });

  it("ignores unknown tools", () => {
    expect(pageForTool("launch_rocket", {})).toBeNull();
  });
});

describe("step", () => {
  it("accumulates greeting and stream chunks", () => {
    let s = step("", { type: "greeting", content: "Hi" });
    expect(s).toEqual({ text: "Hi", done: false });
    s = step(s.text, { type: "stream", content: " there" });
    expect(s).toEqual({ text: "Hi there", done: false });
  });

  it("finishes on end", () => {
    expect(step("Hi", { type: "end" })).toEqual({ text: "Hi", done: true });
  });

  it("reports a server error and finishes", () => {
    expect(step("Hi", { type: "error", content: "boom" })).toEqual({
      text: "Hi",
      done: true,
      error: "boom",
    });
  });

  it("turns a tool call into a page to go to, keeping the text", () => {
    expect(
      step("Sure.", {
        type: "tool_call",
        tool_name: "navigate_page",
        parameters: { page: "projects", reason: "asked" },
      }),
    ).toEqual({ text: "Sure.", done: false, goTo: 1 });
  });

  it("ignores a stream chunk with no content", () => {
    expect(step("Hi", { type: "stream" })).toEqual({ text: "Hi", done: false });
  });
});

describe("toWire", () => {
  it("sends turns in the backend's message shape", () => {
    expect(
      toWire([
        { role: "user", text: "Who is Lev?" },
        { role: "assistant", text: "An engineer." },
      ]),
    ).toEqual([
      { role: "user", content: [{ type: "text", text: "Who is Lev?" }] },
      { role: "assistant", content: [{ type: "text", text: "An engineer." }] },
    ]);
  });

  it("drops empty turns, such as an assistant reply that never arrived", () => {
    expect(
      toWire([
        { role: "user", text: "Hi" },
        { role: "assistant", text: "" },
      ]),
    ).toEqual([{ role: "user", content: [{ type: "text", text: "Hi" }] }]);
  });
});

describe("restoreTurns", () => {
  it("round-trips finished turns", () => {
    const turns: Turn[] = [
      { role: "user", text: "hi" },
      { role: "assistant", text: "hello" },
    ];
    expect(restoreTurns(JSON.stringify(turns))).toEqual(turns);
  });

  it("starts empty on nothing stored or on garbage", () => {
    expect(restoreTurns(null)).toEqual([]);
    expect(restoreTurns("{not json")).toEqual([]);
    expect(restoreTurns(JSON.stringify({ role: "user" }))).toEqual([]);
  });

  it("drops malformed entries and empty replies", () => {
    const raw = JSON.stringify([
      { role: "user", text: "hi" },
      { role: "system", text: "x" },
      { role: "assistant", text: 42 },
      { role: "assistant", text: "" },
      { role: "assistant", text: "hello" },
    ]);
    expect(restoreTurns(raw)).toEqual([
      { role: "user", text: "hi" },
      { role: "assistant", text: "hello" },
    ]);
  });

  it("drops a question left without a reply", () => {
    const raw = JSON.stringify([
      { role: "user", text: "hi" },
      { role: "assistant", text: "hello" },
      { role: "user", text: "still there?" },
    ]);
    expect(restoreTurns(raw)).toHaveLength(2);
  });
});

describe("typeStep", () => {
  const start = { shown: 0, rate: 0 };

  it("types a short reply at the base pace", () => {
    const next = typeStep(start, 200, 100);
    expect(next.shown).toBe(Math.round(TYPE_CPS / 10));
  });

  it("never shows more than has arrived", () => {
    expect(typeStep(start, 3, 1000).shown).toBe(3);
    expect(typeStep({ shown: 3, rate: TYPE_CPS }, 3, 16).shown).toBe(3);
  });

  it("shows at least one character a frame", () => {
    expect(typeStep(start, 50, 1).shown).toBe(1);
  });

  it("types out a long reply within the catch-up time, with no slow tail", () => {
    let s = start;
    let ms = 0;
    while (s.shown < 6000) {
      s = typeStep(s, 6000, 16);
      ms += 16;
    }
    expect(ms).toBeLessThanOrEqual(CATCH_UP_MS + 16);
    expect(ms).toBeGreaterThan(CATCH_UP_MS / 2);
  });

  it("speeds up when more text arrives mid-reply", () => {
    const early = typeStep(start, 20, 16);
    const flooded = typeStep(early, 5000, 16);
    expect(flooded.shown - early.shown).toBeGreaterThan(early.shown);
  });
});

describe("errorReply", () => {
  const rate = (retry_after: number) => ({
    type: "error",
    error_code: "rate_limit_exceeded",
    content: "Too many messages.",
    details: { retry_after },
  });

  it("tells a fast sender how long to wait", () => {
    expect(errorReply(rate(9))).toMatch(/9 seconds/);
  });

  it("says the chat is out for the day when the daily cap is hit", () => {
    expect(errorReply(rate(50_000))).toMatch(/tomorrow/);
  });

  it("passes the guardrail's own reply through", () => {
    expect(
      errorReply({
        type: "error",
        error_code: "dangerous_content",
        content: "I'm Gimli-AI.",
      }),
    ).toBe("I'm Gimli-AI.");
  });

  it("names the length limit for a long message", () => {
    expect(
      errorReply({ type: "error", error_code: "message_too_long" }),
    ).toMatch(/1,000 characters/);
  });

  it("never shows the server's raw text for an unknown failure", () => {
    const text = errorReply({ type: "error", content: "Traceback boom" });
    expect(text).not.toMatch(/boom/);
    expect(text).toMatch(/Contact page/);
  });
});

describe("errors in the conversation", () => {
  const turns: Turn[] = [
    { role: "user", text: "hi" },
    { role: "assistant", text: "hello" },
    { role: "user", text: "again" },
    { role: "assistant", text: "Slow down.", error: true },
  ];

  it("keeps an error and the question it answered away from the model", () => {
    expect(toWire(turns)).toEqual([
      { role: "user", content: [{ type: "text", text: "hi" }] },
      { role: "assistant", content: [{ type: "text", text: "hello" }] },
    ]);
  });

  it("remembers which replies were errors across a reload", () => {
    expect(restoreTurns(JSON.stringify(turns))).toEqual(turns);
  });

  it("counts only answered messages against the chat's limit", () => {
    expect(messagesLeft(turns)).toBe(CHAT_LIMIT - 1);
    expect(messagesLeft([])).toBe(CHAT_LIMIT);
  });

  it("never counts below zero", () => {
    const many: Turn[] = Array.from({ length: CHAT_LIMIT + 3 }, () => [
      { role: "user" as const, text: "q" },
      { role: "assistant" as const, text: "a" },
    ]).flat();
    expect(messagesLeft(many)).toBe(0);
  });
});
