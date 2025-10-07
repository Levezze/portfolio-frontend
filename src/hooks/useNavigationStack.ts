"use client";

import { useAtom } from "jotai";
import { navigationStackAtom, type NavigationStackItem } from "@/atoms/atomStore";
import { useCallback, useEffect, useRef } from "react";

/**
 * Hook to manage the browser navigation stack with custom callbacks.
 *
 * Provides methods to push/pop navigation callbacks that reverse state changes,
 * allowing the browser back button to undo app actions instead of exiting.
 *
 * @example
 * const { pushBack } = useNavigationStack();
 *
 * // When changing state, push the undo callback
 * const handleNavigate = () => {
 *   const previousFace = currentFace;
 *   pushBack(() => setActiveFace(previousFace), 'Return to chat');
 *   setActiveFace('projects');
 * };
 */
export const useNavigationStack = () => {
  const [stack, setStack] = useAtom(navigationStackAtom);
  const isInitializedRef = useRef(false);

  // Initialize with a dummy history state on mount (client-side only)
  useEffect(() => {
    if (!isInitializedRef.current && typeof window !== "undefined") {
      isInitializedRef.current = true;

      // Only push initial state if there's no existing navigation state
      if (!window.history.state?.navId) {
        window.history.replaceState(
          { navId: `nav-${Date.now()}` },
          "",
          window.location.href
        );
      }
    }
  }, []);

  /**
   * Push a callback onto the navigation stack and create a browser history entry.
   * When the user presses back, this callback will be executed.
   */
  const pushBack = useCallback(
    (callback: () => void, label?: string) => {
      if (typeof window === "undefined") return;

      const item: NavigationStackItem = {
        callback,
        label,
        timestamp: Date.now(),
      };

      setStack((prev) => [...prev, item]);

      // Push a new history state
      window.history.pushState(
        { navId: `nav-${Date.now()}` },
        "",
        window.location.href
      );

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Navigation] Pushed: ${label || "unnamed"} (stack size: ${stack.length + 1})`
        );
      }
    },
    [setStack, stack.length]
  );

  /**
   * Execute and remove the top callback from the stack.
   * This is called by the global NavigationListener on popstate events.
   */
  const popBack = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) return prev;

      const item = prev[prev.length - 1];
      const newStack = prev.slice(0, -1);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Navigation] Popped: ${item.label || "unnamed"} (stack size: ${newStack.length})`
        );
      }

      // Execute the callback
      try {
        item.callback();
      } catch (error) {
        console.error("[Navigation] Error executing callback:", error);
      }

      return newStack;
    });
  }, [setStack]);

  /**
   * Clear the entire navigation stack.
   * Useful for reset scenarios or when navigating to a fresh state.
   */
  const clearStack = useCallback(() => {
    setStack([]);
    if (process.env.NODE_ENV === "development") {
      console.log("[Navigation] Stack cleared");
    }
  }, [setStack]);

  /**
   * Get the current size of the navigation stack.
   */
  const getStackSize = useCallback(() => stack.length, [stack.length]);

  return {
    pushBack,
    popBack,
    clearStack,
    getStackSize,
    stack: process.env.NODE_ENV === "development" ? stack : undefined,
  };
};
