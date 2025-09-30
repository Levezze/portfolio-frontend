import React from 'react';

interface FooterFrameProps {
  children: React.ReactNode;
  variant?: 'default' | 'mobile';
}

export const FooterFrame = ({ children, variant = 'default' }: FooterFrameProps) => {
  // Border color based on variant
  const borderColorClass = variant === 'mobile'
    ? 'border-foreground/20'
    : 'border-white dark:border-muted';

  return (
    <div className={`gap-2 flex flex-row justify-between z-100 p-1 border ${borderColorClass} rounded-full`}>
      {children}
    </div>
  )
}
