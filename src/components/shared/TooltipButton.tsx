import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";

export const TooltipButton = ({
    tooltip = true,
    inputIcon, 
    tooltipText = '',
    size = 10,
    round = false,
    handleClick,
    state,
} : {
    tooltip: boolean,
    inputIcon?: any, 
    tooltipText?: string,
    size?: number,
    round?: boolean,
    handleClick?: () => void,
    state?: boolean,
}) => {
    const style = { 
        width: `${size/4}rem`, 
        height: `${size/4}rem`, 
        "border-radius": `${round ? "50%" : ""}`,
    };
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant={state ? "outline" : "outline_pressed"}
                    className="tooltip-button" 
                    style={style} 
                    onClick={handleClick}>
                    {inputIcon}
                </Button>
            </TooltipTrigger>
            {tooltip ? (
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            ) : <></>}
        </Tooltip>
    )
}
