import React from "react";
import { Spinner } from "@/components/ui/spinner";

export const Loading = () => {
  return (
    <div
      className={`gap-2 flex flex-col items-center justify-center p-8 z-100 border rounded-full`}
    >
      <Spinner />
      Page is loading...
    </div>
  );
};
