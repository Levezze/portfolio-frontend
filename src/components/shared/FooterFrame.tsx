import React from 'react';

export const FooterFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="gap-2 flex flex-row justify-between z-100 p-1 border border-white rounded-full">
      {children}
    </div>
  )
}
