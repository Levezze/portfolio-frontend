import React from 'react'

export const Face = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`cube-face p-4 bg-white`}>
        {children}
    </div>
  )
}
