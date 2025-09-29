import React from 'react';
import { TooltipButton } from "../shared/TooltipButton";
import { Box, WallpaperIcon, SunIcon, MoonIcon, MessageSquareTextIcon } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { 
    lightThemeAtom, 
    bgMotionAtom, 
    activeFaceAtom, 
    cubeMotionAtom, 
    cubeColorAtom 
} from "@/atoms/atomStore";
import { FooterFrame } from "../shared/FooterFrame";

export const StateControls = () => {
    const backgroundColor = useAtomValue(cubeColorAtom);
    const [theme, setTheme] = useAtom(lightThemeAtom);
    const [bgMotion, setBgMotion] = useAtom(bgMotionAtom);
    const [activePage, setActiveFace] = useAtom(activeFaceAtom);
    const [cubeMotion, setCubeMotion] = useAtom(cubeMotionAtom);

    return (
        <FooterFrame>
            <TooltipButton
                tooltip={true}
                inputIcon={
                    theme ? <SunIcon 
                        color={backgroundColor} 
                        style={{ width: '18px', height: '18px' }} 
                    /> 
                    : <MoonIcon 
                        color={backgroundColor} 
                        style={{ width: '18px', height: '18px' }} 
                    />
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
                    <WallpaperIcon 
                        color={backgroundColor} 
                        style={{ width: '18px', height: '18px' }} 
                    />
                }
                tooltipText={bgMotion ? "Stop Background Animation" : "Resume Background Animation"}
                handleClick={() => setBgMotion(!bgMotion)}
                state={bgMotion}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={true}
                inputIcon={<Box 
                    color={backgroundColor} 
                    style={{ width: '18px', height: '18px' }} 
                />}
                tooltipText={cubeMotion ? "Stop Cube Sway" : "Resume Cube Sway"}
                handleClick={() => setCubeMotion(!cubeMotion)}
                state={cubeMotion}
                round={true}
                size={10}
            />
        </FooterFrame>
  )
}

