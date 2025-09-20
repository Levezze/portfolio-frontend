import * as z from 'zod';

export const WelcomeMessageSchema = z.object({
    id: z.string(),
    message_text: z.string(),
    message_type: z.enum(['primary','secondary', 'assistant']),
    display_order: z.number().int(),
    is_active: z.boolean(),
});

export const ChatSuggestionSchema = z.object({
    id: z.string(),
    title: z.string(),
    label: z.string(),
    action: z.string(),
    action_type: z.enum(['prompt','navigation', 'system']),
    method: z.enum(['replace','append']),
    auto_send: z.boolean(),
    display_order: z.number().int(),
    is_active: z.boolean(),
});

export const ChatConfigSchema = z.object({
    welcome_messages: z.array(WelcomeMessageSchema),
    suggestions: z.array(ChatSuggestionSchema),
});

export type WelcomeMessage = z.infer<typeof WelcomeMessageSchema>;
export type ChatSuggestion = z.infer<typeof ChatSuggestionSchema>;
export type ChatConfig = z.infer<typeof ChatConfigSchema>;