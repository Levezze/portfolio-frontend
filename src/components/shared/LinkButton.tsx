import { useAtomValue } from "jotai";
import { isMobileAtom } from "@/atoms/atomStore";
import { Icon } from "@/components/shared/Icon";
import { TooltipButton } from "@/components/shared/TooltipButton";
import type { LinkButtonProps } from "@/types/buttonTypes";

export const LinkButton = ({
  className,
  icon,
  linkUrl,
  tooltipText,
  buttonSize = 6,
}: LinkButtonProps) => {
  const isMobile = useAtomValue(isMobileAtom);

  return (
    <TooltipButton
      tooltip={!isMobile}
      inputIcon={<Icon name={icon} className={className} />}
      tooltipText={tooltipText}
      handleClick={() => {
        window.open(linkUrl, "_blank");
      }}
      state={true}
      round={true}
      size={buttonSize}
    />
  );
};
