"use client";

import type React from "react";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils/general";

interface ZoomableContentProps {
  children: ReactNode;
  className?: string;
  alwaysDraggable?: boolean;
}

export const ZoomableContent = ({
  children,
  className,
  alwaysDraggable = false,
}: ZoomableContentProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const dragDistanceRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (_e: React.MouseEvent) => {
    // Don't toggle zoom if user was dragging (threshold 5px)
    if (dragDistanceRef.current > 5) {
      dragDistanceRef.current = 0;
      return;
    }

    dragDistanceRef.current = 0;

    if (scale === 1) {
      // Zoom in to 2x
      setScale(2);
    } else {
      // Zoom out to fit
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 || alwaysDraggable) {
      e.preventDefault();
      setIsDragging(true);
      dragDistanceRef.current = 0;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || (scale === 1 && !alwaysDraggable)) return;

    e.preventDefault();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Track total drag distance
    dragDistanceRef.current = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((scale > 1 || alwaysDraggable) && e.touches.length === 1) {
      setIsDragging(true);
      dragDistanceRef.current = 0;
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      !isDragging ||
      (scale === 1 && !alwaysDraggable) ||
      e.touches.length !== 1
    )
      return;

    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;

    // Track total drag distance
    dragDistanceRef.current = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const getCursor = () => {
    if (isDragging) return "cursor-grabbing";
    if (scale > 1 || alwaysDraggable) return "cursor-grab";
    return "cursor-zoom-in";
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "w-full h-full flex items-center justify-center overflow-hidden select-none",
        getCursor(),
        className,
      )}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        className="flex items-center justify-center"
      >
        {children}
      </div>
    </div>
  );
};
