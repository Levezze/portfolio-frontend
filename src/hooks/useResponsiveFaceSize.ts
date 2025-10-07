import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  cubeSizeAtom,
  faceSizeAtom,
  isMobileAtom,
  viewportHeightAtom,
  viewportOrientationAtom,
  viewportWidthAtom,
} from "@/atoms/atomStore";
import { RESPONSIVE_CONFIG } from "@/config/responsive";

/**
 * Responsive face size hook - manages cube and HTML face sizing across breakpoints
 *
 * Strategy:
 * - Desktop/Tablet: Read --face-size from CSS (set by media queries)
 * - Mobile: Calculate 85% of viewport dimension, set --face-size dynamically
 * - Always: Update cubeSizeAtom = faceSize / 100
 *
 * CSS breakpoints (desktop/tablet):
 * - < 600×600: 400px
 * - ≥ 600×600: 500px
 * - ≥ 700×700: 600px
 * - ≥ 800×800: 650px
 * - ≥ 1000×1000: 800px
 */
export const useResponsiveFaceSize = () => {
  const setFaceSize = useSetAtom(faceSizeAtom);
  const setCubeSize = useSetAtom(cubeSizeAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const viewportHeight = useAtomValue(viewportHeightAtom);
  const viewportWidth = useAtomValue(viewportWidthAtom);
  const orientation = useAtomValue(viewportOrientationAtom);

  useEffect(() => {
    /**
     * Update face size and cube size based on current viewport
     */
    const updateSize = () => {
      let faceSize: number;
      const root = document.documentElement;

      if (isMobile) {
        const margin = RESPONSIVE_CONFIG.mobile.marginPercentage ?? 0.15;
        const dimension = (() => {
          if (orientation === "landscape") {
            return viewportWidth || viewportHeight;
          }
          return viewportHeight || viewportWidth;
        })();

        if (dimension && dimension > 0) {
          faceSize = dimension * (1 - margin);
          root.style.setProperty("--face-size", `${faceSize}px`);
        } else {
          const cssValue = getComputedStyle(root)
            .getPropertyValue("--face-size")
            .trim();
          const parsed = parseInt(cssValue, 10);
          faceSize = Number.isNaN(parsed) ? 400 : parsed;
        }
      } else {
        // Desktop/Tablet: Read from CSS (media queries control this)
        const cssValue = getComputedStyle(root)
          .getPropertyValue("--face-size")
          .trim();

        faceSize = parseInt(cssValue, 10);

        // Fallback to DEFAULT CSS value if parsing fails
        if (Number.isNaN(faceSize)) {
          console.warn(
            "Failed to read --face-size from CSS, using default 400px",
          );
          faceSize = 400;
        }
      }

      // Update atoms
      setFaceSize(faceSize);
      setCubeSize(faceSize / 100);
    };
    updateSize();
  }, [
    isMobile,
    orientation,
    setCubeSize,
    setFaceSize,
    viewportHeight,
    viewportWidth,
  ]);
};
