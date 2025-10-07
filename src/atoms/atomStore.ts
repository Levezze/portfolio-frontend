import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { type PagesType } from "@/lib/api/schemas/tools";

// Visitor
export const visitorIdAtom = atomWithStorage("visitorId", "");

// Gimli-AI
export const gimliChoiceAtom = atom<number>(() => {
  const result = Math.ceil(Math.random() * 3);
  switch (result) {
    case 1:
      console.log("Gimli-AI state: Drunk");
      break;
    case 2:
      console.log("Gimli-AI state: Serious");
      break;
    case 3:
      console.log("Gimli-AI state: Heroic");
      break;
  }
  return result;
});

// 3D Scene
export const isLoadedAtom = atom<boolean>(false);
export const activeFaceAtom = atom<PagesType>("chat");
export const cubeColorAtom = atom<string>("");
export const pageColorAtom = atom<string>("#A8DADC");

// Styling
export const lightThemeAtom = atomWithStorage<boolean>("lightTheme", true);
export const bgMotionAtom = atomWithStorage<boolean>("bgMotion", true);
export const transitionDurationAtom = atom<number>(200);

let currentTimeout: NodeJS.Timeout | null = null;
export const pageTransitionManagerAtom = atom(
  (get) => get(transitionDurationAtom),
  (_get, set, _update) => {
    const SHORT_TRANSITION = 200;
    const LONG_TRANSITION = 3000;

    if (currentTimeout) clearTimeout(currentTimeout);

    set(transitionDurationAtom, LONG_TRANSITION);

    currentTimeout = setTimeout(() => {
      set(transitionDurationAtom, SHORT_TRANSITION);
    }, LONG_TRANSITION);
  }
);

// Sizing
export const cubeSizeAtom = atom<number>(8);
export const faceSizeAtom = atom<number>(800);

// Animation
export const cubeFloatingAtom = atom<boolean>(true);

// Mobile
export const drawerOpenAtom = atom<boolean>(false);
export const isMobileAtom = atom<boolean>(false);
export const viewportHeightAtom = atom<number>(0);
export const viewportWidthAtom = atom<number>(0);
export const viewportOrientationAtom = atom<"portrait" | "landscape">(
  "portrait"
);

// Floating Input Mirror (Mobile Keyboard UX)
export const activeInputElementAtom = atom<HTMLInputElement | HTMLTextAreaElement | null>(null);
export const keyboardVisibleAtom = atom<boolean>(false);

// Projects Gallery
export const projectViewAtom = atom<"project" | "zoomed">("project");

// Navigation Stack
export type NavigationStackItem = {
  callback: () => void;
  label?: string;
  timestamp: number;
};

export const navigationStackAtom = atom<NavigationStackItem[]>([]);

// Navigation with explicit direction (write-only)
// This atom handles face navigation with clear intent (forward vs backward)
// NOTE: Does NOT manipulate browser history - that's handled by GlobalNavigationManager
export const navigateToFaceAtom = atom(
  null,
  (get, set, update: { face: PagesType; direction: "forward" | "backward" }) => {
    const previousFace = get(activeFaceAtom);

    // Always update the face
    set(activeFaceAtom, update.face);

    // Only push to navigation stack on forward navigation (user-initiated)
    if (update.direction === "forward" && previousFace !== update.face) {
      // Push callback to stack
      // Callback directly sets activeFaceAtom (no direction needed for callbacks)
      set(navigationStackAtom, (prev) => [
        ...prev,
        {
          callback: () => set(activeFaceAtom, previousFace),
          label: `Return to ${previousFace} page`,
          timestamp: Date.now(),
        },
      ]);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Navigation] Forward: ${previousFace} → ${update.face} (stack size: ${get(navigationStackAtom).length + 1})`
        );
      }
    } else if (update.direction === "backward") {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Navigation] Backward: → ${update.face} (no stack push)`);
      }
    }
  }
);

// Helper atom to push navigation callbacks (write-only)
// Also pushes browser history state to keep stack and history synchronized
export const pushNavigationCallbackAtom = atom(
  null,
  (get, set, update: { callback: () => void; label?: string }) => {
    set(navigationStackAtom, (prev) => [
      ...prev,
      {
        ...update,
        timestamp: Date.now(),
      },
    ]);

    // Push browser history state to match the callback
    if (typeof window !== "undefined") {
      window.history.pushState(
        { navId: `action-${Date.now()}`, managed: true },
        "",
        window.location.href
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Navigation] Pushed: ${update.label || "unnamed"} (stack size: ${get(navigationStackAtom).length + 1})`
      );
    }
  }
);
