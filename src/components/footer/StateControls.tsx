import React from "react";
import { TooltipButton } from "@/components/shared/TooltipButton";
import { WallpaperIcon, SunIcon, MoonIcon } from "lucide-react";
import { useAtom } from "jotai";
import { lightThemeAtom, bgMotionAtom } from "@/atoms/atomStore";
import { ButtonFrame } from "@/components/shared/ButtonFrame";

interface StateControlsProps {
  variant?: "default" | "inverse";
  orientation?: "horizontal" | "vertical";
}

export const StateControls = ({
  variant = "default",
  orientation = "horizontal",
}: StateControlsProps) => {
  const [theme, setTheme] = useAtom(lightThemeAtom);
  const [bgMotion, setBgMotion] = useAtom(bgMotionAtom);

  const isMobile = variant === "inverse";
  const iconColorClass = isMobile
    ? "text-foreground"
    : "text-white dark:text-muted";

  return isMobile ? (
    <div className="flex gap-4 justify-center">
      <ButtonFrame variant={variant} orientation={orientation}>
        <TooltipButton
          tooltip={!isMobile}
          inputIcon={
            <div className={iconColorClass}>
              {theme ? (
                <SunIcon style={{ width: "18px", height: "18px" }} />
              ) : (
                <MoonIcon style={{ width: "18px", height: "18px" }} />
              )}
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
      <ButtonFrame variant={variant} orientation={orientation}>
        <TooltipButton
          tooltip={!isMobile}
          inputIcon={
            <div className={iconColorClass}>
              <WallpaperIcon style={{ width: "18px", height: "18px" }} />
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
    <ButtonFrame variant={variant} orientation={orientation}>
      <TooltipButton
        tooltip={!isMobile}
        inputIcon={
          <div className={iconColorClass}>
            {theme ? (
              <SunIcon style={{ width: "18px", height: "18px" }} />
            ) : (
              <MoonIcon style={{ width: "18px", height: "18px" }} />
            )}
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
            <WallpaperIcon style={{ width: "18px", height: "18px" }} />
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
