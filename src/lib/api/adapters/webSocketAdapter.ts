import { ChatModelAdapter, ChatModelRunResult } from "@assistant-ui/react";
import { v4 as uuidv4 } from 'uuid';
import { wsManager } from '@/lib/api/core/wsManager';
import { transformTool } from "../services/chatService";

export function createWebSocketAdapter(): ChatModelAdapter {

    return {
        async *run({ messages, abortSignal }): AsyncGenerator<ChatModelRunResult> {
            wsManager.connect();
            
            const messageId = uuidv4();
            const lastMessage = messages.at(-1);

            if (!lastMessage || lastMessage.role !== 'user') {
                throw new Error('No user message to send');
            }

            const userContent = lastMessage.content?.[0]?.type === 'text' ?
                lastMessage.content[0].text : '';

            if (!userContent) {
                throw new Error('Empty message');
            }

            const messageQueue: any[] = [];
            const messagePromises: ((value: any) => void)[] = [];

            const unsubscribe = wsManager.on('message', (data: any) => {
                if (data.message_id !== messageId) return;

                if (messagePromises.length > 0) {
                    const resolve = messagePromises.shift()!;
                    resolve(data);
                } else {
                    messageQueue.push(data);
                }
            });

            wsManager.send({
                type: "message",
                content: messages,
                message_id: messageId,
            });

            let accumulatedText = '';
            let isDone = false;

            while (!isDone && !abortSignal?.aborted) {
                const message = await new Promise<any>((resolve) => {
                    if (messageQueue.length > 0) {
                        resolve(messageQueue.shift());
                    } else {
                        messagePromises.push(resolve);
                    }
                });

                switch (message.type) {
                    case 'greeting':
                    case 'stream':
                        accumulatedText += message.content || '';
                        yield {
                            content: [{
                                type: 'text' as const,
                                text: accumulatedText,
                            }]
                        }
                        break;

                    case 'tool_call':
                        // content array with both text and tool call
                        const content: any[] = [];

                        if (accumulatedText) {
                            content.push({
                                type: 'text' as const,
                                text: accumulatedText,
                            });
                        }

                        content.push(await transformTool(message));

                        yield { content };

                        break;

                    case 'end':
                        isDone = true;
                        break;

                    case 'error':
                        throw new Error(message.content || 'Server error');
                }
            }

            unsubscribe();
        }
    }
}