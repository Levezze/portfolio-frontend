/**
 * The browser's back button undoes the site's own steps: a page turn, an open
 * project, an open image. Each step pushes a history entry with the function
 * that undoes it, and a back press runs the latest one, like the old design's
 * navigation stack. Once nothing is left to undo, back leaves the site as
 * usual.
 */

type Win = {
  history: Pick<History, "pushState" | "back" | "go">;
  addEventListener(type: "popstate", l: (e: { state: unknown }) => void): void;
  removeEventListener(
    type: "popstate",
    l: (e: { state: unknown }) => void,
  ): void;
};

/** Undo one step; return false when it can't be undone yet (mid-turn). */
type Undo = () => unknown;

type Entry = { lab?: boolean; id?: string; depth?: number } | null;

export function createBackStack(win: Win) {
  // Each entry records its depth: how many of this load's entries sit at or
  // below it. `at` is the depth the site is showing, so a popstate's depth
  // tells back from forward. The id sets this load's entries apart from
  // those an earlier load of the site left in history.
  const id = Math.random().toString(36).slice(2);
  const entry = (depth: number) => ({ lab: true, id, depth });
  let at = 0;
  // `closing`: the UI's back() for this step is on the way. popstate lands
  // later, and a second close before then would go back one entry too far.
  const steps: { undo: Undo; closing: boolean }[] = [];

  const onPop = (e: { state: unknown }) => {
    const st = e.state as Entry;
    const ours = st?.lab && st.id === id;
    if (!ours && st?.lab && steps.length === 0) {
      // An entry left by an earlier load of the site: skip past it.
      win.history.back();
      return;
    }
    // The site's first entry, or anything below it, is depth 0.
    const depth = ours ? (st.depth ?? 0) : 0;
    // Forward into a step already undone: it can't be redone, so go back
    // to where the site is.
    if (depth > at) {
      win.history.go(at - depth);
      return;
    }
    // Back, by one entry or several. An entry whose step the UI already
    // closed directly has nothing left to undo.
    let left = at - depth;
    at = depth;
    for (; left > 0 && steps.length > 0; left--) {
      const step = steps[steps.length - 1];
      if (step.undo() === false) {
        // Mid-turn: keep the step and put its entries back for a retry.
        step.closing = false;
        for (; left > 0; left--) win.history.pushState(entry(++at), "");
        return;
      }
      steps.pop();
    }
  };
  win.addEventListener("popstate", onPop);

  return {
    /**
     * Record a step. Returns the way the site's own UI closes it: through
     * history while it is the latest step, so the entries stay in step.
     */
    push(undo: Undo) {
      const step = { undo, closing: false };
      steps.push(step);
      win.history.pushState(entry(++at), "");
      return () => {
        const at = steps.indexOf(step);
        if (at === -1 || step.closing) return;
        if (at === steps.length - 1) {
          step.closing = true;
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
