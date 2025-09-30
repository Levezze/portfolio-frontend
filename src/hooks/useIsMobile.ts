import { useState, useEffect } from 'react';
import { isMobileDevice } from '@/utils/deviceDetection';

/**
 * Hook to detect if current device is mobile
 *
 * Used for conditional rendering (e.g., drawer vs fixed footer)
 *
 * @returns boolean - true if mobile device, false otherwise
 *
 * @example
 * const isMobile = useIsMobile();
 * return isMobile ? <Drawer /> : <Footer />;
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    /**
     * Check if device is mobile
     */
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    /**
     * Debounce helper
     */
    const debounce = <T extends (...args: any[]) => void>(
      fn: T,
      delay: number
    ): ((...args: Parameters<T>) => void) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    };

    // Initial check
    checkMobile();

    // Listen for resize (debounced) in case device type changes
    // (e.g., dev tools device emulation)
    const debouncedCheck = debounce(checkMobile, 150);
    window.addEventListener('resize', debouncedCheck);

    return () => {
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);

  return isMobile;
};