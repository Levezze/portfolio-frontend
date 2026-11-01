import { describe, expect, it } from "vitest";
import { createTapQueue } from "../tapQueue";

describe("tap queue", () => {
  it("runs nothing when no tap came in while busy", () => {
    const q = createTapQueue();
    expect(q.take(0)).toBeNull();
  });

  it("runs the latest tap made while busy, once", () => {
    const q = createTapQueue();
    q.keep(1);
    q.keep(3);
    expect(q.take(0)).toBe(3);
    expect(q.take(3)).toBeNull();
  });

  it("drops a tap for the page the prism landed on", () => {
    const q = createTapQueue();
    q.keep(2);
    expect(q.take(2)).toBeNull();
    expect(q.take(0)).toBeNull();
  });

  it("forgets a kept tap when cleared", () => {
    const q = createTapQueue();
    q.keep(1);
    q.clear();
    expect(q.take(0)).toBeNull();
  });
});
