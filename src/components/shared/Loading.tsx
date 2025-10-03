import React from "react";
import { Loader2Icon as LoaderIcon } from "lucide-react";

export const Loading = () => {
  return (
    <div
      className={`gap-2 flex flex-col items-center justify-center p-8 z-100 border rounded-full`}
    >
      <LoaderIcon className="w-6 h-6 animate-spin color-muted-foreground" />
      Page is loading...
    </div>
  );
};
