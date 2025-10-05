import React from "react";
import { StateControls } from "./StateControls";
import { Navigation } from "./Navigation";
import { useAtom, useAtomValue } from "jotai";
import {
  cubeColorAtom,
  activeFaceAtom,
  drawerOpenAtom,
  isMobileAtom,
  viewportHeightAtom,
  viewportOrientationAtom,
  viewportWidthAtom,
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
import { ButtonFrame } from "../shared/ButtonFrame";
import { TooltipButton } from "../shared/TooltipButton";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const Footer = () => {
  const isMobile = useAtomValue(isMobileAtom);
  const cubeColor = useAtomValue(cubeColorAtom);
  const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
  const [drawerOpen, setDrawerOpen] = useAtom(drawerOpenAtom);
  const orientation = useAtomValue(viewportOrientationAtom);
  const viewportHeight = useAtomValue(viewportHeightAtom);
  const viewportWidth = useAtomValue(viewportWidthAtom);

  if (!isMobile) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-center z-10"
        style={{
          height:
            "clamp(50px, calc((var(--viewport-height) - var(--face-size)) / 2), 100px)",
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
  const containerFraction = marginPercent / 2;
  const drawerButtonColorClass = "text-white dark:text-muted";
  const portraitHeight = viewportHeight
    ? `${viewportHeight * containerFraction}px`
    : undefined;
  const landscapeWidth = viewportWidth
    ? `${viewportWidth * containerFraction}px`
    : undefined;

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      {orientation === "portrait" ? (
        <div
          className="fixed bottom-0 left-0 right-0 flex flex-row gap-4 items-center justify-center z-20"
          style={{
            height:
              portraitHeight ??
              `calc(var(--viewport-height) * ${containerFraction})`,
          }}
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
          style={{
            width: landscapeWidth ?? `calc(100vw * ${containerFraction})`,
          }}
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
        aria-describedby={undefined}
        style={{
          backgroundColor: cubeColor || "#A8DADC",
          transition: "background-color 300ms ease-in-out",
        }}
        className="z-200"
      >
        <DrawerHeader>
          <DrawerTitle className="text-foreground">
            <VisuallyHidden>Navigation</VisuallyHidden>
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-6 pt-0 overflow-y-auto">
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
