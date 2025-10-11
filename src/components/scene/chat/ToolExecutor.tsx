import { makeAssistantToolUI } from "@assistant-ui/react";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { navigateToFaceAtom } from "@/atoms/atomStore";
import type { FileType, PagesType } from "@/lib/api/schemas/tools";
import { useAnalytics } from "@/hooks/useAnalytics";
import { capitalFirstLetter } from "@/lib/utils/general";

export const NavigationToolUI = makeAssistantToolUI<
  { page: PagesType },
  unknown
>({
  toolName: "navigate_page",
  render: ({ args, result, status }) => {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_DEBUG
    ) {
      console.log("🟢 NavigationToolUI rendering with:", {
        args,
        result,
        status,
      });
    }
    const navigateToFace = useSetAtom(navigateToFaceAtom);
    useEffect(() => {
      // AI-initiated navigation is considered "forward" navigation
      navigateToFace({ face: args.page, direction: "forward" });
    }, [args.page, navigateToFace]);

    return (
      <span>{`Taking you to the ${capitalFirstLetter(args.page)} page`}</span>
    );
  },
});

export const DownloadToolUI = makeAssistantToolUI<
  { file_type: FileType; message: string },
  unknown
>({
  toolName: "trigger_download",
  render: ({ args, result, status }) => {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_DEBUG
    ) {
      console.log("🟢 DownloadToolUI rendering with:", {
        args,
        result,
        status,
      });
    }

    const trackEvent = useAnalytics();

    useEffect(() => {
      // Trigger download based on file type
      if (args.file_type === "resume") {
        // Track AI-initiated download
        trackEvent("resume_downloaded_ai", {
          source: "ai_tool",
          file_type: args.file_type,
        });

        // Fetch resume URL and trigger download
        fetch("/api/public/resume")
          .then((res) => res.json())
          .then((data) => {
            if (data?.attachment?.url) {
              const link = document.createElement("a");
              link.href = data.attachment.url;
              link.download = "Lev_Zhitnik_Resume.pdf";
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          })
          .catch((error) => {
            console.error("Failed to download resume:", error);
          });
      }
    }, [args.file_type, trackEvent]);

    return <span>{args.message || "Downloading file..."}</span>;
  },
});
