"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { Loading } from "@/components/shared/alerts/Loading";
import { Button } from "@/components/shared/ui/button";
import { apiClient } from "@/lib/api/core/client";
import { resumeDownloadSchema } from "@/lib/api/schemas/resume";

// dynamic import to avoid SSR issues
const PDFViewer = dynamic(
  () => import("./PDFViewer").then((mod) => ({ default: mod.PDFViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    ),
  }
);

const resumeFetcher = async (url: string) => {
  try {
    const data = await apiClient.get(url);
    const validated = resumeDownloadSchema.parse(data);
    return validated.attachment.url;
  } catch (error) {
    console.error("Resume fetch error:", error);
    throw error;
  }
};

const Resume = () => {
  const {
    data: resumeUrl,
    error,
    isLoading,
  } = useSWR<string, Error>("/public/resume", resumeFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  return (
    <div className="flex flex-col h-full w-full">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <Loading />
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground text-lg font-semibold">
              Unable to Load Resume
            </div>
            <p className="text-muted-foreground">
              {error.message || "Failed to fetch resume from server"}
            </p>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page or contact me directly.
            </p>
            <Button
              variant="ghost"
              matchBgColor={true}
              asChild
              className="px-5 py-2 mt-4 cursor-pointer rounded-none rounded-tl-2xl rounded-br-2xl border border-border font-semibold text-background"
            >
              <a href="mailto:lev@levezze.com">Contact Me</a>
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && !resumeUrl && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4 text-muted-foreground">
            <FailedLoad />
          </div>
        </div>
      )}

      {resumeUrl && !isLoading && <PDFViewer url={resumeUrl} />}
    </div>
  );
};

export default Resume;
