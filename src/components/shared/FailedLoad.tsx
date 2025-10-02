import React from "react";
import { FrownIcon } from "lucide-react";

export const FailedLoad = () => {
  return (
    <div
      className={`gap-2 flex flex-col items-center justify-center p-8 z-100 border rounded-full`}
    >
      <FrownIcon className="w-4 h-4 color-muted-foreground" />
      Failed to load, try to refresh the page!
    </div>
  );
};
