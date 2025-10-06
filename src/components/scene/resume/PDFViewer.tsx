"use client";

import React, { useState } from "react";
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
  DialogTrigger,
} from "@/components/shared/ui/dialog";
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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <Dialog>
      <div className="flex flex-col h-full w-full">
        {/* Cube Face - PDF Preview with Download and Maximize buttons */}
        <DialogTrigger asChild>
          <div className="flex-1 overflow-auto bg-background p-4 cursor-pointer">
            <div className="flex justify-center">
              <Document
                file={url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="flex text-center h-full justify-center items-center p-4">
                    Loading PDF...
                  </div>
                }
                error={
                  <div className="flex text-center h-full justify-center items-center p-4 text-red-500">
                    Failed to load PDF. Please try downloading it instead.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={1.0}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg pointer-events-none"
                />
              </Document>
            </div>
          </div>
        </DialogTrigger>

        <Separator />

        {/* Cube Face Controls - Download and Maximize only */}
        <div className="flex justify-center items-center gap-3 p-4 bg-background">
          <DialogTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  matchBgColor={true}
                  className="w-10 h-10 cursor-pointer rounded-full border-none font-normal text-sm text-background shadow-sm shadow-muted-foreground/10"
                >
                  <MaximizeIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fullscreen</p>
              </TooltipContent>
            </Tooltip>
          </DialogTrigger>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                matchBgColor={true}
                asChild
                className="w-10 h-10 cursor-pointer rounded-full border-none font-normal text-sm text-background shadow-sm shadow-muted-foreground/10"
              >
                <a href={url} download="Lev_Zhitnik_Resume.pdf">
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

      {/* Fullscreen Dialog with Zoomable PDF */}
      <DialogContent
        className="w-[95vw] h-[95vh] max-w-[1400px] max-h-[1400px] p-4 bg-black/95"
        showCloseButton={true}
      >
        <div className="w-full h-full flex flex-col">
          <ZoomableContent className="flex-1">
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
                scale={1.5}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          </ZoomableContent>

          {/* Page Navigation in Dialog */}
          {numPages && numPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
