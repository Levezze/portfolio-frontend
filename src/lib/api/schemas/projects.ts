import * as z from "zod";

export const ProjectMediaSchema = z.object({
  id: z.string(),
  media_type: z.enum(["image", "video"]),
  filename: z.string(),
  file_size: z.number().int().optional(),
  mime_type: z.string().optional(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  display_order: z.number().int(),
  is_featured: z.boolean(),
  file_url: z.string(),
  created_at: z.string(),
});

const ProjectCategoryEnum = z.enum([
  "web",
  "mobile",
  "desktop",
  "ai_ml",
  "backend",
  "devops",
  "other",
]);

export const ProjectPublicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  thumbnail_url: z.string(),
  media: z.array(ProjectMediaSchema),
  created_at: z.string(),
  title: z.string(),
  short_description: z.string(),
  description: z.string(),
  category: ProjectCategoryEnum.optional(),
  tech_stack: z.array(z.string()),
  demo_url: z.string().optional(),
  github_url: z.string().optional(),
  featured: z.boolean(),
  display_order: z.number().int(),
  active: z.boolean(),
});

export const ProjectGallerySchema = z.object({
  slug: z.string(),
  thumbnail_url: z.string(),
  title: z.string(),
  short_description: z.string(),
  display_order: z.number().int(),
});

export const ProjectPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: ProjectCategoryEnum.optional(),
  tech_stack: z.array(z.string()),
  demo_url: z.string().optional(),
  github_url: z.string().optional(),
  featured: z.boolean(),
  display_order: z.number().int(),
  active: z.boolean(),
  media: z.array(ProjectMediaSchema),
});

export const ProjectGalleryArraySchema = z.array(ProjectGallerySchema);

export type ProjectCategoryType = z.infer<typeof ProjectCategoryEnum>;

export type ProjectMediaType = z.infer<typeof ProjectMediaSchema>;
export type ProjectType = z.infer<typeof ProjectPublicSchema>;
export type ProjectGalleryType = z.infer<typeof ProjectGallerySchema>;
export type ProjectGalleryArrayType = z.infer<typeof ProjectGalleryArraySchema>;
export type ProjectPageType = z.infer<typeof ProjectPageSchema>;
