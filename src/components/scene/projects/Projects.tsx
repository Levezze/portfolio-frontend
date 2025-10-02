// import { Maintenance } from "@/components/shared/Maintenance";
import { FailedLoad } from "@/components/shared/FailedLoad";
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
  if (error) return <FailedLoad />;

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
        thumbnail_key: "1",
        title: "title_1",
        short_description: "short_description_1",
        display_order: 1,
      },
      {
        thumbnail_key: "2",
        title: "title_2",
        short_description: "short_description_2",
        display_order: 2,
      },
    ],
    [
      {
        thumbnail_key: "3",
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
        <div
          key={index}
          className="w-auto h-auto grid grid-rows-2 gap-4 border-2 border-blue-500"
        >
          {pair.map((project, index) => (
            <div key={index} className="aspect-square border-2 border-red-500">
              <h1 className="text-2xl font-bold">{project.title}</h1>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Projects;
