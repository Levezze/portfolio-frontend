import { ZodError } from "zod";
import { apiClient } from "../core/client";
import {
  ProjectGalleryArraySchema,
  ProjectGalleryType,
  ProjectPageSchema,
  ProjectPageType,
} from "../schemas/projects";

export const getProjectsGallery = async () => {
  try {
    const response = await apiClient.get("/projects");
    const projectGallery = ProjectGalleryArraySchema.parse(response);
    return {
      projects: projectGallery,
    };
  } catch (e) {
    if (e instanceof ZodError) {
      console.error("Invalid API response", e.issues);
    } else {
      console.error("Failed to load projects", e);
    }
    return {
      projects: [],
    };
  }
};

export const transformProjectGallery = async (project: ProjectGalleryType) => {
  const baseProjectGallery = {
    thumbnailKey: project.thumbnail_key,
    title: project.title,
    shortDescription: project.short_description,
    displayOrder: project.display_order,
  };

  return baseProjectGallery;
};

export const getProjectPage = async (id: string) => {
  try {
    const response = await apiClient.get(`/projects/${id}`);
    const project = ProjectPageSchema.parse(response);
    return {
      project: project,
    };
  } catch (e) {
    if (e instanceof ZodError) {
      console.error("Invalid API response", e.issues);
    } else {
      console.error("Failed to load project", e);
    }
    return {
      project: null,
    };
  }
};

export const transformProjectPage = async (project: ProjectPageType) => {
  const baseProjectPage = {
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
