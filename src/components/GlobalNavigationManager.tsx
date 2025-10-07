"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  activeFaceAtom,
  navigationStackAtom,
  navigateToFaceAtom,
} from "@/atoms/atomStore";
import type { PagesType } from "@/lib/api/schemas/tools";

/**
 * Global Navigation Manager
 *
 * Centralized navigation controller that:
 * 1. Subscribes to activeFaceAtom and automatically tracks page changes
 * 2. Listens for popstate events (back button presses from all sources)
 * 3. Maintains proper browser history to prevent app exit
 * 4. Executes navigation callbacks in LIFO order
 *
 * Mounted once at the root level in layout.tsx
 */
export const GlobalNavigationManager = () => {
  const activeFace = useAtomValue(activeFaceAtom);
  const navigateToFace = useSetAtom(navigateToFaceAtom);
  const stack = useAtomValue(navigationStackAtom);
  const setStack = useSetAtom(navigationStackAtom);

  const previousFaceRef = useRef<PagesType>(activeFace);
  const isInitializedRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  // Ref to access current stack without recreating popstate handler
  const stackRef = useRef(stack);
  stackRef.current = stack;

  // Track previous stack length to detect additions
  const previousStackLengthRef = useRef(stack.length);

  // Push browser history state when stack grows (forward navigation)
  useEffect(() => {
    if (stack.length > previousStackLengthRef.current && typeof window !== "undefined") {
      // Stack grew - user navigated forward
      window.history.pushState(
        { navId: `nav-${Date.now()}`, managed: true },
        "",
        window.location.href
      );

      if (process.env.NODE_ENV === "development") {
        console.log(`[Navigation] History pushed (stack size: ${stack.length})`);
      }
    }
    previousStackLengthRef.current = stack.length;
  }, [stack.length]);

  // Initialize navigation system - no dummy entries needed
  useEffect(() => {
    if (!isInitializedRef.current && typeof window !== "undefined") {
      isInitializedRef.current = true;

      if (process.env.NODE_ENV === "development") {
        console.log("[Navigation] System initialized");
      }
    }
  }, []);

  // Track face changes for reference only (no automatic callback pushing)
  // The navigation direction is now handled explicitly by components
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousFaceRef.current = activeFace;
      return;
    }

    if (previousFaceRef.current !== activeFace) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Navigation] Face changed: ${previousFaceRef.current} → ${activeFace}`);
      }
      previousFaceRef.current = activeFace;
    }
  }, [activeFace]);

  // Listen for popstate events (back button from any source)
  // Uses stackRef to avoid recreating handler on every stack change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      // Access current stack via ref (not closure)
      const currentStack = stackRef.current;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Navigation] popstate fired, stack size: ${currentStack.length}`,
          event.state
        );
      }

      if (currentStack.length > 0) {
        // Pop and execute the most recent callback
        setStack((prev) => {
          if (prev.length === 0) return prev;

          const item = prev[prev.length - 1];

          if (process.env.NODE_ENV === "development") {
            console.log(
              `[Navigation] Executing: ${item.label || "unnamed"} (remaining: ${prev.length - 1})`
            );
          }

          try {
            item.callback();
          } catch (error) {
            console.error("[Navigation] Error executing callback:", error);
          }

          // Return new stack without the executed item
          return prev.slice(0, -1);
        });

        // DON'T push forward - let browser naturally handle back navigation
      } else {
        // Stack is empty - prevent app exit by pushing forward
        window.history.pushState(
          { navId: `trap-${Date.now()}`, managed: true },
          "",
          window.location.href
        );

        if (process.env.NODE_ENV === "development") {
          console.log("[Navigation] Back pressed with empty stack - trapped");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setStack]); // Only recreate if setStack changes (effectively never)

  // This component renders nothing
  return null;
};
