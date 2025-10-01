import { TooltipButton } from "@/components/shared/TooltipButton";
import { Icon } from "@/components/shared/Icon";
import { useIsMobile } from "@/hooks/useIsMobile";
import React from "react";
import { LinkButtonProps } from "@/types/buttonTypes";

export const LinkButton = ({
  className,
  icon,
  linkUrl,
  tooltipText,
  buttonSize = 6,
}: LinkButtonProps) => {
  const isMobile = useIsMobile();
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
