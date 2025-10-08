import { FrownIcon } from "lucide-react";
import { AlertContainer } from "@/components/shared/alerts/AlertContainer";
import { cn } from "@/lib/utils/general";

export const FailedLoad = ({ className }: { className?: string } = {}) => {
  return (
    <AlertContainer className={className}>
      <FrownIcon className={cn("w-4 h-4")} />
      Failed to load, try to refresh the page!
    </AlertContainer>
  );
};
