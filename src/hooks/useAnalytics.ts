import { useCallback } from "react";

// GA4 Event Types
export type AnalyticsEvent =
  // Chat events
  | "chat_message_sent"
  | "chat_conversation_started"
  // Navigation events
  | "face_navigation"
  | "face_navigation_ai"
  // Resume events
  | "resume_downloaded"
  | "resume_downloaded_ai"
  | "resume_fullscreen_opened"
  // Projects events
  | "project_opened"
  | "project_media_viewed"
  // Contact events
  | "contact_form_submitted";

// Event Parameters
export interface AnalyticsEventParams {
  chat_message_sent?: {
    message_length?: number;
    is_first_message?: boolean;
  };
  chat_conversation_started?: {
    session_id?: string;
  };
  face_navigation?: {
    face_name: string;
    from_face?: string;
  };
  face_navigation_ai?: {
    face_name: string;
    from_face?: string;
    tool_name?: string;
  };
  resume_downloaded?: {
    source: "manual";
  };
  resume_downloaded_ai?: {
    source: "ai_tool";
    file_type: string;
  };
  resume_fullscreen_opened?: Record<string, never>;
  project_opened?: {
    project_title: string;
    project_slug: string;
  };
  project_media_viewed?: {
    media_type: "image" | "video";
    media_index: number;
    project_slug?: string;
  };
  contact_form_submitted?: {
    has_subject?: boolean;
  };
}

/**
 * Custom hook for tracking Google Analytics events with TypeScript safety
 *
 * @example
 * const trackEvent = useAnalytics();
 * trackEvent('face_navigation', { face_name: 'projects' });
 */
export function useAnalytics() {
  const trackEvent = useCallback(
    <T extends AnalyticsEvent>(
      eventName: T,
      eventParams?: AnalyticsEventParams[T]
    ) => {
      // Skip if not in browser environment (SSR)
      if (typeof window === "undefined") {
        return;
      }

      // Skip if gtag is not available (ad blockers, script not loaded)
      if (typeof window.gtag !== "function") {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Analytics] gtag not available, event not tracked:", {
            eventName,
            eventParams,
          });
        }
        return;
      }

      // Track the event
      try {
        window.gtag("event", eventName, eventParams || {});

        if (process.env.NODE_ENV === "development") {
          console.log("[Analytics] Event tracked:", {
            eventName,
            eventParams,
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Analytics] Error tracking event:", error);
        }
      }
    },
    []
  );

  return trackEvent;
}

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}
