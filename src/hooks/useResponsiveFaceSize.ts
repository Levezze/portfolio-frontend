import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { cubeSizeAtom, faceSizeAtom } from "@/atoms/atomStore";
import { isMobileDevice, getMobileOrientation } from "@/utils/deviceDetection";
import { RESPONSIVE_CONFIG } from "@/config/responsive";
import { calculateMobileCubeSize } from "@/utils/deviceDetection";

/**
 * Responsive face size hook - manages cube and HTML face sizing across breakpoints
 *
 * Strategy:
 * - Desktop/Tablet: Read --face-size from CSS (set by media queries)
 * - Mobile: Calculate 90% of viewport dimension, set --face-size dynamically
 * - Always: Update cubeSizeAtom = faceSize / 100
 *
 * CSS breakpoints (desktop/tablet):
 * - < 600×600: 400px
 * - ≥ 600×600: 500px
 * - ≥ 800×800: 650px
 * - ≥ 1000×1000: 800px
 */
export const useResponsiveFaceSize = () => {
  const setFaceSize = useSetAtom(faceSizeAtom);
  const setCubeSize = useSetAtom(cubeSizeAtom);

  useEffect(() => {
    /**
     * Update face size and cube size based on current viewport
     */
    const updateSize = () => {
      let faceSize: number;

      if (isMobileDevice()) {
        // Mobile: Calculate 90% of viewport dimension (orientation-aware)
        /* const orientation = getMobileOrientation();
        const dimension = orientation === 'portrait'
          ? window.innerHeight
          : window.innerWidth; */

        faceSize = calculateMobileCubeSize(
          RESPONSIVE_CONFIG.mobile.marginPercentage
        );

        // Set CSS variable dynamically for mobile
        document.documentElement.style.setProperty(
          "--face-size",
          `${faceSize}px`
        );
      } else {
        // Desktop/Tablet: Read from CSS (media queries control this)
        const cssValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--face-size")
          .trim();

        faceSize = parseInt(cssValue, 10);

        // Fallback to DEFAULT CSS value if parsing fails
        // The CSS default is 400px, NOT 800px!
        if (isNaN(faceSize)) {
          console.warn(
            "Failed to read --face-size from CSS, using default 400px"
          );
          faceSize = 400;
        }
      }

      // Update atoms
      setFaceSize(faceSize);
      setCubeSize(faceSize / 100);
    };

    /**
     * Debounce helper
     */
    const debounce = <T extends (...args: any[]) => void>(
      fn: T,
      delay: number
    ): ((...args: Parameters<T>) => void) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    };

    // Initial update
    updateSize();

    // Debounced resize handler (150ms)
    const debouncedUpdate = debounce(updateSize, 150);
    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, [setFaceSize, setCubeSize]);
};
