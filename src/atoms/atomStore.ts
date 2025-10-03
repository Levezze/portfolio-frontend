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
