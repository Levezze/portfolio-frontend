import * as z from "zod";
import { resumeDownloadSchema } from "./resume";

export const toolCallBaseSchema = z.object({
  type: z.literal("tool_call"),
  tool_name: z.enum(["navigate_page", "trigger_download", "contact_form"]),
  tool_id: z.string(),
  message_id: z.string(),
});

const pagesEnum = z.enum([
  "chat",
  "blog",
  "projects",
  "contact",
  "resume",
  "secret",
]);

export const navigateParamsSchema = toolCallBaseSchema.extend({
  parameters: z.object({
    page: pagesEnum,
    reason: z.string(),
  }),
});

const fileTypeEnum = ["resume"] as const;

export const downloadParamsSchema = toolCallBaseSchema.extend({
  parameters: z.object({
    file_type: z.enum(fileTypeEnum),
    message: z.string(),
  }),
});

export const contactParamsSchema = toolCallBaseSchema.extend({
  parameters: z.object({
    message: z.string(),
    prefill: z
      .object({
        subject: z.string().optional(),
      })
      .optional(),
  }),
});

export type PagesType = z.infer<typeof pagesEnum>;
export type FileType = z.infer<typeof fileTypeEnum>;

export type BaseToolParams = z.infer<typeof toolCallBaseSchema>;
export type NavigateParams = z.infer<typeof navigateParamsSchema>;
export type DownloadParams = z.infer<typeof downloadParamsSchema>;
export type ContactParams = z.infer<typeof contactParamsSchema>;
