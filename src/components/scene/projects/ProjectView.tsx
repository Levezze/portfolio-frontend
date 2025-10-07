import React from "react";
import useSWR from "swr";
import { Loading } from "@/components/shared/alerts/Loading";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { getProjectPage } from "@/lib/api/services/projectsService";
import { Separator } from "@/components/shared/ui/separator";
import { LazyMotion, domAnimation } from "motion/react";
import { LinkifyText } from "@/components/shared/LinkifyText";
import { MediaGallery } from "./MediaGallery";

import * as m from "motion/react-m";
import { Badge } from "@/components/shared/ui/badge";

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

  const techStack = projectData?.techStack;

  return (
    <div
      className={`w-full relative items-center justify-center overflow-hidden`}
    >
      <LazyMotion features={domAnimation}>
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
            <div className="relative h-full overflow-y-auto pb-4 md:pb-0">
              <MediaGallery items={mediaItems || []} />
              <div className="w-full flex flex-row items-center justify-center">
                {techStack && techStack.length > 0 && (
                  <div className="flex flex-row items-center justify-center gap-2 md:gap-4 flex-wrap">
                    {techStack.map((item: any) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="text-sm hover:bg-muted-foreground/50 cursor-default transition-colors transition-duration-300"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {<Separator className="w-full my-4" />}
              <p className="text-regular font-inter whitespace-pre-wrap text-left w-full">
                {linkifiedDescription}
              </p>
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </div>
  );
};
