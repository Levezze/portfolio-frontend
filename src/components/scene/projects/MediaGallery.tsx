import React, { useEffect, useRef, useState } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerTimeRange,
  VideoPlayerTimeDisplay,
  VideoPlayerPlayButton,
} from "@/components/shared/kibo-ui/video-player";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/shared/ui/dialog";
import { ZoomableContent } from "@/components/shared/ZoomableContent";

interface MediaItem {
  original: string;
  mediaType: "image" | "video";
  thumbnail?: string;
  mediaWidth?: number;
  mediaHeight?: number;
}

export const MediaGallery = ({ items }: { items: MediaItem[] }) => {
  if (!items || items.length === 0) return null;

  const scrollContainerRef = useRef<any>(null);
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
        const container = scrollContainerRef.current?.getElement?.();
        if (!container) return;

        const nextIndex = (currentIndex + 1) % sortedItems.length;
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
      const container = scrollContainerRef.current?.getElement?.();
      if (isAutoScrolling || !container) return;

      // User scrolled manually
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Calculate current index from scroll position
      const itemWidth = container.scrollWidth / sortedItems.length;
      const newIndex = Math.round(container.scrollLeft / itemWidth);

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    const container = scrollContainerRef.current?.getElement?.();
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
      const container = scrollContainerRef.current?.getElement?.();

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

    const container = scrollContainerRef.current?.getElement?.();
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  // Reset auto-scroll timeout when user manually scrolls
  const handleEndScroll = () => {
    const container = scrollContainerRef.current?.getElement?.();
    if (!container || isAutoScrolling) return;

    // User scrolled manually
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Calculate current index from scroll position
    const itemWidth = container.scrollWidth / sortedItems.length;
    const newIndex = Math.round(container.scrollLeft / itemWidth);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const autoCols =
    sortedItems.length !== 1
      ? "grid grid-flow-col gap-2 auto-cols-[90%]"
      : "flex w-full justify-center";

  return (
    <div className="w-full mb-6">
      <ScrollContainer
        innerRef={scrollContainerRef}
        horizontal={true}
        vertical={false}
        hideScrollbars={true}
        activationDistance={10}
        onEndScroll={handleEndScroll}
        className={`
        pt-4
        ${autoCols}
        snap-x snap-mandatory
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
              className="w-[95vw] h-[95vh] max-w-[1400px] max-h-[1400px] p-4 bg-black/95"
              showCloseButton={true}
            >
              <div className="w-full h-full flex items-center justify-center">
                {item.mediaType === "video" ? (
                  <VideoPlayer className="w-full max-w-full max-h-full aspect-video">
                    <VideoPlayerContent
                      crossOrigin=""
                      preload="metadata"
                      slot="media"
                      src={item.original}
                      className="w-full h-full"
                      autoPlay
                      loop
                      playsInline
                    />
                    <VideoPlayerControlBar>
                      <VideoPlayerPlayButton />
                      <VideoPlayerTimeRange />
                      <VideoPlayerTimeDisplay />
                    </VideoPlayerControlBar>
                  </VideoPlayer>
                ) : (
                  <ZoomableContent>
                    <img
                      src={item.original}
                      alt={`Project media ${idx + 1}`}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="max-w-full max-h-[85vh] object-contain"
                    />
                  </ZoomableContent>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </ScrollContainer>
    </div>
  );
};
