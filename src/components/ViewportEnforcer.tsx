"use client";

import { useEffect } from "react";

export function ViewportEnforcer() {
  useEffect(() => {
    const enforceViewport = () => {
      let meta = document.querySelector('meta[name="viewport"]');
      const correctContent =
        "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes";

      if (!meta) {
        console.warn(
          "Viewport meta tag missing, forcing creation."
        );
        meta = document.createElement("meta");
        meta.setAttribute("name", "viewport");
        document.head.prepend(meta);
      }

      if (meta.getAttribute("content") !== correctContent) {
        console.warn(
          "Viewport meta tag incorrect, forcing correction."
        );
        meta.setAttribute("content", correctContent);
      }
    };

    enforceViewport();
  }, []);

  return null;
}
