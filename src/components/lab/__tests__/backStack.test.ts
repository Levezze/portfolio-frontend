import { describe, expect, it, vi } from "vitest";
import { createBackStack } from "../backStack";

/** A window whose history records calls and whose back() fires popstate. */
function fakeWindow() {
  const listeners: ((e: { state: unknown }) => void)[] = [];
  const entries: unknown[] = [null];
  const history = {
    pushState: vi.fn((state: unknown) => {
      entries.push(state);
    }),
    back: vi.fn(() => {
      entries.pop();
      const state = entries[entries.length - 1] ?? null;
      for (const l of listeners) l({ state });
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

describe("createBackStack", () => {
  it("undoes the latest step on back, one step per press", () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const undo1 = vi.fn();
    const undo2 = vi.fn();
    stack.push(undo1);
    stack.push(undo2);
    expect(win.history.pushState).toHaveBeenCalledTimes(2);

    win.pressBack();
    expect(undo2).toHaveBeenCalledOnce();
    expect(undo1).not.toHaveBeenCalled();

    win.pressBack();
    expect(undo1).toHaveBeenCalledOnce();
  });

  it("keeps a step that can't be undone yet and restores its entry", () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    let busy = true;
    const undo = vi.fn(() => !busy);
    stack.push(undo);

    win.pressBack();
    expect(undo).toHaveBeenCalledOnce();
    expect(win.history.pushState).toHaveBeenCalledTimes(2);

    busy = false;
    win.pressBack();
    expect(undo).toHaveBeenCalledTimes(2);
    win.pressBack();
    expect(undo).toHaveBeenCalledTimes(2);
  });

  it("closes through history when the UI closes the top step", () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const undo = vi.fn();
    const dismiss = stack.push(undo);

    dismiss();
    expect(win.history.back).toHaveBeenCalledOnce();
    expect(undo).toHaveBeenCalledOnce();

    // Already undone: a second close does nothing.
    dismiss();
    expect(undo).toHaveBeenCalledOnce();
  });

  it("closes a buried step directly, leaving history alone", () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const lower = vi.fn();
    const upper = vi.fn();
    const dismissLower = stack.push(lower);
    stack.push(upper);

    dismissLower();
    expect(lower).toHaveBeenCalledOnce();
    expect(win.history.back).not.toHaveBeenCalled();

    win.pressBack();
    expect(upper).toHaveBeenCalledOnce();
    expect(lower).toHaveBeenCalledOnce();
  });

  it("steps past entries left from an earlier load, then lets the browser leave", () => {
    const win = fakeWindow();
    win.entries.push({ lab: true }, { lab: true });
    createBackStack(win);

    win.pressBack();
    // Both stale entries skipped, landing on the page before the site.
    expect(win.history.back).toHaveBeenCalledTimes(2);
    expect(win.entries).toEqual([null]);
  });

  it("stops listening once disposed", () => {
    const win = fakeWindow();
    const stack = createBackStack(win);
    const undo = vi.fn();
    stack.push(undo);
    stack.dispose();
    win.pressBack();
    expect(undo).not.toHaveBeenCalled();
  });
});
