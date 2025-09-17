import { TooltipButton } from "../TooltipButton";
import { Box, WallpaperIcon } from "lucide-react";
import React from 'react';

export const Footer = () => {
  return (
    <div className="footer gap-4 fixed bottom-5 flex flex-row justify-around z-100">
        <TooltipButton 
            inputIcon={<WallpaperIcon className="w-10 h-10" color="white" />}
            tooltipText="Stop Background Animation"
        />
        <TooltipButton 
            inputIcon={<Box className="w-10 h-10" color="white" />}
            tooltipText="Stop Cube Animation"
        />
    </div>
  )
}
