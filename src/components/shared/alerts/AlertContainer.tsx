import { cn } from "@/lib/utils/general";
import type React from "react";

export const AlertContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full flex items-center justify-center",
        className
      )}
    >
      <div
        className={
          "gap-2 flex flex-col w-50 h-30 items-center justify-center p-4 z-10 border rounded-[25px] text-sm text-center"
        }
      >
        {children}
      </div>
    </div>
  );
};
