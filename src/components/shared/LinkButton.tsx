import { TooltipButton } from "@/components/shared/TooltipButton";
import { Icon, IconName } from "@/components/shared/Icon";
import React from "react";

interface LinkButtonProps {
  className: string;
  icon: IconName;
  linkUrl: string;
  tooltipText: string;
  buttonSize?: number;
}

export const LinkButton = ({
  className,
  icon,
  linkUrl,
  tooltipText,
  buttonSize = 6,
}: LinkButtonProps) => {
  return (
    <TooltipButton
      tooltip={true}
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
