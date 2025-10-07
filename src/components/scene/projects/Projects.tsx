import React, { useState } from "react";
import useSWR from "swr";
import { getProjectsGallery } from "@/lib/api/services/projectsService";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { Loading } from "@/components/shared/alerts/Loading";
import Image from "next/image";
import { useAtom } from "jotai";
import { projectViewAtom } from "@/atoms/atomStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ProjectView } from "./ProjectView";
import { useNavigationStack } from "@/hooks/useNavigationStack";

const ProjectDialog = ({ project, index }: { project: any; index: number }) => {
  const [projectView, setProjectView] = useAtom(projectViewAtom);
  const [isOpen, setIsOpen] = useState(false);
  const { pushBack } = useNavigationStack();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Dialog opened - push callback to close it
      pushBack(() => setIsOpen(false), `Close ${project.title}`);
      setProjectView("project");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          key={index}
          className={`md:aspect-square mobile-landscape:aspect-auto w-full h-full relative cursor-pointer group rounded-[25px] overflow-hidden`}
        >
          <Image
            src={project.thumbnailUrl}
            alt={project.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300`}
          />
          <div
            className={`absolute inset-0 bg-black/0 group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors duration-300 pointer-events-none`}
          />
          <div className="absolute inset-0 shadow-[inset_0px_-10px_10px_-10px_rgba(0,0,0,0.05)] pointer-events-none" />
          <div className="relative w-fit h-full z-10 flex flex-col items-start justify-between p-4 md:p-4">
            <div className="bg-background/80 px-2 py-1 break-words shadow-sm shadow-muted-foreground/5">
              <h1 className="font-merriweather font-medium text-xs lg:text-sm">
                {project.title}
              </h1>
            </div>
            <div className="bg-background/80 px-2 py-1 break-words group-hover:opacity-100 opacity-0 transition-all duration-300 shadow-sm shadow-muted-foreground/5">
              <h2 className="font-regular font-inter text-center text-xs lg:text-sm">
                {project.shortDescription}
              </h2>
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="min-h-0 max-h-[90vh]">
        <VisuallyHidden>
          <DialogTitle>Project Details</DialogTitle>
        </VisuallyHidden>
        <ProjectView projectTitle={project.slug} />
      </DialogContent>
    </Dialog>
  );
};

const Projects = () => {

  const { data, isLoading, error } = useSWR(
    "projectsGallery",
    getProjectsGallery,
    {
      revalidateOnFocus: false,
      dedupingInterval: 50000,
      onError: (err) => {
        console.error("Failed to load projects:", err);
      },
    }
  );

  if (isLoading) return <Loading />;
  if (error) {
    console.error(error);
    return <FailedLoad />;
  }

  const projectsArray = data?.projects || [];

  return (
    <div
      className="
      w-full h-full p-0 grid gap-4
      overflow-x-hidden overflow-y-hidden
      grid-rows-3 grid-cols-1 grow-1
      md:p-4 md:grid-rows-2 md:grid-cols-2 md:gap-4"
    >
      {projectsArray.map((project, index) => (
        <ProjectDialog key={project.slug} project={project} index={index} />
      ))}
    </div>
  );
};

export default Projects;
