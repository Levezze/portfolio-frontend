import type React from "react";
import { useAtomValue } from "jotai";
import { isMobileAtom, keyboardVisibleAtom } from "@/atoms/atomStore";
import { cn } from "@/lib/utils/general";

export const Face = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);
  // const keyboardActive = isMobile && keyboardVisible;
  const keyboardActive = true;

  return (
    <div
      className={cn(
        "cube-face bg-background flex overflow-hidden",
        keyboardActive
          ? "items-stretch justify-start"
          : "items-center justify-center"
      )}
    >
      <div
        className={cn(
          "face-content flex w-full h-full",
          keyboardActive && "keyboard-adjusted"
        )}
      >
        {children}
      </div>
    </div>
  );
};
