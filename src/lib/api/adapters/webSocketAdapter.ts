import { ChatModelAdapter, ChatModelRunResult } from "@assistant-ui/react";
import { v4 as uuidv4 } from 'uuid';
import { wsManager } from '@/lib/api/core/wsManager';

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
                content: userContent,
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
                        yield {
                            content: [{
                                type: 'tool-call',
                                toolCallId: message.tool_id || 'tool-' + Date.now(),
                                toolName: message.tool_name || 'navigate',
                                args: message.arguments || {},
                                argsText: JSON.stringify(message.arguments || {}),
                            }]
                        }
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