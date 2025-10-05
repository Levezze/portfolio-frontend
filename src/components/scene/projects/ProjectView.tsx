import React from "react";
import useSWR from "swr";
import { useSetAtom } from "jotai";
import { projectViewAtom } from "@/atoms/atomStore";
import { Loading } from "@/components/shared/alerts/Loading";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { getProjectPage } from "@/lib/api/services/projectsService";
import { Separator } from "@/components/ui/separator";
import { LazyMotion, domAnimation } from "motion/react";
import { LinkifyText } from "@/components/shared/LinkifyText";
import { MediaGallery } from "./MediaGallery";

import * as m from "motion/react-m";

export const ProjectView = ({ projectTitle }: { projectTitle: string }) => {
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

  if (isLoading) return <Loading />;
  if (error) return <FailedLoad />;

  const projectData = project?.project;
  const linkifiedDescription = LinkifyText(projectData?.description || "");

  console.log(projectData?.media);
  const mediaItems = projectData?.media.map((item: any) => ({
    original: item.fileUrl,
    thumbnail: item.fileUrl,
    mediaType: item.mediaType,
    mediaWidth: item.mediaWidth,
    mediaHeight: item.mediaHeight,
  }));

  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full p-2 relative items-center justify-center max-h-[90vh]">
        <div className="flex flex-col items-center justify-start h-full px-2 pt-4 md:pt-0 gap-2">
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
            className="font-inter text-regular text-left w-full flex-1 min-h-0"
          >
            <div className="relative h-full overflow-y-auto">
              <MediaGallery items={mediaItems || []} />
              <p className="text-regular font-inter whitespace-pre-wrap text-left w-full">
                {linkifiedDescription}
              </p>
            </div>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
};
