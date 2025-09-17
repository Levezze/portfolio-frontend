import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle"

export const TooltipButton = ({inputIcon, tooltipText}:
    {inputIcon: any, tooltipText: string}) => {
  return (
    <Tooltip>
        <TooltipTrigger asChild>
            <Toggle variant="outline">
                {inputIcon}
            </Toggle>
        </TooltipTrigger>
        <TooltipContent>
            <p>{tooltipText}</p>
        </TooltipContent>
    </Tooltip>
  )
}

