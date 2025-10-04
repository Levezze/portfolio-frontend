import React from "react";
import { FrownIcon } from "lucide-react";
import { AlertContainer } from "@/components/shared/alerts/AlertContainer";

export const FailedLoad = () => {
  return (
    <AlertContainer>
      <FrownIcon className="w-4 h-4" />
      Failed to load, try to refresh the page!
    </AlertContainer>
  );
};
