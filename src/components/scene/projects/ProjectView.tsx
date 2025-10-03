import React from "react";
import { useSetAtom } from "jotai";
import { projectViewAtom } from "@/atoms/atomStore";
import { Maintenance } from "@/components/shared/Maintenance";
import { BackButton } from "@/components/shared/BackButton";

export const ProjectView = ({ projectTitle }: { projectTitle: string }) => {
  const setProjectView = useSetAtom(projectViewAtom);

  const handleBack = () => {
    setProjectView("gallery");
  };

  return (
    <div className="w-full h-full p-2 relative flex flex-col items-center justify-center">
      <BackButton
        onClick={handleBack}
        tooltip="Back to gallery"
        className="!top-2 !left-2 my-auto mx-auto"
      />
      <Maintenance />
    </div>
  );
};
