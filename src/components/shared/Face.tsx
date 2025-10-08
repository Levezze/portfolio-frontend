import type React from "react";
import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import {
  activeInputElementAtom,
  isMobileAtom,
  keyboardVisibleAtom,
} from "@/atoms/atomStore";
import { cn } from "@/lib/utils/general";

export const Face = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);
  const activeInput = useAtomValue(activeInputElementAtom);
  const keyboardActive = isMobile && keyboardVisible;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!keyboardActive || !activeInput) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const inputRect = activeInput.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const isAbove = inputRect.top < containerRect.top;
    const isBelow = inputRect.bottom > containerRect.bottom;

    if (isAbove || isBelow) {
      const scrollDelta =
        inputRect.top - containerRect.top - containerRect.height * 0.25;

      container.scrollBy({ top: scrollDelta, behavior: "smooth" });
    }
  }, [keyboardActive, activeInput]);

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
        ref={containerRef}
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
