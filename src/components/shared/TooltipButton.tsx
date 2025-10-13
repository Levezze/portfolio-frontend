import { Button } from "@/components/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";

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
    width: inputText ? "100%" : `${width || size / 4}rem`,
    height: `${height || size / 4}rem`,
    borderRadius: `${round ? "50%" : "25px"}`,
    cursor: "pointer",
    padding: "1",
    margin: "1",
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
          <div
            className={`flex flex-row gap-2 ${
              inputText ? "w-full pl-4 justify-start items-center" : ""
            }`}
          >
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
