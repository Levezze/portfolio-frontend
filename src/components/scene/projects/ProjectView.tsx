import React from "react";
import useSWR from "swr";
import { useSetAtom } from "jotai";
import { projectViewAtom } from "@/atoms/atomStore";
import { Maintenance } from "@/components/shared/Maintenance";
import { BackButton } from "@/components/shared/BackButton";
import { Loading } from "@/components/shared/Loading";
import { FailedLoad } from "@/components/shared/FailedLoad";

export const ProjectView = ({ projectTitle }: { projectTitle: string }) => {
  const setProjectView = useSetAtom(projectViewAtom);
  const {
    data: project,
    isLoading,
    error,
  } = useSWR(`/api/projects/${projectTitle}`);

  const handleBack = () => {
    setProjectView("gallery");
  };

  if (isLoading) return <Loading />;
  if (error) return <FailedLoad />;

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
