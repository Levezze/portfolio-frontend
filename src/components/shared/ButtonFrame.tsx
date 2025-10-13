import type { ButtonFrameProps } from "@/types/buttonTypes";

export const ButtonFrame = ({
  children,
  variant = "default",
  classNameAdditional = "",
  orientation = "horizontal",
  border = true,
}: ButtonFrameProps) => {
  const borderColorClass =
    variant === "inverse" ? "bg-foreground/80" : "bg-background/80";

  return (
    <div
      className={`flex justify-around z-100 p-0.5 w-fit [@media(max-height:600px)]:py-0 ${
        border ? "border" : ""
      } ${borderColorClass} ${classNameAdditional} ${
        orientation === "horizontal"
          ? "flex-row rounded-full"
          : "flex-col w-full rounded-[25px]"
      }`}
    >
      {children}
    </div>
  );
};
