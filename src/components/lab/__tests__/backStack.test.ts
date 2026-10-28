import { describe, expect, it, vi } from "vitest";
import { createBackStack } from "../backStack";

/**
 * A window whose history records calls and whose back() fires popstate later,
 * as browsers do: the entry changes and the event lands after the call returns.
 */
function fakeWindow() {
  const listeners: ((e: { state: unknown }) => void)[] = [];
  const entries: unknown[] = [null];
  const history = {
    pushState: vi.fn((state: unknown) => {
      entries.push(state);
    }),
    back: vi.fn(() => {
      queueMicrotask(() => {
        entries.pop();
        const state = entries[entries.length - 1] ?? null;
        for (const l of listeners) l({ state });
      });
    }),
  };
  return {
    history,
    entries,
    /** The browser's own back button. */
    pressBack: () => history.back(),
    addEventListener: (_: "popstate", l: (e: { state: unknown }) => void) => {
      listeners.push(l);
    },
    removeEventListener: (
      _: "popstate",
      l: (e: { state: unknown }) => void,
    ) => {
      listeners.splice(listeners.indexOf(l), 1);
    },
  };
}

/** Let every pending popstate land. */
const settle = () => new Promise((r) => setTimeout(r, 0));

describe("createBackStack", () => {
  it("undoes the latest step on back, one step per press", async () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const undo1 = vi.fn();
    const undo2 = vi.fn();
    stack.push(undo1);
    stack.push(undo2);
    expect(win.history.pushState).toHaveBeenCalledTimes(2);

    win.pressBack();
    await settle();
    expect(undo2).toHaveBeenCalledOnce();
    expect(undo1).not.toHaveBeenCalled();

    win.pressBack();
    await settle();
    expect(undo1).toHaveBeenCalledOnce();
  });

  it("keeps a step that can't be undone yet and restores its entry", async () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    let busy = true;
    const undo = vi.fn(() => !busy);
    stack.push(undo);

    win.pressBack();
    await settle();
    expect(undo).toHaveBeenCalledOnce();
    expect(win.history.pushState).toHaveBeenCalledTimes(2);

    busy = false;
    win.pressBack();
    await settle();
    expect(undo).toHaveBeenCalledTimes(2);
    win.pressBack();
    await settle();
    expect(undo).toHaveBeenCalledTimes(2);
  });

  it("closes through history when the UI closes the top step", async () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const undo = vi.fn();
    const dismiss = stack.push(undo);

    dismiss();
    await settle();
    expect(win.history.back).toHaveBeenCalledOnce();
    expect(undo).toHaveBeenCalledOnce();

    // Already undone: a second close does nothing.
    dismiss();
    await settle();
    expect(undo).toHaveBeenCalledOnce();
  });

  it("goes back once when the UI closes the top step twice in a row", async () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const below = vi.fn();
    const undo = vi.fn();
    stack.push(below);
    const dismiss = stack.push(undo);

    // A double-click: the second close comes before the popstate lands.
    dismiss();
    dismiss();
    await settle();
    expect(win.history.back).toHaveBeenCalledOnce();
    expect(undo).toHaveBeenCalledOnce();
    expect(below).not.toHaveBeenCalled();
  });

  it("lets the UI close again after a close was refused mid-turn", async () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    let busy = true;
    const undo = vi.fn(() => !busy);
    const dismiss = stack.push(undo);

    dismiss();
    await settle();
    expect(undo).toHaveBeenCalledOnce();

    busy = false;
    dismiss();
    await settle();
    expect(undo).toHaveBeenCalledTimes(2);
    expect(win.history.back).toHaveBeenCalledTimes(2);
  });

  it("closes a buried step directly, leaving history alone", async () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const lower = vi.fn();
    const upper = vi.fn();
    const dismissLower = stack.push(lower);
    stack.push(upper);

    dismissLower();
    await settle();
    expect(lower).toHaveBeenCalledOnce();
    expect(win.history.back).not.toHaveBeenCalled();

    win.pressBack();
    await settle();
    expect(upper).toHaveBeenCalledOnce();
    expect(lower).toHaveBeenCalledOnce();
  });

  it("steps past entries left from an earlier load, then lets the browser leave", async () => {
    const win = fakeWindow();
    win.entries.push({ lab: true }, { lab: true });
    createBackStack(win);

    win.pressBack();
    await settle();
    // Both stale entries skipped, landing on the page before the site.
    expect(win.history.back).toHaveBeenCalledTimes(2);
    expect(win.entries).toEqual([null]);
  });

  it("stops listening once disposed", async () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const undo = vi.fn();
    stack.push(undo);
    stack.dispose();
    win.pressBack();
    await settle();
    expect(undo).not.toHaveBeenCalled();
  });
});
