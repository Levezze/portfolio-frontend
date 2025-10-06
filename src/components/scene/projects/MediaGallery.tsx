import React from "react";
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
  DialogTitle,
  DialogTrigger,
} from "@/components/shared/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/shared/ui/carousel";
import Autoplay from "embla-carousel-auto-scroll";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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

  const sortedItems = [...items].sort((a, b) => {
    if (a.mediaType === "video" && b.mediaType !== "video") return -1;
    if (a.mediaType !== "video" && b.mediaType === "video") return 1;
    return 0;
  });

  return (
    <div className="w-full mb-6 pt-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          watchDrag: true,
        }}
        plugins={[
          Autoplay({
            speed: 1,
            startDelay: 15000,
            stopOnInteraction: false,
            playOnInit: true,
          }),
        ]}
        className="w-full cursor-grab active:cursor-grabbing"
      >
        <CarouselContent className="-ml-2">
          {sortedItems.map((item, idx) => (
            <CarouselItem key={item.original} className="pl-2 basis-[90%]">
              <Dialog>
                <DialogTrigger asChild>
                  {item.mediaType === "video" ? (
                    <div className="cursor-pointer">
                      <VideoPlayer className="w-full aspect-video rounded-md overflow-hidden max-h-[40vh]">
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
                      className="w-full aspect-video object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity max-h-[40vh]"
                    />
                  )}
                </DialogTrigger>
                <DialogContent
                  className="w-[95vw] h-[95vh] max-w-[1400px] max-h-[1400px] p-4 bg-black/95"
                  showCloseButton={true}
                >
                  <VisuallyHidden>
                    <DialogTitle>
                      {item.mediaType === "video"
                        ? "Video Player"
                        : "Image Viewer"}
                    </DialogTitle>
                  </VisuallyHidden>
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
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
