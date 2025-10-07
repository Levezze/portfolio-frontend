import type React from "react";

export const Face = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={`cube-face bg-background flex justify-center items-center overflow-hidden`}
    >
      {children}
    </div>
  );
};
