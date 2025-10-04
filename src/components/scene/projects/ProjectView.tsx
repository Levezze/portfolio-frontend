import React from "react";
import useSWR from "swr";
import { useSetAtom } from "jotai";
import { projectViewAtom } from "@/atoms/atomStore";
import { Loading } from "@/components/shared/alerts/Loading";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { getProjectPage } from "@/lib/api/services/projectsService";
import { Separator } from "@/components/ui/separator";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";

export const ProjectView = ({ projectTitle }: { projectTitle: string }) => {
  const setProjectView = useSetAtom(projectViewAtom);
  const {
    data: project,
    isLoading,
    error,
  } = useSWR(
    "projectPage-" + projectTitle,
    () => getProjectPage(projectTitle),
    {
      revalidateOnFocus: false,
      dedupingInterval: 50000,
      onError: (err) => {
        console.error("Failed to load project page:", err);
      },
    }
  );

  // const handleBack = () => {
  //   setProjectView("gallery");
  // };

  if (isLoading) return <Loading />;
  if (error) return <FailedLoad />;

  const projectData = project?.project;

  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full h-full p-2 relative items-center justify-center">
        {/* <BackButton
          onClick={handleBack}
          tooltip="Back to gallery"
          className="!top-2 !left-2 my-auto mx-auto"
        /> */}
        <div className="flex flex-col items-center justify-start h-full px-2 pt-2 gap-2">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <h1 className="w-full font-regular font-merriweather text-base text-center [@media(min-width:700px)_and_(min-height:700px)]:text-lg [@media(min-width:800px)_and_(min-height:800px)]:text-xl text-muted-foreground/90">
              {projectData?.title}
            </h1>
          </m.div>
          <Separator className="w-full" />
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2 }}
            className="font-inter text-regular text-left w-full overflow-y-auto"
          >
            <p className="text-regular font-inter whitespace-pre-wrap text-left w-full">
              {projectData?.description}
            </p>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
};
