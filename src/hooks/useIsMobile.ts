import { useAtomValue } from 'jotai';
import { isMobileAtom } from '@/atoms/atomStore';

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
  return useAtomValue(isMobileAtom);
};
