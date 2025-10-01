import React from "react";
import { ButtonFrameProps } from "@/types/buttonTypes";

export const ButtonFrame = ({
  children,
  variant = "default",
  classNameAdditional = "",
  orientation = "horizontal",
}: ButtonFrameProps) => {
  const borderColorClass =
    variant === "inverse"
      ? "border-foreground/20"
      : "border-white dark:border-muted";

  return (
    <div
      className={`gap-2 flex justify-around z-100 p-1 w-fit [@media(max-height:600px)]:p-0 border ${borderColorClass} ${classNameAdditional} ${
        orientation === "horizontal"
          ? "flex-row rounded-full"
          : "flex-col w-full rounded-[25px]"
      }`}
    >
      {children}
    </div>
  );
};
