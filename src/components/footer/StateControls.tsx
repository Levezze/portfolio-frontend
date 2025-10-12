import { useAtom } from "jotai";
import { MoonIcon, SunIcon } from "lucide-react";
import { lightThemeAtom } from "@/atoms/atomStore";
import { ButtonFrame } from "@/components/shared/ButtonFrame";
import { TooltipButton } from "@/components/shared/TooltipButton";

interface StateControlsProps {
  variant?: "default" | "inverse";
  orientation?: "horizontal" | "vertical";
  isMobile?: boolean;
}

export const StateControls = ({
  variant = "default",
  isMobile = false,
  orientation = "horizontal",
}: StateControlsProps) => {
  const [theme, setTheme] = useAtom(lightThemeAtom);

  const iconColorClass = isMobile
    ? "text-foreground"
    : "text-secondary-foreground";

  const style = { width: "16px", height: "16px" };

  return isMobile ? (
    <div className="flex gap-4 justify-center">
      <ButtonFrame
        variant={variant}
        orientation={orientation}
        border={isMobile ? true : false}
      >
        <TooltipButton
          tooltip={!isMobile}
          inputIcon={
            <div
              className={"flex items-center justify-center" + iconColorClass}
            >
              {theme ? <SunIcon style={style} /> : <MoonIcon style={style} />}
            </div>
          }
          inputText={
            isMobile ? (theme ? "Dark Theme" : "Light Theme") : undefined
          }
          tooltipText={theme ? "Dark Theme" : "Light Theme"}
          handleClick={() => setTheme(!theme)}
          state={true}
          round={!isMobile}
          size={10}
        />
      </ButtonFrame>
    </div>
  ) : (
    <ButtonFrame
      variant={variant}
      orientation={orientation}
      border={isMobile ? true : false}
    >
      <TooltipButton
        tooltip={!isMobile}
        inputIcon={
          <div className={"flex items-center justify-center" + iconColorClass}>
            {theme ? <SunIcon style={style} /> : <MoonIcon style={style} />}
          </div>
        }
        inputText={
          isMobile ? (theme ? "Dark Theme" : "Light Theme") : undefined
        }
        tooltipText={theme ? "Dark Theme" : "Light Theme"}
        handleClick={() => setTheme(!theme)}
        state={true}
        round={!isMobile}
        size={10}
      />
    </ButtonFrame>
  );
};
