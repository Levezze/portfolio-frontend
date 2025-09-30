import React from 'react';

export const Face = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`cube-face p-4 bg-background flex justify-center items-center opacity-50`}>
        {children}
    </div>
  )
}
