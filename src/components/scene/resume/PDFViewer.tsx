'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZoomOutIcon, ZoomInIcon, MaximizeIcon, MinimizeIcon, DownloadIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Import PDF.js styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  url: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
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

  return (
    <div id="pdf-container" className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-auto bg-background p-4">
        <div className="flex justify-center">
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="text-center p-4">Loading PDF...</div>}
            error={
              <div className="text-center p-4 text-red-500">
                Failed to load PDF. Please try downloading it instead.
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
                href={url}
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
    </div>
  );
};