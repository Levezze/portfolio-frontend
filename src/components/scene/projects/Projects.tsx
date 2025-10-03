// import { Maintenance } from "@/components/shared/Maintenance";
import { FailedLoad } from "@/components/shared/FailedLoad";
import Image from "next/image";
import { ProjectGalleryArrayType } from "@/lib/api/schemas/projects";
import { getProjectsGallery } from "@/lib/api/services/projectsService";
import React from "react";
import useSWR from "swr";

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

  if (isLoading) return <div>Loading projects...</div>;
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
      grid-rows-3 grid-cols-1
      md:p-4 md:grid-rows-2 md:grid-cols-2 md:gap-8"
    >
      {projectsArray.map((project, index) => (
        <button
          key={index}
          className={`md:aspect-square mobile-landscape:aspect-auto w-full relative cursor-pointer group overflow-hidden md:rounded-none ${borderRadius[index]}`}
        >
          <Image
            src={project.thumbnail_url}
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
                {project.short_description}
              </h2>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default Projects;
