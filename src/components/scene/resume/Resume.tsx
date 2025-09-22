'use client';

import React, { useState } from 'react';
import { Face } from '@/components/shared/Face';
import { Document, Page, pdfjs } from 'react-pdf';
import useSWR from 'swr';
import { useAtomValue } from 'jotai';
import { pageColorAtom } from '@/atoms/atomStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZoomOutIcon, ZoomInIcon, MaximizeIcon, MinimizeIcon, DownloadIcon } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { apiClient } from '@/lib/api/core/client';
import { resumeDownloadSchema } from '@/lib/api/schemas/resume';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Use local worker to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const resumeFetcher = async (url: string) => {
  try {
    const data = await apiClient.get(url);
    const validated = resumeDownloadSchema.parse(data);
    return validated.attachment.url;
  } catch (error) {
    console.error('Resume fetch error:', error);
    throw error;
  }
};

const Resume = () => {
  const { data: resumeUrl, error, isLoading } = useSWR<string, Error>(
    '/public/resume',
    resumeFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const elem = document.getElementById('pdf-container');
    if (!isFullscreen && elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Always return within Face component to maintain cube structure
  return (
    <Face>
      <div id="pdf-container" className="flex flex-col h-full w-full">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading resume...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center space-y-4">
              <div className="text-red-500 text-lg font-semibold">Unable to Load Resume</div>
              <p className="text-muted-foreground">
                {error.message || 'Failed to fetch resume from server'}
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
                <a href="mailto:lev@levezze.com">
                  Contact Me
                </a>
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && !resumeUrl && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4 text-muted-foreground">
              No resume available at this time.
            </div>
          </div>
        )}

        {resumeUrl && !isLoading && (
          <>
            <div className="flex-1 overflow-auto bg-background p-4">
              <div className="flex justify-center">
                <Document
                  file={resumeUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<div className="text-center p-4">Loading resume...</div>}
                  error={
                    <div className="text-center p-4 text-red-500">
                      Failed to load resume. Please try downloading it instead.
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg"
                  />
                </Document>
              </div>

              {numPages && numPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    variant="ghost"
                    matchBgColor={true}
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(pageNumber - 1)}
                    className="px-5 py-2 cursor-pointer rounded-none rounded-tl-2xl rounded-br-2xl border border-border disabled:opacity-50 disabled:cursor-not-allowed font-normal text-background"
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground font-medium">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    variant="ghost"
                    matchBgColor={true}
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber(pageNumber + 1)}
                    className="px-5 py-2 cursor-pointer rounded-none rounded-tl-2xl rounded-br-2xl border border-border disabled:opacity-50 disabled:cursor-not-allowed font-normal text-background"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-center items-center gap-3 p-4 bg-background">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    matchBgColor={true}
                    onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
                    className="px-5 py-2 cursor-pointer rounded-none rounded-tl-2xl rounded-br-2xl border border-border font-normal text-sm text-background"
                  >
                    <ZoomOutIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-muted-foreground min-w-[60px] text-center font-medium text-sm">
                {Math.round(scale * 100)}%
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    matchBgColor={true}
                    onClick={() => setScale(s => Math.min(2, s + 0.2))}
                    className="px-5 py-2 cursor-pointer rounded-none rounded-tl-2xl rounded-br-2xl border border-border font-normal text-sm text-background"
                  >
                    <ZoomInIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    matchBgColor={true}
                    onClick={handleFullscreen}
                    className="px-5 py-2 cursor-pointer rounded-none rounded-tl-2xl rounded-br-2xl border border-border font-normal text-sm text-background"
                  >
                    {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    matchBgColor={true}
                    asChild
                    className="px-5 py-2 cursor-pointer rounded-none rounded-tl-2xl rounded-br-2xl border border-border font-normal text-sm text-background"
                  >
                    <a
                      href={resumeUrl}
                      download="Lev_Zhitnik_Resume.pdf"
                    >
                      <DownloadIcon />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </Face>
  );
};

export default Resume;