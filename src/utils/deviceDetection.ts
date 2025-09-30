/**
 * Device detection utilities for responsive breakpoint system
 *
 * These functions distinguish between mobile devices (phones) and desktop/tablet
 * devices to apply appropriate responsive strategies:
 * - Mobile: Percentage-based sizing (vh × 0.9)
 * - Desktop/Tablet: Height-based discrete breakpoints (800px, 700px, etc.)
 */

/**
 * Detect if current device is a mobile phone
 *
 * Uses multiple heuristics:
 * 1. User agent check for known mobile patterns
 * 2. Touch capability detection
 * 3. Screen size fallback for small devices
 *
 * Note: This distinguishes phones from tablets. Tablets are treated as
 * desktop devices and use height-based breakpoints.
 *
 * @returns true if device is a mobile phone, false otherwise
 *
 * @example
 * if (isMobileDevice()) {
 *   // Use percentage-based sizing
 *   cubeSize = windowHeight * 0.9;
 * } else {
 *   // Use height-based breakpoints
 *   cubeSize = getBreakpointSize(windowHeight);
 * }
 */
export function isMobileDevice(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check user agent for mobile patterns
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobilePatterns = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobilePatterns.test(userAgent);

  // Explicitly exclude tablets from mobile detection
  // iPad has "iPad" in UA, Android tablets often have "Mobile" absent
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

  // Check screen size (phones are typically smaller than 768px in smallest dimension)
  const smallestDimension = Math.min(window.innerWidth, window.innerHeight);
  const isSmallScreen = smallestDimension < 768;

  // REMOVED TOUCH DETECTION - it breaks on desktop with touchscreens!
  // Mobile detection should ONLY rely on user agent and screen size

  // Mobile if:
  // - Has mobile user agent (not tablet)
  // - AND has small screen
  // This prevents desktops with touch from being detected as mobile
  if (isTablet) {
    return false; // Tablets use desktop breakpoints
  }

  // Only return true for actual mobile phones
  return isMobileUA && !isTablet && isSmallScreen;
}

/**
 * Get current mobile orientation
 *
 * Determines if device is in portrait or landscape mode based on
 * aspect ratio. Used to decide whether to calculate cube size from
 * height (portrait) or width (landscape).
 *
 * @returns 'portrait' if height > width, 'landscape' otherwise
 *
 * @example
 * const orientation = getMobileOrientation();
 * if (orientation === 'portrait') {
 *   cubeSize = windowHeight * 0.9;
 * } else {
 *   cubeSize = windowWidth * 0.9;
 * }
 */
export function getMobileOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') {
    return 'portrait'; // Default for SSR
  }

  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Calculate mobile cube size based on current orientation
 *
 * Mobile uses percentage-based sizing to accommodate various screen sizes:
 * - Portrait: 90% of window height (10% for margins)
 * - Landscape: 90% of window width (10% for margins)
 *
 * This keeps the cube square while maximizing screen usage.
 *
 * @param marginPercent - Percentage of dimension to reserve for margins (default: 0.1 = 10%)
 * @returns Cube size in pixels
 *
 * @example
 * // On iPhone 12 Pro (390×844) in portrait
 * const size = calculateMobileCubeSize();
 * // Returns: 844 × 0.9 = 759.6px
 *
 * @example
 * // Same device rotated to landscape (844×390)
 * const size = calculateMobileCubeSize();
 * // Returns: 844 × 0.9 = 759.6px (uses width now)
 */
export function calculateMobileCubeSize(marginPercent: number = 0.1): number {
  if (typeof window === 'undefined') {
    return 400; // Default for SSR
  }

  const orientation = getMobileOrientation();

  // Calculate available dimension (after margins)
  const dimension = orientation === 'portrait'
    ? window.innerHeight
    : window.innerWidth;

  // Apply margin percentage (e.g., 0.1 = 10% total, 5% each side)
  const availableSize = dimension * (1 - marginPercent);

  return availableSize;
}

/**
 * Detect if orientation has changed
 *
 * Useful for triggering recalculations when device rotates
 *
 * @param previousOrientation - Previous orientation to compare against
 * @returns true if orientation changed, false otherwise
 */
export function hasOrientationChanged(
  previousOrientation: 'portrait' | 'landscape'
): boolean {
  const currentOrientation = getMobileOrientation();
  return currentOrientation !== previousOrientation;
}

/**
 * Get device type for logging/debugging
 *
 * @returns Device type string
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  if (isMobileDevice()) {
    return 'mobile';
  }

  // Check for tablet
  const userAgent = navigator.userAgent;
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

  if (isTablet) {
    return 'tablet';
  }

  return 'desktop';
}