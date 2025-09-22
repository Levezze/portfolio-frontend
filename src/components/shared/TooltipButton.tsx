import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export const TooltipButton = ({
    tooltip = true,
    inputIcon, 
    inputText,
    tooltipText = '',
    width,
    height,
    size = 10,
    round = false,
    handleClick,
    state,
} : {
    tooltip: boolean,
    inputIcon?: any, 
    inputText?: string,
    tooltipText?: string,
    width?: number,
    height?: number,
    size?: number,
    round?: boolean,
    handleClick?: () => void,
    state?: boolean,
}) => {
    const style = {
        width: `${width || size/4}rem`,
        height: `${height || size/4}rem`,
        borderRadius: `${round ? "50%" : "0 35% 0 35%"}`,
        cursor: "pointer",
    };
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant={state ? "outline" : "outline_pressed"}
                    className="tooltip-button" 
                    style={style} 
                    onClick={handleClick}
                >
                    {inputIcon ? inputIcon : inputText}
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
