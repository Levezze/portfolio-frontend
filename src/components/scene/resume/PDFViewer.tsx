"use client";

import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/shared/ui/button";
import { Separator } from "@/components/shared/ui/separator";
import { MaximizeIcon, DownloadIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ZoomableContent } from "@/components/shared/ZoomableContent";
import { Loading } from "@/components/shared/alerts/Loading";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";

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
    <Dialog>
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
                  variant="ghost"
                  matchBgColor={true}
                  className="w-10 h-10 cursor-pointer rounded-full border-none font-normal text-sm text-background shadow-sm shadow-muted-foreground/10"
                >
                  <MaximizeIcon />
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
                variant="ghost"
                matchBgColor={true}
                asChild
                className="w-10 h-10 cursor-pointer rounded-full border-none font-normal text-sm text-background shadow-sm shadow-muted-foreground/10"
              >
                <a
                  href={url}
                  download="Lev_Zhitnik_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
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
      </div>

      {/* Fullscreen Dialog with Draggable & Zoomable PDF */}
      <DialogContent
        fullscreen={true}
        className="bg-black/95 flex flex-col gap-4 p-4"
        showCloseButton={true}
      >
        <VisuallyHidden>
          <DialogTitle>Resume PDF Viewer</DialogTitle>
        </VisuallyHidden>
        <ZoomableContent
          alwaysDraggable
          className="flex-1 flex items-center justify-center"
        >
          <div className="max-w-full max-h-[90vh] flex items-center justify-center">
            <Document
              file={url}
              loading={
                <div className="flex text-center h-full justify-center items-center p-4 text-white">
                  Loading PDF...
                </div>
              }
              error={
                <div className="flex text-center h-full justify-center items-center p-4 text-red-500">
                  Failed to load PDF.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                devicePixelRatio={2.5}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg max-w-full max-h-full"
              />
            </Document>
          </div>
        </ZoomableContent>

        {/* Page Navigation in Dialog */}
        {numPages && numPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="ghost"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(pageNumber - 1)}
              className="px-4 py-2 cursor-pointer rounded-full border-none disabled:opacity-50 disabled:cursor-not-allowed font-normal text-white bg-white/10 hover:bg-white/20"
            >
              Previous
            </Button>
            <span className="text-white font-medium">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="ghost"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(pageNumber + 1)}
              className="px-4 py-2 cursor-pointer rounded-full border-none disabled:opacity-50 disabled:cursor-not-allowed font-normal text-white bg-white/10 hover:bg-white/20"
            >
              Next
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
