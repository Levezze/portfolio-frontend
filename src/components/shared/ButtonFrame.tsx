import React from "react";

interface ButtonFrameProps {
  children: React.ReactNode;
  variant?: "default" | "inverse";
  classNameAdditional?: string;
}

export const ButtonFrame = ({
  children,
  variant = "default",
  classNameAdditional = "",
}: ButtonFrameProps) => {
  const borderColorClass =
    variant === "inverse"
      ? "border-foreground/20"
      : "border-white dark:border-muted";

  return (
    <div
      className={`gap-2 flex flex-row justify-around z-100 p-1 w-fit [@media(max-height:600px)]:p-0 border ${borderColorClass} rounded-full ${classNameAdditional}`}
    >
      {children}
    </div>
  );
};
