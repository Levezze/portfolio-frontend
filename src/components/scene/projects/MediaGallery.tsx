import React, { useEffect, useRef, useState } from "react";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerTimeRange,
  VideoPlayerTimeDisplay,
  VideoPlayerPlayButton,
  VideoPlayerMuteButton,
  VideoPlayerVolumeRange,
} from "@/components/shared/kibo-ui/video-player";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/shared/ui/dialog";
import Zoom from "react-medium-image-zoom";

interface MediaItem {
  original: string;
  mediaType: "image" | "video";
  thumbnail?: string;
  mediaWidth?: number;
  mediaHeight?: number;
}

export const MediaGallery = ({ items }: { items: MediaItem[] }) => {
  if (!items || items.length === 0) return null;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const sortedItems = [...items].sort((a, b) => {
    if (a.mediaType === "video" && b.mediaType !== "video") return -1;
    if (a.mediaType !== "video" && b.mediaType === "video") return 1;
    return 0;
  });

  // Auto-scroll with longer timeout
  useEffect(() => {
    const startAutoScroll = () => {
      scrollTimeoutRef.current = setTimeout(() => {
        if (!scrollContainerRef.current) return;

        const nextIndex = (currentIndex + 1) % sortedItems.length;
        const container = scrollContainerRef.current;
        const itemWidth = container.scrollWidth / sortedItems.length;

        setIsAutoScrolling(true);
        container.scrollTo({
          left: itemWidth * nextIndex,
          behavior: "smooth",
        });

        setCurrentIndex(nextIndex);

        // Reset flag after smooth scroll completes
        setTimeout(() => setIsAutoScrolling(false), 600);
      }, 15000);
    };

    startAutoScroll();

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, sortedItems.length]);

  // Detect user scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling || !scrollContainerRef.current) return;

      // User scrolled manually
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Calculate current index from scroll position
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / sortedItems.length;
      const newIndex = Math.round(container.scrollLeft / itemWidth);

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isAutoScrolling, currentIndex, sortedItems.length]);

  // Handle wheel events with passive: false to enable preventDefault
  // Only apply horizontal scrolling when hovering over the gallery, not dialogs
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const container = scrollContainerRef.current;

      // Only convert vertical scroll to horizontal if we're scrolling on the gallery
      // Allow normal vertical scrolling in dialogs
      if (
        container &&
        container.contains(target) &&
        !target.closest('[data-slot="dialog-content"]')
      ) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const autoCols =
    sortedItems.length !== 1
      ? "grid grid-flow-col gap-2 auto-cols-[90%]"
      : "flex w-full justify-center";

  return (
    <div className="w-full mb-6">
      <div
        ref={scrollContainerRef}
        className={`
        pt-4
        ${autoCols}
        overflow-x-auto
        snap-x snap-mandatory
        touch-pan-x
        scrollbar-hide
      `}
      >
        {sortedItems.map((item, idx) => (
          <Dialog key={item.original}>
            <div className="flex-none max-w-[75vw] snap-center">
              <DialogTrigger asChild>
                {item.mediaType === "video" ? (
                  <div className="cursor-pointer">
                    <VideoPlayer className="w-full aspect-video rounded-md overflow-hidden max-h-[45vh]">
                      <VideoPlayerContent
                        crossOrigin=""
                        muted
                        preload="metadata"
                        slot="media"
                        src={item.original}
                        className="w-full h-full pointer-events-none"
                        autoPlay
                        loop
                        playsInline
                      />
                    </VideoPlayer>
                  </div>
                ) : (
                  <img
                    src={item.original}
                    alt={`Project media ${idx + 1}`}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-full aspect-video object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity max-h-[45vh]"
                  />
                )}
              </DialogTrigger>
            </div>
            <DialogContent
              className="w-[95vw] h-[95vh] max-w-none max-h-none p-4 bg-black/55"
              showCloseButton={true}
            >
              <div className="w-full h-full flex items-center justify-center">
                {item.mediaType === "video" ? (
                  <VideoPlayer className="w-full max-w-full max-h-full aspect-video rounded-[25px]">
                    <VideoPlayerContent
                      crossOrigin=""
                      preload="metadata"
                      slot="media"
                      src={item.original}
                      className="w-full h-full rounded-[25px]"
                      autoPlay
                      playsInline
                      loop
                    />
                    <VideoPlayerControlBar>
                      <VideoPlayerPlayButton />
                      <VideoPlayerTimeRange />
                      <VideoPlayerTimeDisplay />
                    </VideoPlayerControlBar>
                  </VideoPlayer>
                ) : (
                  <Zoom>
                    <img
                      src={item.original}
                      alt={`Project media ${idx + 1}`}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="max-w-full max-h-[90vh] object-contain"
                    />
                  </Zoom>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};
