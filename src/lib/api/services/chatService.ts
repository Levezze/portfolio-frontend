import { apiClient } from "../core/client";
import { ChatConfigSchema } from "../schemas/chat";
import {
  NavigateParams,
  DownloadParams,
  ContactParams,
} from "../schemas/tools";

export const getChatConfig = async () => {
  const config = await apiClient.get("/chat/config");
  const chatConfig = ChatConfigSchema.parse(config);
  return {
    welcome_messages: chatConfig.welcome_messages,
    suggestions: chatConfig.suggestions,
  };
};

export const transformTool = async (
  toolMessage: NavigateParams | DownloadParams | ContactParams
) => {
  const baseTool = {
    type: "tool-call" as const,
    toolName: toolMessage.tool_name,
    toolId: toolMessage.tool_id,
    messageId: toolMessage.message_id,
    args: toolMessage.parameters,
    argsText: JSON.stringify(toolMessage.parameters),
  };

  return baseTool;
};
