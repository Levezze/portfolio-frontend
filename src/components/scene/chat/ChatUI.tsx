import { useAtomValue } from "jotai";
import { cn } from "@/lib/utils/general";
import { isMobileAtom, keyboardVisibleAtom } from "@/atoms/atomStore";
import { Thread } from "./assistant-ui/thread";

const ChatUI = () => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);
  const keyboardActive = isMobile && keyboardVisible;

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col",
        keyboardActive ? "keyboard-adjusted" : "overflow-hidden",
      )}
    >
      <div className="flex-1 min-h-0">
        <Thread />
      </div>
    </div>
  );
};

export default ChatUI;
