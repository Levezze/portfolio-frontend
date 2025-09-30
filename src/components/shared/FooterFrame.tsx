import React from "react";

interface FooterFrameProps {
  children: React.ReactNode;
  variant?: "default" | "mobile";
}

export const FooterFrame = ({
  children,
  variant = "default",
}: FooterFrameProps) => {
  // Border color based on variant
  const borderColorClass =
    variant === "mobile"
      ? "border-foreground/20"
      : "border-white dark:border-muted";

  return (
    <div
      className={`gap-2 flex flex-row justify-around z-100 p-1 [@media(max-height:600px)]:p-0 border ${borderColorClass} rounded-full`}
    >
      {children}
    </div>
  );
};
