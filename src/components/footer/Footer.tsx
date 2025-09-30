import React, { useState, useEffect } from "react";
import { StateControls } from "./StateControls";
import { Navigation } from "./Navigation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAtom, useAtomValue } from "jotai";
import { cubeColorAtom, activeFaceAtom } from "@/atoms/atomStore";
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
import { FooterFrame } from "../shared/FooterFrame";
import { TooltipButton } from "../shared/TooltipButton";

export const Footer = () => {
  const isMobile = useIsMobile();
  const cubeColor = useAtomValue(cubeColorAtom);
  const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
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
      <div className="footer fixed bottom-5 z-100 gap-4 flex flex-row justify-between">
        <Navigation variant="default" />
        <StateControls variant="default" />
      </div>
    );
  }

  // mobile:
  const marginPercent = RESPONSIVE_CONFIG.mobile.marginPercentage || 0.15;
  const containerSize = (marginPercent / 2) * 100;
  const drawerButtonColorClass = "text-white dark:text-muted";

  return (
    <Drawer>
      {orientation === "portrait" ? (
        <div
          className="fixed bottom-0 left-0 right-0 flex flex-row gap-4 items-center justify-center z-100"
          style={{ height: `${containerSize}vh` }}
        >
          <DrawerTrigger asChild>
            <div>
              <FooterFrame variant="default">
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
              </FooterFrame>
            </div>
          </DrawerTrigger>
          <div>
            <FooterFrame variant="default">
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
            </FooterFrame>
          </div>
        </div>
      ) : (
        <div
          className="fixed left-0 top-0 bottom-0 flex flex-col gap-4 items-center justify-center z-100"
          style={{ width: `${containerSize}vw` }}
        >
          <DrawerTrigger asChild>
            <div>
              <FooterFrame variant="default">
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
              </FooterFrame>
            </div>
          </DrawerTrigger>
          <div>
            <FooterFrame variant="default">
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
            </FooterFrame>
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
          <DrawerTitle className="text-foreground">Controls</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-6 pt-0">
          <Navigation variant="mobile" />
          <StateControls variant="mobile" />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
