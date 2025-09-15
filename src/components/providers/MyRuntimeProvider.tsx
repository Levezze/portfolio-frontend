'use client'
import { ReactNode } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useLocalRuntime } from '@assistant-ui/react';
import { createWebSocketAdapter } from '@/lib/chat/webSocketAdapter';

interface MyRuntimeProviderProps {
    children: ReactNode;
    wsUrl?: string;
}

export function MyRuntimeProvider({ children, wsUrl }: MyRuntimeProviderProps) {
    // create the adapter with configuration -> (config?: { wsUrl?: string })
    const adapter = createWebSocketAdapter({ wsUrl });

    // create runtime with the adapter
    const runtime = useLocalRuntime(adapter);

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {children}
        </AssistantRuntimeProvider>
    );
}