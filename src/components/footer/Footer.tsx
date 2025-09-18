import { TooltipButton } from "../TooltipButton";
import { Box, WallpaperIcon, SunIcon, MoonIcon } from "lucide-react";
import { useAtom } from "jotai";
import { lightThemeAtom, bgMotionAtom, cubeMotionAtom } from "@/atoms/atomStore";
import React, { useEffect } from 'react';

export const Footer = () => {
    const [theme, setTheme] = useAtom(lightThemeAtom);
    const [bgMotion, setBgMotion] = useAtom(bgMotionAtom);
    const [cubeMotion, setCubeMotion] = useAtom(cubeMotionAtom);

    useEffect(() => {
        console.log('States:', { theme, bgMotion, cubeMotion });
    }, [theme, bgMotion, cubeMotion])

    return (
        <div className="footer gap-4 fixed bottom-5 flex flex-row justify-around z-100">
            <TooltipButton
                tooltip={true}
                inputIcon={theme ? <SunIcon color="white" /> : <MoonIcon color="white" />}
                tooltipText="Light/Dark Theme"
                handleClick={() => setTheme(!theme)}
                round={true}
            />
            <TooltipButton
                tooltip={true}
                inputIcon={<WallpaperIcon color="white" />}
                tooltipText="Stop Background Animation"
                handleClick={() => setBgMotion(!bgMotion)}
                round={true}
            />
            <TooltipButton
                tooltip={true}
                inputIcon={<Box className="w-10 h-10" color="white" />}
                tooltipText="Stop Cube Animation"
                handleClick={() => setCubeMotion(!cubeMotion)}
                round={true}
            />
        </div>
    )
}
