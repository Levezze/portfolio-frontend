import { ZodError } from "zod";
import { apiClient } from "../core/client";
import {
  ProjectGalleryArraySchema,
  ProjectGalleryType,
  ProjectPageSchema,
  ProjectPageType,
} from "../schemas/projects";

export const getProjectsGallery = async () => {
  const response = await apiClient.get("/projects");
  const projectGallery = ProjectGalleryArraySchema.parse(response);
  const transformedProjects = projectGallery.map(transformProjectGallery);
  return { projects: transformedProjects };
};

export const transformProjectGallery = (project: ProjectGalleryType) => {
  const baseProjectGallery = {
    slug: project.slug,
    thumbnailUrl: project.thumbnail_url,
    title: project.title,
    shortDescription: project.short_description,
    displayOrder: project.display_order,
  };

  return baseProjectGallery;
};

export const getProjectPage = async (id: string) => {
  const response = await apiClient.get(`/projects/${id}`);
  const project = ProjectPageSchema.parse(response);
  const transformedProject = transformProjectPage(project);
  return { project: transformedProject };
};

export const transformProjectPage = (project: ProjectPageType) => {
  const baseProjectPage = {
    slug: project.slug,
    title: project.title,
    description: project.description,
    category: project.category,
    techStack: project.tech_stack,
    demoUrl: project.demo_url,
    githubUrl: project.github_url,
    featured: project.featured,
    displayOrder: project.display_order,
    active: project.active,
    media: project.media,
  };

  return baseProjectPage;
};
