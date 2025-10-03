import React from "react";
import { ConstructionIcon } from "lucide-react";

export const Maintenance = () => {
  return (
    <div
      className={`gap-2 flex flex-col items-center justify-center p-8 z-100 border rounded-full`}
    >
      <ConstructionIcon className="w-4 h-4 color-muted-foreground" />
      Down for maintenance, will be back shortly!
    </div>
  );
};
