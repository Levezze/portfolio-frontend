import React from 'react'

export const Face = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`cube-face`}>
        {children}
    </div>
  )
}
