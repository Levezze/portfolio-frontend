import { TooltipButton } from "./shared/TooltipButton";
import { Box, WallpaperIcon, SunIcon, MoonIcon, MessageSquareCodeIcon } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { 
    lightThemeAtom, 
    bgMotionAtom, 
    activeFaceAtom, 
    cubeMotionAtom, 
    cubeColorAtom 
} from "@/atoms/atomStore";
import React, { useEffect } from 'react';

export const Footer = () => {
    const backgroundColor = useAtomValue(cubeColorAtom);
    const [theme, setTheme] = useAtom(lightThemeAtom);
    const [bgMotion, setBgMotion] = useAtom(bgMotionAtom);
    const [activePage, setActiveFace] = useAtom(activeFaceAtom);
    const [cubeMotion, setCubeMotion] = useAtom(cubeMotionAtom);

    useEffect(() => {
        console.log('States:', { theme, bgMotion, cubeMotion });
    }, [theme, bgMotion, cubeMotion])

    return (
        <div className="footer gap-6 fixed bottom-5 flex flex-row justify-around z-100">
            <TooltipButton
                tooltip={true}
                inputIcon={theme ? <SunIcon color={backgroundColor} /> : <MoonIcon color={backgroundColor} />}
                tooltipText={theme ? "Dark Theme" : "Light Theme"}
                handleClick={() => setTheme(!theme)}
                state={theme}
                round={true}
            />
            <TooltipButton
                tooltip={true}
                inputIcon={<WallpaperIcon color={backgroundColor} />}
                tooltipText={bgMotion ? "Stop Background Animation" : "Resume Background Animation"}
                handleClick={() => setBgMotion(!bgMotion)}
                state={bgMotion}
                round={true}
            />
            <TooltipButton
                tooltip={true}
                inputIcon={<Box className="w-10 h-10" color={backgroundColor} />}
                tooltipText={cubeMotion ? "Stop Cube Sway" : "Resume Cube Sway"}
                handleClick={() => setCubeMotion(!cubeMotion)}
                state={cubeMotion}
                round={true}
            />
            <TooltipButton
                tooltip={activePage === 'chat' ? false : true}
                disabled={activePage === 'chat'}
                inputIcon={<MessageSquareCodeIcon className="w-10 h-10" color={backgroundColor} />}
                tooltipText={activePage !== 'chat' ? "Open Chat" : ''}
                handleClick={() => setActiveFace('chat')}
                state={activePage === 'chat'}
                round={true}
            />
        </div>
    )
}
