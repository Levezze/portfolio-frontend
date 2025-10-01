import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { cubeSizeAtom, faceSizeAtom } from "@/atoms/atomStore";
import { isMobileDevice } from "@/utils/deviceDetection";
import { RESPONSIVE_CONFIG } from "@/config/responsive";
import { calculateMobileCubeSize } from "@/utils/deviceDetection";

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

  useEffect(() => {
    /**
     * Update face size and cube size based on current viewport
     */
    const updateSize = () => {
      let faceSize: number;

      if (isMobileDevice()) {
        // Mobile: Calculate 85% of viewport dimension (orientation-aware)
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

    // Delay initial update to ensure viewport is ready
    // This prevents calculating with broken viewport dimensions
    const initializeSize = () => {
      // Small delay to let ViewportEnforcer run first
      setTimeout(() => {
        updateSize();
      }, 50);
    };

    // Listen for viewport correction events
    const handleViewportCorrected = () => {
      // console.log("Viewport corrected, recalculating size...");
      updateSize();
      // Signal that size calculation is complete after viewport fix
      window.dispatchEvent(new CustomEvent('size-calculated'));
    };

    // Initial update with delay
    initializeSize();

    // Debounced resize handler (150ms)
    const debouncedUpdate = debounce(updateSize, 150);
    window.addEventListener("resize", debouncedUpdate);
    window.addEventListener("viewport-corrected", handleViewportCorrected);
    window.addEventListener("viewport-ready", updateSize);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      window.removeEventListener("viewport-corrected", handleViewportCorrected);
      window.removeEventListener("viewport-ready", updateSize);
    };
  }, [setFaceSize, setCubeSize]);
};