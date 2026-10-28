import { describe, expect, it } from "vitest";
import { pageForTool, restoreTurns, step, type Turn, toWire } from "../chat";

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
