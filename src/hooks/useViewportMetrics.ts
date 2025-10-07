import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import {
  activeInputElementAtom,
  isMobileAtom,
  keyboardVisibleAtom,
  viewportHeightAtom,
  viewportOrientationAtom,
  viewportWidthAtom,
} from "@/atoms/atomStore";
import { isMobileDevice } from "@/lib/utils/deviceDetection";

type Orientation = "portrait" | "landscape";

type ViewportSize = {
  width: number;
  height: number;
};

const readViewportSize = (): ViewportSize => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const viewport = window.visualViewport;
  const width =
    viewport?.width ??
    window.innerWidth ??
    document.documentElement.clientWidth ??
    0;
  const height =
    viewport?.height ??
    window.innerHeight ??
    document.documentElement.clientHeight ??
    0;

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
  const dimensionBasedOrientation = width >= height ? "landscape" : "portrait";

  // Special case: if keyboard was open in portrait, maintain portrait
  // even if viewport temporarily becomes wider due to keyboard
  if (previous === "portrait" && portraitMax > 0) {
    if (height < portraitMax * 0.9 && width > height) {
      return "portrait";
    }
  }

  return dimensionBasedOrientation;
};

export const useViewportMetrics = () => {
  const setViewportHeight = useSetAtom(viewportHeightAtom);
  const setViewportWidth = useSetAtom(viewportWidthAtom);
  const setOrientation = useSetAtom(viewportOrientationAtom);
  const setIsMobile = useSetAtom(isMobileAtom);
  const setActiveInput = useSetAtom(activeInputElementAtom);
  const setKeyboardVisible = useSetAtom(keyboardVisibleAtom);

  const maxHeightRef = useRef<{ portrait: number; landscape: number }>({
    portrait: 0,
    landscape: 0,
  });
  const orientationRef = useRef<Orientation>("portrait");
  const keyboardVisibleRef = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);

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

      root.style.setProperty("--viewport-height", `${stableHeight}px`);

      setViewportHeight(stableHeight);
      setViewportWidth(width);
      setOrientation(orientation);
      setIsMobile(isMobileDevice({ width, height }));
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

      // Set active input element for FloatingInputMirror
      if (isKeyboardEl) {
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ) {
          setActiveInput(target);
        }
      } else {
        setActiveInput(null);
      }
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
    window.visualViewport?.addEventListener("resize", handleResize);

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
        window.visualViewport?.removeEventListener("resize", handleResize);
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
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [
    setIsMobile,
    setOrientation,
    setViewportHeight,
    setViewportWidth,
    isKeyboardElement,
    setActiveInput,
    setKeyboardVisible,
  ]);
};
