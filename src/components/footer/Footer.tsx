import React, { useState, useEffect } from "react";
import { StateControls } from "./StateControls";
import { Navigation } from "./Navigation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAtom, useAtomValue } from "jotai";
import {
  cubeColorAtom,
  activeFaceAtom,
  drawerOpenAtom,
} from "@/atoms/atomStore";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MenuIcon, MessageSquareTextIcon } from "lucide-react";
import { RESPONSIVE_CONFIG } from "@/config/responsive";
import { getMobileOrientation } from "@/utils/deviceDetection";
import { ButtonFrame } from "../shared/ButtonFrame";
import { TooltipButton } from "../shared/TooltipButton";

export const Footer = () => {
  const isMobile = useIsMobile();
  const cubeColor = useAtomValue(cubeColorAtom);
  const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
  const [drawerOpen, setDrawerOpen] = useAtom(drawerOpenAtom);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  useEffect(() => {
    if (!isMobile) return;

    const updateOrientation = () => {
      setOrientation(getMobileOrientation());
    };

    updateOrientation();

    window.addEventListener("resize", updateOrientation);
    return () => window.removeEventListener("resize", updateOrientation);
  }, [isMobile]);

  if (!isMobile) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-center z-100"
        style={{
          height: "clamp(50px, calc((100vh - var(--face-size)) / 2), 100px)",
        }}
      >
        <div className="footer gap-4 flex flex-row justify-between">
          <Navigation variant="default" orientation="horizontal" />
          <StateControls variant="default" orientation="horizontal" />
        </div>
      </div>
    );
  }

  // mobile:
  const marginPercent = RESPONSIVE_CONFIG.mobile.marginPercentage || 0.15;
  const containerSize = (marginPercent / 2) * 100;
  const drawerButtonColorClass = "text-white dark:text-muted";

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      {orientation === "portrait" ? (
        <div
          className="fixed bottom-0 left-0 right-0 flex flex-row gap-4 items-center justify-center z-100"
          style={{ height: `${containerSize}vh` }}
        >
          <DrawerTrigger asChild>
            <div className="flex justify-center">
              <ButtonFrame variant="default">
                <TooltipButton
                  tooltip={false}
                  inputIcon={
                    <div className={drawerButtonColorClass}>
                      <MenuIcon style={{ width: "18px", height: "18px" }} />
                    </div>
                  }
                  tooltipText=""
                  handleClick={() => {}}
                  state={true}
                  round={true}
                  size={8}
                />
              </ButtonFrame>
            </div>
          </DrawerTrigger>
          <div className="flex justify-center">
            <ButtonFrame variant="default">
              <TooltipButton
                tooltip={false}
                disabled={activeFace === "chat"}
                inputIcon={
                  <div className={drawerButtonColorClass}>
                    <MessageSquareTextIcon
                      style={{ width: "18px", height: "18px" }}
                    />
                  </div>
                }
                tooltipText=""
                handleClick={() => setActiveFace("chat")}
                state={true}
                round={true}
                size={8}
              />
            </ButtonFrame>
          </div>
        </div>
      ) : (
        <div
          className="fixed left-0 top-0 bottom-0 flex flex-col gap-4 items-center justify-center z-100"
          style={{ width: `${containerSize}vw` }}
        >
          <DrawerTrigger asChild>
            <div className="flex justify-center w-full">
              <ButtonFrame variant="default">
                <TooltipButton
                  tooltip={false}
                  inputIcon={
                    <div className={drawerButtonColorClass}>
                      <MenuIcon style={{ width: "18px", height: "18px" }} />
                    </div>
                  }
                  tooltipText=""
                  handleClick={() => {}}
                  state={true}
                  round={true}
                  size={8}
                />
              </ButtonFrame>
            </div>
          </DrawerTrigger>
          <div className="flex justify-center w-full">
            <ButtonFrame variant="default">
              <TooltipButton
                tooltip={false}
                disabled={activeFace === "chat"}
                inputIcon={
                  <div className={drawerButtonColorClass}>
                    <MessageSquareTextIcon
                      style={{ width: "18px", height: "18px" }}
                    />
                  </div>
                }
                tooltipText=""
                handleClick={() => setActiveFace("chat")}
                state={true}
                round={true}
                size={8}
              />
            </ButtonFrame>
          </div>
        </div>
      )}
      <DrawerContent
        style={{
          backgroundColor: cubeColor || "#A8DADC",
          transition: "background-color 300ms ease-in-out",
        }}
        className="z-200"
      >
        <DrawerHeader>
          <DrawerTitle className="text-foreground">Navigation</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-6 pt-0">
          <Navigation
            variant="inverse"
            orientation={!isMobile ? "horizontal" : "vertical"}
          />
          <StateControls
            variant="inverse"
            orientation={!isMobile ? "horizontal" : "vertical"}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
