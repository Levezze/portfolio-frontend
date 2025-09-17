import { apiClient } from "../client";
import { WelcomeMessageSchema, ChatSuggestionSchema, ChatConfigSchema } from "../schemas/chat";

export const getChatConfig = async () => {
    const config = await apiClient.get('/chat/config');

    try {
        const chatConfig = ChatConfigSchema.parse(config);
        return {
            welcomeMessages: chatConfig.welcome_messages,
            chatSuggestions: chatConfig.suggestions,
        }
    } catch (e) {
        console.error('Invalid chat config', e);
        return {
            welcomeMessages: [],
            chatSuggestions: [],
        }
    }
}