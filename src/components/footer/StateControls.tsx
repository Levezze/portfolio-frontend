import React from "react";
import { TooltipButton } from "../shared/TooltipButton";
import { WallpaperIcon, SunIcon, MoonIcon } from "lucide-react";
import { useAtom } from "jotai";
import { lightThemeAtom, bgMotionAtom } from "@/atoms/atomStore";
import { ButtonFrame } from "../shared/ButtonFrame";

interface StateControlsProps {
  variant?: "default" | "inverse";
}

export const StateControls = ({ variant = "default" }: StateControlsProps) => {
  const [theme, setTheme] = useAtom(lightThemeAtom);
  const [bgMotion, setBgMotion] = useAtom(bgMotionAtom);

  const isMobile = variant === "inverse";
  const iconColorClass = isMobile
    ? "text-foreground"
    : "text-white dark:text-muted";

  return isMobile ? (
    <div className="flex gap-4 justify-center">
      <ButtonFrame variant={variant}>
        <TooltipButton
          tooltip={true}
          inputIcon={
            <div className={iconColorClass}>
              {theme ? (
                <SunIcon style={{ width: "18px", height: "18px" }} />
              ) : (
                <MoonIcon style={{ width: "18px", height: "18px" }} />
              )}
            </div>
          }
          tooltipText={theme ? "Dark Theme" : "Light Theme"}
          handleClick={() => setTheme(!theme)}
          state={theme}
          round={true}
          size={10}
        />
      </ButtonFrame>
      <ButtonFrame variant={variant}>
        <TooltipButton
          tooltip={true}
          inputIcon={
            <div className={iconColorClass}>
              <WallpaperIcon style={{ width: "18px", height: "18px" }} />
            </div>
          }
          tooltipText={
            bgMotion
              ? "Stop Background Animation"
              : "Resume Background Animation"
          }
          handleClick={() => setBgMotion(!bgMotion)}
          state={bgMotion}
          round={true}
          size={10}
        />
      </ButtonFrame>
    </div>
  ) : (
    <ButtonFrame variant={variant}>
      <TooltipButton
        tooltip={true}
        inputIcon={
          <div className={iconColorClass}>
            {theme ? (
              <SunIcon style={{ width: "18px", height: "18px" }} />
            ) : (
              <MoonIcon style={{ width: "18px", height: "18px" }} />
            )}
          </div>
        }
        tooltipText={theme ? "Dark Theme" : "Light Theme"}
        handleClick={() => setTheme(!theme)}
        state={theme}
        round={true}
        size={10}
      />
      <TooltipButton
        tooltip={true}
        inputIcon={
          <div className={iconColorClass}>
            <WallpaperIcon style={{ width: "18px", height: "18px" }} />
          </div>
        }
        tooltipText={
          bgMotion ? "Stop Background Animation" : "Resume Background Animation"
        }
        handleClick={() => setBgMotion(!bgMotion)}
        state={bgMotion}
        round={true}
        size={10}
      />
    </ButtonFrame>
  );
};
