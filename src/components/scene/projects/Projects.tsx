import React from "react";
import useSWR from "swr";
import { getProjectsGallery } from "@/lib/api/services/projectsService";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { Loading } from "@/components/shared/alerts/Loading";
import Image from "next/image";
import { useSetAtom } from "jotai";
import { projectViewAtom } from "@/atoms/atomStore";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { ProjectView } from "./ProjectView";

const Projects = () => {
  const setProjectView = useSetAtom(projectViewAtom);

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

  const borderRadius = [
    "md:rounded-br-[25px]",
    "md:rounded-bl-[25px]",
    "md:rounded-tr-[25px]",
    "md:rounded-tl-[25px]",
  ];

  return (
    <div
      className="
      w-full h-full p-0 grid gap-4
      overflow-x-hidden overflow-y-hidden
      grid-rows-3 grid-cols-1 grow-1
      md:p-4 md:grid-rows-2 md:grid-cols-2 md:gap-8"
    >
      {projectsArray.map((project, index) => (
        <Dialog>
          <DialogTrigger>
            <button
              key={index}
              className={`md:aspect-square mobile-landscape:aspect-auto w-full h-full relative cursor-pointer group overflow-hidden md:rounded-none ${borderRadius[index]}`}
              onClick={() => setProjectView(project.slug)}
            >
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                className={`object-cover group-hover:scale-105 rounded-[25px] transition-transform duration-300 md:rounded-none ${borderRadius[index]}`}
              />
              <div
                className={`absolute inset-0 rounded-[25px] bg-black/0 group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors duration-300 pointer-events-none md:rounded-none ${borderRadius[index]}`}
              />
              <div className="absolute inset-0 rounded-[25px] shadow-[inset_0px_-10px_10px_-10px_rgba(0,0,0,0.05)] pointer-events-none" />
              <div className="relative w-fit h-full z-10 flex flex-col items-start justify-between p-2 md:p-4">
                <div className="bg-background/80 px-4 py-2 rounded-[25px] break-words shadow-sm shadow-muted-foreground/5">
                  <h1 className="font-merriweather font-medium text-xs lg:text-sm">
                    {project.title}
                  </h1>
                </div>
                <div className="bg-background/80 px-4 py-2 rounded-[25px] break-words group-hover:opacity-100 opacity-0 transition-all duration-300 shadow-sm shadow-muted-foreground/5">
                  <h2 className="font-regular font-inter text-center text-xs lg:text-sm">
                    {project.shortDescription}
                  </h2>
                </div>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent>
            <ProjectView projectTitle={project.slug} />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default Projects;
