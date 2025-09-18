import { apiClient } from "../client";
import { ChatConfigSchema } from "../schemas/chat";

export const getChatConfig = async () => {
    try {
        const config = await apiClient.get('/chat/config');
        const chatConfig = ChatConfigSchema.parse(config);
        return {
            welcome_messages: chatConfig.welcome_messages,
            suggestions: chatConfig.suggestions,
        }
    } catch (e) {
        console.error('Failed to load chat config', e);
        return {
            welcome_messages: [],
            suggestions: [],
        }
    }
}