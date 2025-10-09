import { useAtom } from "jotai";
import { MoonIcon, SunIcon, WallpaperIcon } from "lucide-react";
import { bgMotionAtom, lightThemeAtom } from "@/atoms/atomStore";
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
  const [bgMotion, setBgMotion] = useAtom(bgMotionAtom);

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
            <div className={iconColorClass}>
              {theme ? <SunIcon style={style} /> : <MoonIcon style={style} />}
            </div>
          }
          inputText={isMobile ? (theme ? "Light" : "Dark") : undefined}
          tooltipText={theme ? "Dark Theme" : "Light Theme"}
          handleClick={() => setTheme(!theme)}
          state={theme}
          round={!isMobile}
          size={10}
        />
      </ButtonFrame>
      <ButtonFrame
        variant={variant}
        orientation={orientation}
        border={isMobile ? true : false}
      >
        <TooltipButton
          tooltip={!isMobile}
          inputIcon={
            <div className={iconColorClass}>
              <WallpaperIcon style={style} />
            </div>
          }
          inputText={isMobile ? "Animation" : undefined}
          tooltipText={
            bgMotion
              ? "Stop Background Animation"
              : "Resume Background Animation"
          }
          handleClick={() => setBgMotion(!bgMotion)}
          state={bgMotion}
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
          <div className={iconColorClass}>
            {theme ? <SunIcon style={style} /> : <MoonIcon style={style} />}
          </div>
        }
        inputText={isMobile ? (theme ? "Light" : "Dark") : undefined}
        tooltipText={theme ? "Dark Theme" : "Light Theme"}
        handleClick={() => setTheme(!theme)}
        state={theme}
        round={!isMobile}
        size={10}
      />
      <TooltipButton
        tooltip={!isMobile}
        inputIcon={
          <div className={iconColorClass}>
            <WallpaperIcon style={style} />
          </div>
        }
        inputText={isMobile ? "Animation" : undefined}
        tooltipText={
          bgMotion ? "Stop Background Animation" : "Resume Background Animation"
        }
        handleClick={() => setBgMotion(!bgMotion)}
        state={bgMotion}
        round={!isMobile}
        size={10}
      />
    </ButtonFrame>
  );
};
