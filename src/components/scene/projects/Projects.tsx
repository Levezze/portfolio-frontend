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
  const projectPairs: ProjectGalleryArrayType[] = [];
  if (projectsArray) {
    for (let i = 0; i < projectsArray.length; i += 2) {
      projectPairs.push(projectsArray.slice(i, i + 2));
    }
  }

  return (
    // <Maintenance />
    <div className="w-full h-full p-4 flex flex-row gap-8 overflow-x-hidden overflow-y-hidden">
      {projectPairs.map((pair, index) => (
        <div key={index} className="flex-1 min-w-0 grid grid-rows-2 gap-4">
          {pair.map((project, index) => (
            <button
              key={index}
              className="aspect-square w-full relative cursor-pointer rounded-[25px] group overflow-hidden"
            >
              <Image
                src={project.thumbnail_url}
                alt={project.title}
                fill
                className="object-cover rounded-[25px] group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-[25px] bg-black/0 group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
              <div className="absolute inset-0 rounded-[25px] shadow-[inset_0px_-10px_10px_-10px_rgba(0,0,0,0.05)] pointer-events-none" />
              <div className="relative w-full h-full z-10 flex flex-col items-center justify-between p-4">
                <div className="bg-background/80 px-4 py-2 rounded-[25px] w-full break-words">
                  <h1 className="text-center font-merriweather font-medium text-base">
                    {project.title}
                  </h1>
                </div>
                <div className="bg-background/80 px-4 py-2 rounded-[25px] w-full break-words">
                  <h2 className="text-sm font-regular font-inter text-center">
                    {project.short_description}
                  </h2>
                </div>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Projects;
