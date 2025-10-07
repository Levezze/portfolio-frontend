import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Autoplay from "embla-carousel-auto-scroll";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { pushNavigationCallbackAtom } from "@/atoms/atomStore";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
} from "@/components/shared/kibo-ui/video-player";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/shared/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
            startDelay: 5000,
            stopOnInteraction: false,
            playOnInit: true,
          }),
        ]}
        className="w-full cursor-grab active:cursor-grabbing"
      >
        <CarouselContent className="-ml-2">
          {sortedItems.map((item, idx) => (
            <CarouselItem key={item.original} className="pl-2 basis-[90%]">
              <MediaDialog item={item} idx={idx} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

const MediaDialog = ({ item, idx }: { item: MediaItem; idx: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pushCallback = useSetAtom(pushNavigationCallbackAtom);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Dialog opened - push callback to close it
      pushCallback({
        callback: () => setIsOpen(false),
        label: `Close ${item.mediaType === "video" ? "video" : "image"} viewer`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
        fullscreen={true}
        className="bg-black/95 p-4"
        showCloseButton={true}
      >
        <VisuallyHidden>
          <DialogTitle>
            {item.mediaType === "video" ? "Video Player" : "Image Viewer"}
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
  );
};
