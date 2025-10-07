import { navigateToFaceAtom } from "@/atoms/atomStore";
import { makeAssistantToolUI, useThreadRuntime } from "@assistant-ui/react";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { capitalFirstLetter } from "@/lib/utils/general";
import { type PagesType } from "@/lib/api/schemas/tools";

export const NavigationToolUI = makeAssistantToolUI<
  { page: PagesType },
  unknown
>({
  toolName: "navigate_page",
  render: ({ args, result, status }) => {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_DEBUG
    ) {
      console.log("🟢 NavigationToolUI rendering with:", {
        args,
        result,
        status,
      });
    }
    const navigateToFace = useSetAtom(navigateToFaceAtom);
    useEffect(() => {
      // AI-initiated navigation is considered "forward" navigation
      navigateToFace({ face: args.page, direction: "forward" });
    }, [args.page, navigateToFace]);

    return (
      <span>{`Taking you to the ${capitalFirstLetter(args.page)} page`}</span>
    );
  },
});
