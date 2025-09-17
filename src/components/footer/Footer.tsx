import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle"
import { Box, WallpaperIcon } from "lucide-react";
import React from 'react';

export const Footer = () => {
  return (
    <div className="footer gap-4 fixed bottom-5 z-20 flex flex-row justify-around">
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle variant="outline">
                    <WallpaperIcon className="w-10 h-10" color="white" />
                </Toggle>
            </TooltipTrigger>
            <TooltipContent>
                <p>Stop Background Animation</p>
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle variant="outline">
                    <Box className="w-10 h-10" color="white" />
                </Toggle>
            </TooltipTrigger>
            <TooltipContent>
                <p>Stop Cube Animation</p>
            </TooltipContent>
        </Tooltip>
    </div>
  )
}
