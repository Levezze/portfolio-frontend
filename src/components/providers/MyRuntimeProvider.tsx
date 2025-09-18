'use client'
import { ReactNode } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useLocalRuntime } from '@assistant-ui/react';
import { createWebSocketAdapter } from '@/lib/chat/webSocketAdapter';

interface MyRuntimeProviderProps {
    children: ReactNode;
}

export function MyRuntimeProvider({ children }: MyRuntimeProviderProps) {
    // create the adapter - URL is handled in wsClient
    const adapter = createWebSocketAdapter();

    // create runtime with the adapter
    const runtime = useLocalRuntime(adapter);

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {children}
        </AssistantRuntimeProvider>
    );
}