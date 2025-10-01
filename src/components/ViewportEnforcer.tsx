"use client";

import { useEffect } from "react";

export function ViewportEnforcer() {
  useEffect(() => {
    const enforceViewport = () => {
      let meta = document.querySelector('meta[name="viewport"]');
      const correctContent =
        "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes";
      let wasCorrected = false;

      if (!meta) {
        console.warn(
          "Viewport meta tag missing, forcing creation."
        );
        meta = document.createElement("meta");
        meta.setAttribute("name", "viewport");
        document.head.prepend(meta);
        wasCorrected = true;
      }

      if (meta.getAttribute("content") !== correctContent) {
        console.warn(
          "Viewport meta tag incorrect, forcing correction."
        );
        meta.setAttribute("content", correctContent);
        wasCorrected = true;
      }

      // Dispatch event to signal viewport is ready
      // This ensures size calculations happen AFTER viewport fix
      if (wasCorrected) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('viewport-corrected', {
            detail: { wasCorrected: true }
          }));
          // Also trigger resize to recalculate sizes
          window.dispatchEvent(new Event('resize'));
        }, 100);
      } else {
        // Even if not corrected, signal it's ready
        window.dispatchEvent(new CustomEvent('viewport-ready'));
      }
    };

    enforceViewport();
  }, []);

  return null;
}
