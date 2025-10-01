import React, { useState } from "react";
import { ButtonFrame } from "../shared/ButtonFrame";
import {
  MessageSquareTextIcon,
  CircleUserIcon,
  FolderGit2Icon,
  MailIcon,
  FileUserIcon,
} from "lucide-react";
import { TooltipButton } from "../shared/TooltipButton";
import { useAtom } from "jotai";
import { activeFaceAtom, drawerOpenAtom } from "@/atoms/atomStore";
import { useIsMobile } from "@/hooks/useIsMobile";

interface NavigationProps {
  variant?: "default" | "inverse";
}

export const Navigation = ({ variant = "default" }: NavigationProps) => {
  const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
  const [drawerOpen, setDrawerOpen] = useAtom(drawerOpenAtom);
  const isMobile = useIsMobile();

  // Color scheme based on variant
  const iconColorClass =
    variant === "inverse" ? "text-foreground" : "text-white dark:text-muted";

  return (
    <ButtonFrame variant={variant}>
      <TooltipButton
        tooltip={activeFace === "chat" ? false : true}
        disabled={activeFace === "chat"}
        inputIcon={
          <div className={iconColorClass}>
            <MessageSquareTextIcon style={{ width: "18px", height: "18px" }} />
          </div>
        }
        tooltipText={activeFace !== "chat" ? "Open Chat" : ""}
        handleClick={() => {
          setActiveFace("chat");
          if (isMobile) {
            setDrawerOpen(false);
          }
        }}
        state={true}
        round={true}
        size={10}
      />
      <TooltipButton
        tooltip={activeFace === "about" ? false : true}
        disabled={activeFace === "about"}
        inputIcon={
          <div className={iconColorClass}>
            <CircleUserIcon style={{ width: "18px", height: "18px" }} />
          </div>
        }
        tooltipText={"About"}
        handleClick={() => {
          setActiveFace("about");
          if (isMobile) {
            setDrawerOpen(false);
          }
        }}
        state={true}
        round={true}
        size={10}
      />
      <TooltipButton
        tooltip={activeFace === "projects" ? false : true}
        disabled={activeFace === "projects"}
        inputIcon={
          <div className={iconColorClass}>
            <FolderGit2Icon style={{ width: "18px", height: "18px" }} />
          </div>
        }
        tooltipText={"Projects"}
        handleClick={() => {
          setActiveFace("projects");
          if (isMobile) {
            setDrawerOpen(false);
          }
        }}
        state={true}
        round={true}
        size={10}
      />
      <TooltipButton
        tooltip={activeFace === "contact" ? false : true}
        disabled={activeFace === "contact"}
        inputIcon={
          <div className={iconColorClass}>
            <MailIcon style={{ width: "18px", height: "18px" }} />
          </div>
        }
        tooltipText={"Contact"}
        handleClick={() => {
          setActiveFace("contact");
          if (isMobile) {
            setDrawerOpen(false);
          }
        }}
        state={true}
        round={true}
        size={10}
      />
      <TooltipButton
        tooltip={activeFace === "resume" ? false : true}
        disabled={activeFace === "resume"}
        inputIcon={
          <div className={iconColorClass}>
            <FileUserIcon style={{ width: "18px", height: "18px" }} />
          </div>
        }
        tooltipText={"Resume"}
        handleClick={() => {
          setActiveFace("resume");
          if (isMobile) {
            setDrawerOpen(false);
          }
        }}
        state={true}
        round={true}
        size={10}
      />
    </ButtonFrame>
  );
};
