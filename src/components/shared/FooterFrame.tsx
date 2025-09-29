import React from 'react';
import { useAtomValue } from 'jotai';
import { lightThemeAtom } from '@/atoms/atomStore';

export const FooterFrame = ({ children }: { children: React.ReactNode }) => {
  const theme = useAtomValue(lightThemeAtom);
  const borderColor = theme ? 'border-white' : 'border-background';
  return (
    <div className={`gap-2 flex flex-row justify-between z-100 p-1 border ${borderColor} rounded-full`}>
      {children}
    </div>
  )
}
