"use client";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import type { ReactNode } from "react";
import { createWebSocketAdapter } from "@/lib/api/adapters/webSocketAdapter";
import { DownloadToolUI, NavigationToolUI } from "./ToolExecutor";

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
      <NavigationToolUI />
      <DownloadToolUI />
      {children}
    </AssistantRuntimeProvider>
  );
}
