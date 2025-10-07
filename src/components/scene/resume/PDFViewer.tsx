"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSetAtom } from "jotai";
import { DownloadIcon, MaximizeIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { pushNavigationCallbackAtom } from "@/atoms/atomStore";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { Loading } from "@/components/shared/alerts/Loading";
import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared/ui/dialog";
import { Separator } from "@/components/shared/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";
import { ZoomableContent } from "@/components/shared/ZoomableContent";

// Import PDF.js styles
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
  url: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState(400);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const pushCallback = useSetAtom(pushNavigationCallbackAtom);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      pushCallback({
        callback: () => setIsOpen(false),
        label: "Close PDF viewer",
      });
    }
  };

  // Measure actual container width with ResizeObserver
  useEffect(() => {
    if (!pdfContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      // Account for p-4 padding (16px each side = 32px total)
      setPdfWidth(Math.max(200, width));
    });

    observer.observe(pdfContainerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex flex-col h-full w-full">
        {/* Cube Face - PDF Preview (click to open fullscreen) */}
        <DialogTrigger asChild>
          <div
            ref={pdfContainerRef}
            className="flex items-start flex-1 overflow-auto bg-background p-4 cursor-pointer"
          >
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="w-full h-full">
                  <Loading />
                </div>
              }
              error={
                <div className="w-full h-full">
                  <FailedLoad />
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={pdfWidth}
                devicePixelRatio={2}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg my-auto mx-auto"
              />
            </Document>
          </div>
        </DialogTrigger>

        <Separator />

        {/* Cube Face Controls - Download and Maximize only */}
        <div className="flex justify-center items-center gap-3 p-4 bg-background">
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  matchBgColor={true}
                  className="w-36 font-inter rounded-[25px] cursor-pointer h-[45px]"
                >
                  <MaximizeIcon />
                  Fullscreen
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fullscreen</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                matchBgColor={true}
                asChild
                className="w-36 font-inter rounded-[25px] cursor-pointer h-[45px]"
              >
                <a
                  href={url}
                  download="Lev_Zhitnik_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                  <DownloadIcon />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Fullscreen Dialog with Draggable & Zoomable PDF */}
      <DialogContent
        fullscreen={true}
        className="bg-black/95 p-4"
        showCloseButton={true}
      >
        <VisuallyHidden>
          <DialogTitle>Resume PDF Viewer</DialogTitle>
        </VisuallyHidden>
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-h-full">
            <ZoomableContent alwaysDraggable>
              <Document
                file={url}
                loading={
                  <div className="flex text-center h-full justify-center items-center p-4 text-muted-foreground">
                    Loading PDF...
                  </div>
                }
                error={
                  <div className="flex text-center h-full justify-center items-center p-4 text-muted-foreground">
                    Failed to load PDF.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  devicePixelRatio={2.5}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </Document>
            </ZoomableContent>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
