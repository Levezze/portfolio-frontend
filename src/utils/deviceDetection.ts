/**
 * Minimal device detection helpers.
 *
 * Currently only exposes a mobile device heuristic that combines
 * user agent matching with a width/height fallback. Additional helpers
 * can be reintroduced here if required, but the viewport sizing logic
 * now lives in the viewport metrics hook.
 */

const MOBILE_USER_AGENT_PATTERN = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
const TABLET_USER_AGENT_PATTERN = /iPad|Android(?!.*Mobile)/i;

type Dimensions = {
  width: number;
  height: number;
};

const getDimensions = (dimensions?: Partial<Dimensions>): Dimensions => {
  if (dimensions && typeof dimensions.width === "number" && typeof dimensions.height === "number") {
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

  const userAgent = navigator.userAgent || navigator.vendor || (window as any)?.opera || "";
  const isMobileUA = MOBILE_USER_AGENT_PATTERN.test(userAgent);
  const isTabletUA = TABLET_USER_AGENT_PATTERN.test(userAgent);

  return (isMobileUA && !isTabletUA) || (width > 0 && height > 0 && width < 600 && height < 600);
}

/**
 * Convenience helper used for logging.
 */
export function getDeviceType(dimensions?: Partial<Dimensions>): "mobile" | "desktop" {
  return isMobileDevice(dimensions) ? "mobile" : "desktop";
}
