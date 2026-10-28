/**
 * The browser's back button undoes the site's own steps: a page turn, an open
 * project, an open image. Each step pushes a history entry with the function
 * that undoes it, and a back press runs the latest one, like the old design's
 * navigation stack. Once nothing is left to undo, back leaves the site as
 * usual.
 */

type Win = {
  history: Pick<History, "pushState" | "back">;
  addEventListener(type: "popstate", l: (e: { state: unknown }) => void): void;
  removeEventListener(
    type: "popstate",
    l: (e: { state: unknown }) => void,
  ): void;
};

/** Undo one step; return false when it can't be undone yet (mid-turn). */
type Undo = () => unknown;

const STATE = { lab: true };

export function createBackStack(win: Win) {
  const steps: { undo: Undo }[] = [];

  const onPop = (e: { state: unknown }) => {
    const step = steps[steps.length - 1];
    if (!step) {
      // An entry left by an earlier load of the site: skip past it.
      if ((e.state as { lab?: boolean } | null)?.lab) win.history.back();
      return;
    }
    if (step.undo() === false) {
      win.history.pushState(STATE, "");
      return;
    }
    steps.pop();
  };
  win.addEventListener("popstate", onPop);

  return {
    /**
     * Record a step. Returns the way the site's own UI closes it: through
     * history while it is the latest step, so the entries stay in step.
     */
    push(undo: Undo) {
      const step = { undo };
      steps.push(step);
      win.history.pushState(STATE, "");
      return () => {
        const at = steps.indexOf(step);
        if (at === -1) return;
        if (at === steps.length - 1) {
          win.history.back();
          return;
        }
        steps.splice(at, 1);
        undo();
      };
    },
    dispose() {
      win.removeEventListener("popstate", onPop);
    },
  };
}
