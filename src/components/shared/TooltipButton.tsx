import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/shared/ui/tooltip";
import { Button } from "@/components/shared/ui/button";

interface TooltipButtonProps {
  tooltip: boolean;
  disabled?: boolean;
  inputIcon?: any;
  inputText?: string;
  tooltipText?: string;
  width?: number;
  height?: number;
  size?: number;
  round?: boolean;
  handleClick?: () => void;
  state?: boolean;
}

export const TooltipButton = ({
  tooltip = true,
  disabled = false,
  inputIcon,
  inputText,
  tooltipText = "",
  width,
  height,
  size = 10,
  round = false,
  handleClick,
  state,
}: TooltipButtonProps) => {
  const style = {
    width: inputText ? "auto" : `${width || size / 4}rem`,
    height: `${height || size / 4}rem`,
    borderRadius: `${round ? "50%" : "25px"}`,
    cursor: "pointer",
    padding: "0",
    margin: "0",
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={state ? "footer" : "outline_pressed"}
          className="tooltip-button"
          style={style}
          onClick={handleClick}
          disabled={disabled}
        >
          <div className="flex flex-row gap-2">
            {inputIcon ? inputIcon : <></>}
            {inputText ? (
              <span className="text-sm my-auto !text-foreground dark:text-muted pl-2">
                {inputText}
              </span>
            ) : (
              <></>
            )}
          </div>
        </Button>
      </TooltipTrigger>
      {tooltip ? (
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      ) : (
        <></>
      )}
    </Tooltip>
  );
};
