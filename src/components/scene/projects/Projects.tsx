// import { Maintenance } from "@/components/shared/Maintenance";
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
  if (error) return <div>Failed to load projects</div>;

  const projectsArray = data?.projects || [];
  const projectPairs: ProjectGalleryArrayType[] = [];
  if (projectsArray) {
    for (let i = 0; i < projectsArray.length; i += 2) {
      projectPairs.push(projectsArray.slice(i, i + 2));
    }
  }

  return (
    // <Maintenance />
    <div className="w-full h-full grid grid-rows-2 grid-flow-col auto-cols-[50%] gap-4 overflow-x-auto overflow-y-hidden">
      {projectPairs.map((pair, index) => (
        <div key={index} className="w-auto h-auto border-2 border-red-500">
          <h1 className="text-2xl font-bold">Projects</h1>
        </div>
      ))}
      <div className="w-auto h-auto border-2 border-red-500">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      <div className="w-auto h-auto border-2 border-red-500">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      <div className="w-auto h-auto border-2 border-red-500">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      {/* <div className="w-auto h-auto border-2 border-red-500">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      <div className="w-auto h-auto border-2 border-red-500">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      <div className="w-auto h-auto border-2 border-red-500">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div> */}
    </div>
  );
};

export default Projects;
