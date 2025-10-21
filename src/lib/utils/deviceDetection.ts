/**
 * Device detection helpers for determining device type, UI mode, and size locking behavior.
 *
 * Provides functions to detect:
 * - Touch screen devices (phones and tablets)
 * - Specific device types (phone, tablet, desktop)
 * - UI mode (mobile vs desktop layout)
 * - Whether cube size should be locked (touch devices)
 */

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
const TABLET_USER_AGENT_PATTERN = /iPad|Android(?!.*Mobile)|Tablet/i;

// UI mode threshold - devices wider than this use desktop UI
const DESKTOP_UI_WIDTH_THRESHOLD = 900;

type Dimensions = {
  width: number;
  height: number;
};

const getDimensions = (dimensions?: Partial<Dimensions>): Dimensions => {
  if (
    dimensions &&
    typeof dimensions.width === "number" &&
    typeof dimensions.height === "number"
  ) {
    return { width: dimensions.width, height: dimensions.height };
  }

  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth ?? 0,
    height: window.innerHeight ?? 0,
  };
};

/**
 * Detect if current device is a mobile phone (not tablet).
 *
 * Combines UA sniffing with a size fallback so we do not rely purely on
 * viewport measurements. Optional dimensions can be provided to avoid
 * reading from `window` repeatedly.
 */
export function isMobileDevice(dimensions?: Partial<Dimensions>): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const { width, height } = getDimensions(dimensions);

  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any)?.opera || "";
  const isMobileUA = MOBILE_USER_AGENT_PATTERN.test(userAgent);
  const isTabletUA = TABLET_USER_AGENT_PATTERN.test(userAgent);

  const shortestSide = Math.min(width || Infinity, height || Infinity);

  return (
    (isMobileUA && !isTabletUA) ||
    (shortestSide > 0 && shortestSide < 600)
  );
}

/**
 * Detect if current device is a tablet.
 *
 * Tablets are devices with:
 * - Tablet user agent (iPad, Android tablet)
 * - OR screen width between 600-1366px
 */
export function isTabletDevice(dimensions?: Partial<Dimensions>): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const { width } = getDimensions(dimensions);
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any)?.opera || "";

  const isTabletUA = TABLET_USER_AGENT_PATTERN.test(userAgent);
  const isTabletSize = width >= 600 && width <= 1366;

  return isTabletUA || isTabletSize;
}

/**
 * Detect if device has a touch screen (phones and tablets).
 * These devices have virtual keyboards that can resize the viewport.
 */
export function hasTouchScreen(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Check for touch capability
  const hasTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  // Also check user agent for mobile/tablet
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any)?.opera || "";
  const isMobileOrTabletUA =
    MOBILE_USER_AGENT_PATTERN.test(userAgent) ||
    TABLET_USER_AGENT_PATTERN.test(userAgent);

  return hasTouch || isMobileOrTabletUA;
}

/**
 * Determine UI mode based on screen width.
 *
 * - Mobile UI: < 900px width (phones, iPad mini)
 * - Desktop UI: >= 900px width (iPad Pro, laptops, desktops)
 */
export function getUIMode(dimensions?: Partial<Dimensions>): "mobile" | "desktop" {
  const { width } = getDimensions(dimensions);
  return width < DESKTOP_UI_WIDTH_THRESHOLD ? "mobile" : "desktop";
}

/**
 * Determine if cube size should be locked (not responsive to viewport changes).
 *
 * Size locking applies to all touch devices (phones and tablets) because
 * they have virtual keyboards that resize the viewport.
 */
export function shouldLockSize(): boolean {
  return hasTouchScreen();
}

/**
 * Get detailed device classification.
 */
export function getDeviceClassification(dimensions?: Partial<Dimensions>): {
  type: "phone" | "tablet" | "desktop";
  uiMode: "mobile" | "desktop";
  shouldLockSize: boolean;
} {
  const { width, height } = getDimensions(dimensions);
  const shortestSide = Math.min(width || Infinity, height || Infinity);

  // Determine device type
  let type: "phone" | "tablet" | "desktop";
  if (shortestSide < 600) {
    type = "phone";
  } else if (isTabletDevice(dimensions)) {
    type = "tablet";
  } else {
    type = "desktop";
  }

  return {
    type,
    uiMode: getUIMode(dimensions),
    shouldLockSize: shouldLockSize()
  };
}

/**
 * Convenience helper used for logging.
 */
export function getDeviceType(
  dimensions?: Partial<Dimensions>,
): "mobile" | "desktop" {
  return isMobileDevice(dimensions) ? "mobile" : "desktop";
}
