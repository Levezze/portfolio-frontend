"use client";

import { useEffect } from "react";
import { useNavigationStack } from "@/hooks/useNavigationStack";

/**
 * Global navigation listener component that intercepts browser back button events.
 *
 * This component:
 * 1. Listens for `popstate` events (browser back/forward)
 * 2. Executes the top callback from the navigation stack
 * 3. Prevents app exit by maintaining at least one dummy history entry
 *
 * Should be mounted once at the root level (in layout.tsx).
 */
export const NavigationListener = () => {
  const { popBack, getStackSize } = useNavigationStack();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      const stackSize = getStackSize();

      if (stackSize > 0) {
        // Execute the top callback from the stack
        popBack();

        // Immediately push a new dummy state to prevent exiting the app
        // This ensures there's always a history entry to go back to
        window.history.pushState(
          { navId: `nav-${Date.now()}` },
          "",
          window.location.href
        );
      } else {
        // Stack is empty - prevent exit by pushing a new dummy state
        window.history.pushState(
          { navId: `nav-${Date.now()}` },
          "",
          window.location.href
        );

        if (process.env.NODE_ENV === "development") {
          console.log(
            "[Navigation] Back pressed with empty stack - prevented exit"
          );
        }
      }
    };

    // Listen for browser back/forward events
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [popBack, getStackSize]);

  // This component renders nothing
  return null;
};
