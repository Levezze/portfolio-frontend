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
  if (error) console.log(error); // return <FailedLoad />;

  const projectsArray = data?.projects || [];
  const projectPairs: ProjectGalleryArrayType[] = [];
  if (projectsArray) {
    for (let i = 0; i < projectsArray.length; i += 2) {
      projectPairs.push(projectsArray.slice(i, i + 2));
    }
  }

  const MOCK: ProjectGalleryArrayType[] = [
    [
      {
        thumbnail_key: "/portfolio-logo.png",
        title: "title_1",
        short_description: "short_description_1",
        display_order: 1,
      },
      {
        thumbnail_key: "/portfolio-logo.png",
        title: "title_2",
        short_description: "short_description_2",
        display_order: 2,
      },
    ],
    [
      {
        thumbnail_key: "/portfolio-logo.png",
        title: "title_3",
        short_description: "short_description_3",
        display_order: 3,
      },
    ],
  ];
  return (
    // <Maintenance />
    <div className="w-full h-full flex flex-row gap-4 overflow-x-hidden overflow-y-hidden">
      {MOCK.map((pair, index) => (
        <div key={index} className="flex-1 min-w-0 grid grid-rows-2 gap-4">
          {pair.map((project, index) => (
            <button
              key={index}
              className="aspect-square w-full relative cursor-pointer rounded-[25px] group overflow-hidden"
            >
              <Image
                src={project.thumbnail_key}
                alt={project.title}
                fill
                className="object-cover rounded-[25px] group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-[25px] bg-black/0 group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
              <div className="absolute inset-0 rounded-[25px] shadow-[inset_0px_-10px_10px_-10px_rgba(0,0,0,0.05)] pointer-events-none" />
              <div className="relative w-full h-full z-10 flex flex-col items-center justify-end p-4">
                <div className="bg-background/30 px-4 py-2 rounded-[25px] w-full break-words">
                  <h1 className="text-xl font-bold text-center">
                    {project.title}
                  </h1>
                  <h2 className="text-sm font-bold">
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
