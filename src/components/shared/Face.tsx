import type React from "react";
import { useAtomValue } from "jotai";
import { isMobileAtom, keyboardVisibleAtom } from "@/atoms/atomStore";
import { cn } from "@/lib/utils/general";

export const Face = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);
  const keyboardActive = isMobile && keyboardVisible;

  return (
    <div
      className="cube-face bg-background flex justify-center items-center overflow-hidden"
    >
      <div
        className={cn(
          "face-content flex w-full h-full",
          keyboardActive && "keyboard-adjusted",
        )}
      >
        {children}
      </div>
    </div>
  );
};
