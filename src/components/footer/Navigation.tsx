import React, { useState } from "react";
import { ButtonFrame } from "@/components/shared/ButtonFrame";
import {
  MessageSquareTextIcon,
  CircleUserIcon,
  FolderGit2Icon,
  MailIcon,
  FileUserIcon,
} from "lucide-react";
import { TooltipButton } from "@/components/shared/TooltipButton";
import { useAtomValue, useSetAtom } from "jotai";
import {
  activeFaceAtom,
  drawerOpenAtom,
  isMobileAtom,
  navigateToFaceAtom,
} from "@/atoms/atomStore";
import { Separator } from "@/components/shared/ui/separator";

interface NavigationProps {
  variant?: "default" | "inverse";
  orientation?: "horizontal" | "vertical";
}

export const Navigation = ({
  variant = "default",
  orientation = "horizontal",
}: NavigationProps) => {
  const activeFace = useAtomValue(activeFaceAtom);
  const navigateToFace = useSetAtom(navigateToFaceAtom);
  const setDrawerOpen = useSetAtom(drawerOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);

  // Color scheme based on variant
  const iconColorClass =
    variant === "inverse" ? "text-foreground" : "text-white dark:text-muted";

  return (
    <ButtonFrame variant={variant} orientation={orientation}>
      <div
        className={`${
          isMobile
            ? "flex flex-col items-start w-full px-4"
            : "flex flex-row gap-2 w-fit"
        }`}
      >
        <TooltipButton
          tooltip={activeFace === "chat" ? false : true}
          disabled={activeFace === "chat"}
          inputIcon={
            <div className={iconColorClass}>
              <MessageSquareTextIcon
                style={{ width: "18px", height: "18px" }}
              />
            </div>
          }
          inputText={isMobile ? "Chat & Homepage" : undefined}
          tooltipText={activeFace !== "chat" ? "Open Chat" : ""}
          handleClick={() => {
            navigateToFace({ face: "chat", direction: "forward" });
            if (isMobile) {
              setDrawerOpen(false);
            }
          }}
          state={true}
          round={true}
          size={10}
        />
        {isMobile && <Separator />}
        <TooltipButton
          tooltip={activeFace === "blog" ? false : true}
          disabled={activeFace === "blog"}
          inputIcon={
            <div className={iconColorClass}>
              <CircleUserIcon style={{ width: "18px", height: "18px" }} />
            </div>
          }
          inputText={isMobile ? "Blog" : undefined}
          tooltipText={"Blog"}
          handleClick={() => {
            navigateToFace({ face: "blog", direction: "forward" });
            if (isMobile) {
              setDrawerOpen(false);
            }
          }}
          state={true}
          round={true}
          size={10}
        />
        {isMobile && <Separator />}
        <TooltipButton
          tooltip={activeFace === "projects" ? false : true}
          disabled={activeFace === "projects"}
          inputIcon={
            <div className={iconColorClass}>
              <FolderGit2Icon style={{ width: "18px", height: "18px" }} />
            </div>
          }
          inputText={isMobile ? "Projects Gallery" : undefined}
          tooltipText={"Projects"}
          handleClick={() => {
            navigateToFace({ face: "projects", direction: "forward" });
            if (isMobile) {
              setDrawerOpen(false);
            }
          }}
          state={true}
          round={true}
          size={10}
        />
        {isMobile && <Separator />}
        <TooltipButton
          tooltip={activeFace === "contact" ? false : true}
          disabled={activeFace === "contact"}
          inputIcon={
            <div className={iconColorClass}>
              <MailIcon style={{ width: "18px", height: "18px" }} />
            </div>
          }
          inputText={isMobile ? "Contact" : undefined}
          tooltipText={"Contact"}
          handleClick={() => {
            navigateToFace({ face: "contact", direction: "forward" });
            if (isMobile) {
              setDrawerOpen(false);
            }
          }}
          state={true}
          round={true}
          size={10}
        />
        {isMobile && <Separator />}
        <TooltipButton
          tooltip={activeFace === "resume" ? false : true}
          disabled={activeFace === "resume"}
          inputIcon={
            <div className={iconColorClass}>
              <FileUserIcon style={{ width: "18px", height: "18px" }} />
            </div>
          }
          inputText={isMobile ? "Resume" : undefined}
          tooltipText={"Resume"}
          handleClick={() => {
            navigateToFace({ face: "resume", direction: "forward" });
            if (isMobile) {
              setDrawerOpen(false);
            }
          }}
          state={true}
          round={true}
          size={10}
        />
      </div>
    </ButtonFrame>
  );
};
