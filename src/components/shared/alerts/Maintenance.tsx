import React from "react";
import { ConstructionIcon } from "lucide-react";
import { AlertContainer } from "@/components/shared/alerts/AlertContainer";

export const Maintenance = () => {
  return (
    <AlertContainer>
      <ConstructionIcon className="w-4 h-4" />
      Down for maintenance, will be back shortly!
    </AlertContainer>
  );
};
