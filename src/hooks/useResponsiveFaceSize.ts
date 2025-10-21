import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import {
  cubeSizeAtom,
  faceSizeAtom,
  isMobileAtom,
  viewportHeightAtom,
  viewportOrientationAtom,
  viewportWidthAtom,
  lockedDimensionsAtom,
  uiModeAtom,
} from "@/atoms/atomStore";
import { RESPONSIVE_CONFIG } from "@/config/responsive";
import { shouldLockSize } from "@/lib/utils/deviceDetection";
import { debounce } from "@/utils/debounce";

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
  const lockedDimensions = useAtomValue(lockedDimensionsAtom);
  const uiMode = useAtomValue(uiModeAtom);

  // Create a debounced update function for desktop
  const debouncedUpdate = useMemo(
    () =>
      debounce((width: number, height: number) => {
        const root = document.documentElement;

        // Desktop: Read from CSS (media queries control this)
        const cssValue = getComputedStyle(root)
          .getPropertyValue("--face-size")
          .trim();

        const faceSize = parseInt(cssValue, 10) || 400;

        // Update atoms
        setFaceSize(faceSize);
        setCubeSize(faceSize / 100);
      }, 200), // 200ms debounce
    [setFaceSize, setCubeSize]
  );

  useEffect(() => {
    /**
     * Update face size and cube size based on current viewport or locked dimensions
     */
    const updateSize = () => {
      const root = document.documentElement;
      const needsLocking = shouldLockSize();

      // Use locked dimensions for touch devices, live viewport for desktop
      const width = needsLocking && lockedDimensions
        ? lockedDimensions.width
        : viewportWidth;
      const height = needsLocking && lockedDimensions
        ? lockedDimensions.height
        : viewportHeight;

      if (needsLocking) {
        // Touch devices (phones and tablets): Use locked dimensions
        let faceSize: number;

        // Use mobile UI mode calculation
        if (uiMode === "mobile") {
          const margin = RESPONSIVE_CONFIG.mobile.marginPercentage ?? 0.15;
          const isPortrait = height >= width;
          const dimension = isPortrait ? height : width;

          if (dimension > 0) {
            faceSize = dimension * (1 - margin);
            root.style.setProperty("--face-size", `${faceSize}px`);
          } else {
            faceSize = 400; // Fallback
          }
        } else {
          // Large tablets with desktop UI: Read from CSS
          const cssValue = getComputedStyle(root)
            .getPropertyValue("--face-size")
            .trim();
          faceSize = parseInt(cssValue, 10) || 650;
        }

        // Update atoms immediately for touch devices (no debounce)
        setFaceSize(faceSize);
        setCubeSize(faceSize / 100);
      } else {
        // Desktop: Use debounced update
        debouncedUpdate(width, height);
      }
    };

    updateSize();
  }, [
    isMobile,
    orientation,
    setCubeSize,
    setFaceSize,
    viewportHeight,
    viewportWidth,
    lockedDimensions,
    uiMode,
    debouncedUpdate,
  ]);
};
