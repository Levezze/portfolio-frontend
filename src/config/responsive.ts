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
  /** Minimum window width for this breakpoint (desktop/tablet only) */
  minWidth?: number;
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
 * 1. Mobile device detection (overrides dimension checks)
 * 2. Both width AND height based for desktop/tablet (largest to smallest)
 *
 * Note: Requiring both dimensions prevents cube oversizing on extreme aspect ratios
 */
export const RESPONSIVE_CONFIG = {
  /**
   * Desktop Large - Large displays
   * Width ≥ 1000px AND Height ≥ 1000px → 800×800px cube
   */
  large: {
    minWidth: 1000,
    minHeight: 1000,
    targetPixelSize: 800,
    controlsLayout: "visible",
    description: "Large displays (≥1000×1000)",
  },

  /**
   * Desktop Medium - Standard desktops, laptops
   * Width ≥ 800px AND Height ≥ 800px → 650×650px cube
   */
  medium: {
    minWidth: 800,
    minHeight: 800,
    targetPixelSize: 650,
    controlsLayout: "visible",
    description: "Medium displays (≥800×800)",
  },

  /**
   * Small Desktop/Tablet - Small laptops, tablets
   * Width ≥ 600px AND Height ≥ 600px → 500×500px cube
   */
  small: {
    minWidth: 600,
    minHeight: 600,
    targetPixelSize: 500,
    controlsLayout: "visible",
    description: "Small displays (≥600×600)",
  },

  /**
   * Mobile - All mobile devices (phones)
   * Detected by device characteristics, not dimensions
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
 * 2. Window dimensions (both width AND height) → largest matching breakpoint
 * 3. Fallback → 'small'
 *
 * @returns Current breakpoint key
 *
 * @example
 * // On iPhone (mobile device)
 * getCurrentBreakpoint() // → 'mobile'
 *
 * @example
 * // On 1920×1080 desktop
 * getCurrentBreakpoint() // → 'large' (both >= 1000)
 *
 * @example
 * // On 912×1368 iPad portrait
 * getCurrentBreakpoint() // → 'large' (not mobile, both >= 1000)
 */
export function getCurrentBreakpoint(): BreakpointKey {
  // Check for mobile device first
  if (isMobileDevice()) {
    return "mobile";
  }

  // For desktop/tablet, check both width AND height
  // Check in order from largest to smallest
  const width = typeof window !== "undefined" ? window.innerWidth : 1000;
  const height = typeof window !== "undefined" ? window.innerHeight : 1000;

  if (width >= 1000 && height >= 1000) return "large";
  if (width >= 800 && height >= 800) return "medium";
  if (width >= 600 && height >= 600) return "small";

  // Fallback for screens < 600×600 (but not mobile devices)
  return "small";
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
    "large",
    "medium",
    "small",
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
