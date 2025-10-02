import { IconName } from "@/components/shared/Icon";

export interface ButtonFrameProps {
  children: React.ReactNode;
  variant?: "default" | "inverse";
  classNameAdditional?: string;
  orientation?: "horizontal" | "vertical";
}

export interface LinkButtonProps {
  className: string;
  icon: IconName;
  linkUrl: string;
  tooltipText: string;
  buttonSize?: number;
}
