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

export const MediaGallery = ({
  items,
  setMediaView,
}: {
  items: MediaItem[];
  setMediaView: (view: string) => void;
}) => {
  if (!items || items.length === 0) return null;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedItems = [...items].sort((a, b) => {
    if (a.mediaType === "video" && b.mediaType !== "video") return -1;
    if (a.mediaType !== "video" && b.mediaType === "video") return 1;
    return 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;

      const nextIndex = (currentIndex + 1) % sortedItems.length;
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / sortedItems.length;

      container.scrollTo({
        left: itemWidth * nextIndex,
        behavior: "smooth",
      });

      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, sortedItems.length]);

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
          <div
            key={item.original}
            className="flex-none max-w-[75vw] snap-center"
          >
            {item.mediaType === "video" ? (
              <VideoPlayer className="w-full aspect-video rounded-md overflow-hidden max-h-[45vh]">
                <VideoPlayerContent
                  onClick={() => setMediaView(item.original)}
                  crossOrigin=""
                  muted
                  preload="metadata"
                  slot="media"
                  src={item.original}
                  className="w-full h-full"
                  autoPlay
                  loop
                  playsInline
                />
              </VideoPlayer>
            ) : (
              <img
                src={item.original}
                alt={`Project media ${idx + 1}`}
                className="w-full aspect-video object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity max-h-[45vh]"
                onClick={() => setMediaView(item.original)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
