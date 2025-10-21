/**
 * Creates a debounced version of a function that delays its execution
 * until after `delay` milliseconds have elapsed since the last invocation.
 *
 * @param func The function to debounce
 * @param delay The number of milliseconds to delay
 * @returns A debounced version of the function
 *
 * @example
 * const debouncedResize = debounce((width, height) => {
 *   console.log('Resized to:', width, height);
 * }, 200);
 *
 * window.addEventListener('resize', () => {
 *   debouncedResize(window.innerWidth, window.innerHeight);
 * });
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Creates a debounced version with ability to cancel and flush.
 * Useful when you need more control over the debounced function.
 *
 * @param func The function to debounce
 * @param delay The number of milliseconds to delay
 * @returns Object with debounced function, cancel, and flush methods
 */
export function debounceWithControls<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): {
  debounced: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  const flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (lastArgs !== null) {
        func(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  return { debounced, cancel, flush };
}