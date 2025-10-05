"use client";

import { ArrowLeftIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils/general";

export interface BackButtonProps {
  onClick: () => void;
  tooltip?: string;
  className?: string;
}

export const BackButton = ({
  onClick,
  tooltip = "Go back",
  className,
}: BackButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={onClick}
          className={cn(
            "absolute size-[34px] rounded-full p-1 cursor-pointer z-500",
            className
          )}
          aria-label={tooltip}
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
};
