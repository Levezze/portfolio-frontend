import React from "react";
import { useAtomValue } from "jotai";
import { projectViewAtom } from "@/atoms/atomStore";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectView } from "./ProjectView";

const Projects = () => {
  const projectView = useAtomValue(projectViewAtom);

  return projectView === "gallery" ? (
    <ProjectGallery />
  ) : (
    <ProjectView projectTitle={projectView} />
  );
};

export default Projects;
