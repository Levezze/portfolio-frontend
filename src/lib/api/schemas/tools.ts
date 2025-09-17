import * as z from "zod";

const ToolResult = z.object({
    type: z.literal('tool_call'),
    tool: z.enum(['navigate_page','trigger_download', 'contact_form']),
    tool_id: z.string(),
    tool_name: z.string(),
    arguments: z.any(),
    parameters: z.object({
        page: z.enum(['chat', 'resume', 'contact', 'projects', 'about', 'secret']).optional(),
        reason: z.string().optional(),
        file_type: z.string().optional(),
        message: z.string().optional(),
        prefill: z.object({
            subject: z.string().optional()
        }).optional(),
    })
})