import { useAtomValue, useSetAtom } from "jotai";
import {
  CircleUserIcon,
  FileUserIcon,
  FolderGit2Icon,
  MailIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import {
  activeFaceAtom,
  drawerOpenAtom,
  isMobileAtom,
  navigateToFaceAtom,
} from "@/atoms/atomStore";
import { ButtonFrame } from "@/components/shared/ButtonFrame";
import { TooltipButton } from "@/components/shared/TooltipButton";
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
    variant === "inverse"
      ? "text-white dark:text-muted"
      : "text-secondary-foreground";

  const style = { width: "16px", height: "16px" };

  return (
    <ButtonFrame
      variant={variant}
      orientation={orientation}
      border={isMobile ? true : false}
    >
      <div
        className={`${
          isMobile
            ? "flex flex-col items-start w-full px-4"
            : "flex flex-row gap-2 w-fit"
        }`}
      >
        <TooltipButton
          tooltip={activeFace !== "chat"}
          disabled={activeFace === "chat"}
          inputIcon={
            <div className={iconColorClass}>
              <MessageSquareTextIcon style={style} />
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
          tooltip={activeFace !== "blog"}
          disabled={activeFace === "blog"}
          inputIcon={
            <div className={iconColorClass}>
              <CircleUserIcon style={style} />
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
          tooltip={activeFace !== "projects"}
          disabled={activeFace === "projects"}
          inputIcon={
            <div className={iconColorClass}>
              <FolderGit2Icon style={style} />
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
          tooltip={activeFace !== "contact"}
          disabled={activeFace === "contact"}
          inputIcon={
            <div className={iconColorClass}>
              <MailIcon style={style} />
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
          tooltip={activeFace !== "resume"}
          disabled={activeFace === "resume"}
          inputIcon={
            <div className={iconColorClass}>
              <FileUserIcon style={style} />
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
