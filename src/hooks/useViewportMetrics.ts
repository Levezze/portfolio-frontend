import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import {
  isMobileAtom,
  keyboardVisibleAtom,
  keyboardHeightAtom,
  viewportHeightAtom,
  viewportOrientationAtom,
  viewportWidthAtom,
  lockedDimensionsAtom,
  lastOrientationAtom,
  uiModeAtom,
} from "@/atoms/atomStore";
import {
  isMobileDevice,
  shouldLockSize,
  getUIMode
} from "@/lib/utils/deviceDetection";

type Orientation = "portrait" | "landscape";

type ViewportSize = {
  width: number;
  height: number;
};

const readViewportSize = (): ViewportSize => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  // Use layout viewport for stable sizing across zoom, Safari chrome, etc.
  // Visual viewport changes with zoom/keyboard/UI chrome - wrong for cube sizing
  const width = window.innerWidth ?? document.documentElement.clientWidth ?? 0;
  const height =
    window.innerHeight ?? document.documentElement.clientHeight ?? 0;

  return { width, height };
};

const detectOrientation = (
  width: number,
  height: number,
  previous: Orientation,
  portraitMax: number,
): Orientation => {
  // Primary detection: viewport dimensions
  // This works correctly in both real devices and DevTools simulation
  // (screen.orientation APIs report physical screen, breaking DevTools)
  return width >= height ? "landscape" : "portrait";
};

export const useViewportMetrics = () => {
  const setViewportHeight = useSetAtom(viewportHeightAtom);
  const setViewportWidth = useSetAtom(viewportWidthAtom);
  const setOrientation = useSetAtom(viewportOrientationAtom);
  const setIsMobile = useSetAtom(isMobileAtom);
  const setKeyboardVisible = useSetAtom(keyboardVisibleAtom);
  const setKeyboardHeight = useSetAtom(keyboardHeightAtom);
  const setLockedDimensions = useSetAtom(lockedDimensionsAtom);
  const setLastOrientation = useSetAtom(lastOrientationAtom);
  const setUIMode = useSetAtom(uiModeAtom);

  const maxHeightRef = useRef<{ portrait: number; landscape: number }>({
    portrait: 0,
    landscape: 0,
  });
  const orientationRef = useRef<Orientation>("portrait");
  const keyboardVisibleRef = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);
  const lastOrientationRef = useRef<Orientation | null>(null);
  const lockedDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const isKeyboardElement = (node: Element | null): boolean => {
    if (!node) return false;

    if (node instanceof HTMLInputElement) {
      const type = node.type;
      const ignored = new Set([
        "button",
        "checkbox",
        "color",
        "file",
        "hidden",
        "image",
        "radio",
        "range",
        "reset",
        "submit",
      ]);
      return !ignored.has(type);
    }

    if (node instanceof HTMLTextAreaElement) {
      return true;
    }

    if (node instanceof HTMLElement && node.isContentEditable) {
      return true;
    }

    if (node instanceof HTMLElement) {
      if (
        node.dataset.keyboardElement === "true" ||
        node.closest("[data-keyboard-element='true']")
      ) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;

    const applyMetrics = (reset: boolean) => {
      const { width, height } = readViewportSize();
      const keyboardVisible = keyboardVisibleRef.current;
      const orientation = detectOrientation(
        width,
        height,
        orientationRef.current,
        maxHeightRef.current.portrait,
      );
      orientationRef.current = orientation;

      // Check if this is a touch device that needs size locking
      const needsLocking = shouldLockSize();
      const orientationChanged = lastOrientationRef.current !== null &&
                                 lastOrientationRef.current !== orientation;

      // Lock dimensions on touch devices
      if (needsLocking) {
        // Initialize or update locked dimensions only on:
        // 1. First load (!isInitializedRef.current)
        // 2. Orientation change
        if (!isInitializedRef.current || orientationChanged) {
          lockedDimensionsRef.current = { width, height };
          setLockedDimensions({ width, height });
          lastOrientationRef.current = orientation;
          setLastOrientation(orientation);
          isInitializedRef.current = true;
        }
      } else {
        // Desktop: don't lock dimensions
        lockedDimensionsRef.current = null;
        setLockedDimensions(null);
      }

      if (reset || !keyboardVisible) {
        maxHeightRef.current[orientation] = 0;
      }

      let stableHeight = maxHeightRef.current[orientation];

      if (!keyboardVisible) {
        const previous = typeof stableHeight === "number" ? stableHeight : 0;
        stableHeight = Math.max(previous, height);
        maxHeightRef.current[orientation] = stableHeight;
      }

      if (typeof stableHeight !== "number" || stableHeight <= 0) {
        stableHeight = height;
        maxHeightRef.current[orientation] = stableHeight;
      }

      // Calculate keyboard height: difference between stable and current viewport
      const keyboardHeight = keyboardVisible
        ? Math.max(0, stableHeight - height)
        : 0;

      root.style.setProperty("--viewport-height", `${stableHeight}px`);

      // Always update viewport dimensions (for keyboard detection)
      setViewportHeight(stableHeight);
      setViewportWidth(width);
      setOrientation(orientation);
      setIsMobile(isMobileDevice({ width, height }));
      setKeyboardHeight(keyboardHeight);

      // Update UI mode based on screen width
      setUIMode(getUIMode({ width, height }));
    };

    const scheduleUpdate = (reset = false) => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = window.requestAnimationFrame(() => applyMetrics(reset));
    };

    applyMetrics(true);

    const handleResize = () => scheduleUpdate(false);
    const handleOrientationChange = () => scheduleUpdate(true);

    const updateKeyboardVisibility = (visible: boolean) => {
      if (keyboardVisibleRef.current === visible) {
        return;
      }
      keyboardVisibleRef.current = visible;
      setKeyboardVisible(visible);
      scheduleUpdate(true);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      const isKeyboardEl = isKeyboardElement(target);
      updateKeyboardVisibility(isKeyboardEl);

    };

    const handleFocusOut = () => {
      requestAnimationFrame(() => {
        const active = document.activeElement as Element | null;
        updateKeyboardVisibility(isKeyboardElement(active));
      });
    };

    window.addEventListener("focusin", handleFocusIn, true);
    window.addEventListener("focusout", handleFocusOut, true);

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    // Don't listen to visualViewport resize - it fires on zoom/Safari chrome changes
    // We only want to resize on real window/orientation changes

    const virtualKeyboard = (navigator as any)?.virtualKeyboard;
    if (
      virtualKeyboard &&
      typeof virtualKeyboard.addEventListener === "function"
    ) {
      try {
        virtualKeyboard.overlaysContent = true;
      } catch (error) {
        console.warn("Unable to enable virtual keyboard overlay", error);
      }

      const handleGeometryChange = (event: any) => {
        const rect = event?.target?.boundingRect;
        if (!rect) {
          updateKeyboardVisibility(false);
          return;
        }
        updateKeyboardVisibility(rect.height > 0);
      };

      virtualKeyboard.addEventListener("geometrychange", handleGeometryChange);

      return () => {
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
        }
        window.removeEventListener("focusin", handleFocusIn, true);
        window.removeEventListener("focusout", handleFocusOut, true);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener(
          "orientationchange",
          handleOrientationChange,
        );
        virtualKeyboard.removeEventListener(
          "geometrychange",
          handleGeometryChange,
        );
      };
    }

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      window.removeEventListener("focusin", handleFocusIn, true);
      window.removeEventListener("focusout", handleFocusOut, true);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [
    setIsMobile,
    setOrientation,
    setViewportHeight,
    setViewportWidth,
    isKeyboardElement,
    setKeyboardVisible,
    setKeyboardHeight,
    setLockedDimensions,
    setLastOrientation,
    setUIMode,
  ]);
};
