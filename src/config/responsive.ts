/**
 * Responsive breakpoint configuration for 3D cube sizing
 *
 * This configuration defines discrete breakpoints that control:
 * - Cube size on screen (in pixels)
 * - Camera positioning
 * - UI layout (visible controls vs drawer)
 *
 * Strategy:
 * - Desktop/Tablet: Height-based breakpoints with fixed pixel sizes
 * - Mobile: Percentage-based sizing with dynamic calculation
 */

import {
  isMobileDevice,
  calculateMobileCubeSize,
} from "@/utils/deviceDetection";

/**
 * Configuration for a single breakpoint
 */
export interface BreakpointConfig {
  /** Minimum window height for this breakpoint (desktop/tablet only) */
  minHeight?: number;
  /** Maximum window height for this breakpoint (desktop/tablet only) */
  maxHeight?: number;
  /** Target size in CSS pixels (fixed for desktop/tablet) */
  targetPixelSize?: number;
  /** Function to calculate size (mobile only) */
  targetPixelSizeCalculator?: (dimension: number) => number;
  /** Whether this is a mobile breakpoint */
  isMobile?: boolean;
  /** Controls layout mode */
  controlsLayout: "visible" | "drawer";
  /** Margin percentage for mobile (default: 0.1 = 10%) */
  marginPercentage?: number;
  /** Description for documentation */
  description?: string;
}

/**
 * All breakpoint configurations
 *
 * Breakpoints are checked in order:
 * 1. Mobile device detection (overrides height checks)
 * 2. Height-based for desktop/tablet (largest to smallest)
 */
export const RESPONSIVE_CONFIG = {
  /**
   * Desktop Large - 27"+ monitors, large displays
   * Height ≥ 1200px → 800×800px cube
   */
  desktopLarge: {
    minHeight: 1200,
    targetPixelSize: 800,
    controlsLayout: "visible",
    description: 'Large desktop displays (27"+)',
  },

  /**
   * Desktop Medium - Standard desktops, large laptops
   * 1000px ≤ Height < 1200px → 700×700px cube
   */
  desktopMedium: {
    minHeight: 1000,
    maxHeight: 1199,
    targetPixelSize: 700,
    controlsLayout: "visible",
    description: "Medium desktops and large laptops",
  },

  /**
   * Tablet Landscape - iPads, tablets in landscape, small laptops
   * 800px ≤ Height < 1000px → 650×650px cube
   */
  tabletLandscape: {
    minHeight: 800,
    maxHeight: 999,
    targetPixelSize: 650,
    controlsLayout: "visible",
    description: "Tablets in landscape, small laptops",
  },

  /**
   * Tablet Portrait - Tablets in portrait mode
   * 700px ≤ Height < 800px → 600×600px cube
   */
  tabletPortrait: {
    minHeight: 700,
    maxHeight: 799,
    targetPixelSize: 600,
    controlsLayout: "visible",
    description: "Tablets in portrait mode",
  },

  /**
   * Mobile - All mobile devices (phones)
   * Detected by device characteristics, not height
   * Size = 90% of viewport dimension (height in portrait, width in landscape)
   * Controls moved to drawer component
   */
  mobile: {
    isMobile: true,
    targetPixelSizeCalculator: (dimension: number) => dimension * 0.9,
    controlsLayout: "drawer",
    marginPercentage: 0.1,
    description: "Mobile phones (portrait and landscape)",
  },
} as const satisfies Record<string, BreakpointConfig>;

/**
 * Valid breakpoint keys
 */
export type BreakpointKey = keyof typeof RESPONSIVE_CONFIG;

/**
 * Get current breakpoint based on device and window size
 *
 * Priority:
 * 1. Mobile device → 'mobile' breakpoint
 * 2. Window height → largest matching desktop/tablet breakpoint
 * 3. Fallback → 'desktopLarge'
 *
 * @returns Current breakpoint key
 *
 * @example
 * // On iPhone (mobile device)
 * getCurrentBreakpoint() // → 'mobile'
 *
 * @example
 * // On 1920×1080 desktop
 * getCurrentBreakpoint() // → 'desktopLarge' (height >= 1200)
 *
 * @example
 * // On 912×1368 iPad portrait
 * getCurrentBreakpoint() // → 'desktopLarge' (not mobile, height >= 1200)
 */
export function getCurrentBreakpoint(): BreakpointKey {
  // Check for mobile device first
  if (isMobileDevice()) {
    return "mobile";
  }

  // For desktop/tablet, check height-based breakpoints
  // Check in order from largest to smallest
  const height = typeof window !== "undefined" ? window.innerHeight : 1200;

  if (height >= 1200) return "desktopLarge";
  if (height >= 1000) return "desktopMedium";
  if (height >= 800) return "tabletLandscape";
  if (height >= 700) return "tabletPortrait";

  // Fallback for very small screens (< 700px but not mobile)
  return "tabletPortrait";
}

/**
 * Get configuration for a specific breakpoint
 *
 * @param breakpoint - Breakpoint key
 * @returns Breakpoint configuration
 */
export function getBreakpointConfig(
  breakpoint: BreakpointKey
): BreakpointConfig {
  return RESPONSIVE_CONFIG[breakpoint];
}

/**
 * Get target pixel size for current breakpoint
 *
 * For mobile: calculates dynamically based on viewport
 * For desktop/tablet: returns fixed value from config
 *
 * @param breakpoint - Current breakpoint key
 * @returns Target size in pixels
 *
 * @example
 * // Desktop
 * getTargetPixelSize('desktopLarge') // → 800
 *
 * @example
 * // Mobile (740px tall viewport)
 * getTargetPixelSize('mobile') // → 666 (740 × 0.9)
 */
export function getTargetPixelSize(breakpoint: BreakpointKey): number {
  // Mobile: calculate dynamically from viewport
  if (breakpoint === "mobile") {
    const mobileConfig = RESPONSIVE_CONFIG.mobile;
    return calculateMobileCubeSize(mobileConfig.marginPercentage);
  }

  // Desktop/Tablet: fixed value
  const config = RESPONSIVE_CONFIG[breakpoint];
  return config.targetPixelSize || 800; // Fallback
}

/**
 * Check if breakpoint has changed
 *
 * @param previousBreakpoint - Previous breakpoint
 * @param currentBreakpoint - Current breakpoint
 * @returns true if different, false if same
 */
export function hasBreakpointChanged(
  previousBreakpoint: BreakpointKey | null,
  currentBreakpoint: BreakpointKey
): boolean {
  return previousBreakpoint !== currentBreakpoint;
}

/**
 * Get all breakpoint keys in priority order
 *
 * @returns Array of breakpoint keys from largest to smallest
 */
export function getAllBreakpoints(): BreakpointKey[] {
  return [
    "desktopLarge",
    "desktopMedium",
    "tabletLandscape",
    "tabletPortrait",
    "mobile",
  ];
}

/**
 * Debug helper: log current breakpoint info
 */
export function logBreakpointInfo(): void {
  if (typeof window === "undefined") return;

  const breakpoint = getCurrentBreakpoint();
  const config = getBreakpointConfig(breakpoint);
  const targetSize = getTargetPixelSize(breakpoint);

  console.group("📐 Responsive Breakpoint Info");
  console.log("Current breakpoint:", breakpoint);
  console.log("Target pixel size:", targetSize);
  console.log("Controls layout:", config.controlsLayout);
  console.log("Window size:", `${window.innerWidth}×${window.innerHeight}`);
  console.log("Config:", config);
  console.groupEnd();
}
