"use client";
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantRuntime,
  useComposer,
  useThread,
} from "@assistant-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  Square,
} from "lucide-react";
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import * as m from "motion/react-m";
import { type FC, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import {
  gimliChoiceAtom,
  isMobileAtom,
  keyboardVisibleAtom,
  pushNavigationCallbackAtom,
} from "@/atoms/atomStore";
import { UserMessageAttachments } from "@/components/scene/chat/assistant-ui/attachment";
import { MarkdownText } from "@/components/scene/chat/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/scene/chat/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/scene/chat/assistant-ui/tooltip-icon-button";
import { FailedLoad } from "@/components/shared/alerts/FailedLoad";
import { BackButton } from "@/components/shared/BackButton";
import { ButtonFrame } from "@/components/shared/ButtonFrame";
import { LinkButton } from "@/components/shared/LinkButton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shared/ui/avatar";
import { Button } from "@/components/shared/ui/button";
import { Separator } from "@/components/shared/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";
import type { ChatConfig, WelcomeMessage } from "@/lib/api/schemas/chat";
import { getChatConfig } from "@/lib/api/services/chatService";
import { cn } from "@/lib/utils/general";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { useInputValidation } from "@/hooks/useInputValidation";
import { CharacterCounter } from "./CharacterCounter";
import { RateLimitWarning } from "./RateLimitWarning";
import { ValidationError } from "./ValidationError";
import Image from "next/image";

const ChatBackButton: FC = () => {
  const runtime = useAssistantRuntime();
  const thread = useThread();
  const pushCallback = useSetAtom(pushNavigationCallbackAtom);
  const hasPushedCallbackRef = useRef(false);
  const trackEvent = useAnalytics();

  // Track when thread starts (first message sent) and push navigation callback
  useEffect(() => {
    const hasMessages = thread.messages && thread.messages.length > 0;

    if (hasMessages && !hasPushedCallbackRef.current) {
      // Thread has started - track conversation start
      trackEvent("chat_conversation_started");

      // Push callback to reset thread
      pushCallback({
        callback: () => runtime.switchToNewThread(),
        label: "Start new chat",
      });
      hasPushedCallbackRef.current = true;
    } else if (!hasMessages && hasPushedCallbackRef.current) {
      // Thread was reset - allow callback to be pushed again on next thread
      hasPushedCallbackRef.current = false;
    }
  }, [thread.messages, runtime, pushCallback, trackEvent]);

  // Only show if thread has messages
  if (!thread.messages || thread.messages.length === 0) {
    return null;
  }

  const handleReset = () => {
    runtime.switchToNewThread();
  };

  return <BackButton onClick={handleReset} tooltip="Start new chat" />;
};

export const Thread: FC = () => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);

  // Reverted: no dynamic keyboard padding logic

  const {
    data: chatConfig,
    isLoading,
    error,
  } = useSWR("chat-config", getChatConfig, {
    revalidateOnFocus: false,
    dedupingInterval: 50000,
    onError: (err) => {
      console.error("Failed to load chat config:", err);
    },
  });

  if (error) return <FailedLoad />;

  return (
    <div className="relative h-full">
      <ChatBackButton />
      <div
        className={`h-full ${
          isLoading ? "opacity-0" : "opacity-100 transition-opacity"
        }`}
      >
        <LazyMotion features={domAnimation}>
          <MotionConfig reducedMotion="user">
            <ThreadPrimitive.Root className="aui-root aui-thread-root @container flex h-full flex-col bg-background">
              <ThreadPrimitive.Viewport
                className={cn(
                  "aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-auto",
                  isMobile && keyboardVisible && "pb-[35dvh]"
                )}
              >
                {chatConfig && <ThreadWelcome config={chatConfig} />}

                <ThreadPrimitive.Messages
                  components={{
                    UserMessage,
                    EditComposer,
                    AssistantMessage,
                  }}
                />
                <ThreadPrimitive.If empty={false}>
                  <div className="aui-thread-viewport-spacer min-h-8 grow" />
                </ThreadPrimitive.If>
                <Composer
                  chatConfig={chatConfig ?? null}
                  isLoading={isLoading}
                />
              </ThreadPrimitive.Viewport>
            </ThreadPrimitive.Root>
          </MotionConfig>
        </LazyMotion>
      </div>
    </div>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-[25px] p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const FakeAssistantMessage: FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [finalText, setFinalText] = useState(text);
  const gimliChoice = useAtomValue(gimliChoiceAtom);

  useEffect(() => {
    if (!text || text.length === 0) return;

    const timeout = setTimeout(() => {
      setFinalText(text);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [text]);

  useEffect(() => {
    if (!finalText || finalText.length === 0) return;

    setDisplayText("");
    let count = 0;
    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (count < finalText.length) {
          setDisplayText((prev) => {
            if (prev.length < finalText.length) {
              return finalText.slice(0, prev.length + 1);
            }
            return prev;
          });
          count++;
        } else {
          clearInterval(interval);
        }
      }, 7);
    }, 200);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [finalText]);

  return (
    <div
      className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in duration-200 fade-in slide-in-from-bottom-1"
      data-role="assistant"
    >
      <div className="flex">
        <Tooltip>
          <Avatar className="mr-3 mt-1 h-12 w-12 border shadow-sm shadow-muted-foreground/10">
            <TooltipTrigger>
              <AvatarImage
                src={`/gimli-ai/gimli-ai-avatar-${gimliChoice.choice}.webp`}
                alt="GimlAI, Lev's dwarf sidekick"
                className="object-cover"
              />
              <AvatarFallback>G</AvatarFallback>
            </TooltipTrigger>
          </Avatar>
          <TooltipContent>
            <p>{gimliChoice.mood} Gimli-AI</p>
          </TooltipContent>
        </Tooltip>
        <div className="aui-assistant-message-content mx-2 leading-7 break-words text-foreground">
          <p>{displayText}</p>
        </div>
      </div>
    </div>
  );
};

const ThreadWelcome: FC<{ config: ChatConfig }> = ({ config }) => {
  const welcome_messages = config.welcome_messages;
  const isMobile = useAtomValue(isMobileAtom);
  return (
    <ThreadPrimitive.Empty>
      <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-col h-full justify-around overflow-y-auto px-0 md:px-4 mobile-landscape:p-0">
        <div className="aui-thread-welcome-center flex w-full justify-center gap-4 md:gap-6">
          <div className="aui-thread-welcome-picture flex flex-col items-center justify-start pt-1 gap-1.5 md:gap-2">
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.0 }}
              className={`aui-thread-welcome-avatar relative self-stretch aspect-square ${
                isMobile
                  ? "h-28 w-28"
                  : "h-35 w-35 lg:h-42 lg:w-42 xl:h-52 xl:w-52"
              }`}
            >
              <Tooltip>
                <TooltipTrigger className="h-full w-full">
                  <Image
                    src="/images/photo-lev.jpg"
                    alt="Lev Zhitnik"
                    className="rounded-[25px] object-cover h-full w-full grayscale-15 border shadow-lg shadow-muted-foreground/10 dark:shadow-muted-foreground/2 hover:scale-102 transition-all duration-300 hover:shadow-md hover:animate-jiggle hover:grayscale-0"
                    unoptimized={true}
                    loading="lazy"
                    fill={true}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>That's me!</p>
                </TooltipContent>
              </Tooltip>
            </m.div>
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              <ButtonFrame
                variant="default"
                classNameAdditional="px-2 bg-foreground border-muted-foreground w-full shadow-md shadow-muted-foreground/10"
                border={false}
              >
                <LinkButton
                  className="text-background color-foreground size-4 md:size-4.5"
                  icon="linkedin"
                  linkUrl="https://www.linkedin.com/in/lev-zhitnik/"
                  tooltipText="LinkedIn profile"
                />
                <LinkButton
                  className="text-background color-foreground size-4 md:size-4.5"
                  icon="github"
                  linkUrl="https://github.com/Levezze"
                  tooltipText="GitHub profile"
                />
                <LinkButton
                  className="text-background color-foreground size-5 md:size-5.5"
                  icon="email"
                  linkUrl="mailto:contact@levezze.com"
                  tooltipText="Email me"
                />
              </ButtonFrame>
            </m.div>
          </div>
          <div className="aui-thread-welcome-message flex size-full flex-col justify-start">
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="aui-thread-welcome-message-motion-1 font-merriweather font-bold text-lg [@media(min-width:700px)_and_(min-height:700px)]:text-xl [@media(min-width:800px)_and_(min-height:800px)]:text-2xl md:mb-2"
            >
              {
                welcome_messages.filter(
                  (message: WelcomeMessage) =>
                    message.message_type === "primary"
                )[0]?.message_text
              }
            </m.div>
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
              className="aui-thread-welcome-message-motion-2 font-merriweather text-base [@media(min-width:700px)_and_(min-height:700px)]:text-lg [@media(min-width:800px)_and_(min-height:800px)]:text-xl text-muted-foreground/90 mb-2"
            >
              {
                welcome_messages.filter(
                  (message: WelcomeMessage) =>
                    message.message_type === "secondary"
                )[0]?.message_text
              }
            </m.div>
          </div>
        </div>
        <ThreadPrimitive.Empty>
          <ThreadWelcomeSuggestions suggestions={config?.suggestions || []} />
        </ThreadPrimitive.Empty>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC<{ suggestions: any[] }> = ({
  suggestions,
}) => {
  // Use suggestions from config, or fallback to hardcoded if empty
  const displaySuggestions =
    suggestions && suggestions.length > 0
      ? suggestions
      : [
          {
            title: "More about me?",
            label: "My AI sales pitch",
            action:
              "Write here about who I am, what I do, and why I'm doing it.",
          },
          {
            title: "My resume",
            label: "View my resume PDF",
            action: "Go to the resume page",
          },
          {
            title: "Projects",
            label: "Some of my recent projects",
            action: "Go to the contact page",
          },
          {
            title: "Contact me!",
            label: "Contact form submission",
            action: "Go to the contact page",
          },
        ];

  return (
    <div className="aui-thread-welcome-suggestions py-2 flex flex-col w-full gap-4 overflow-y-auto @md:grid @md:grid-cols-2 @md:overflow-y-visible">
      {displaySuggestions.map((suggestedAction, index) => (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="aui-thread-welcome-suggestion-display [&:nth-child(n+3)]:hidden [@media(min-height:800px)]:[&:nth-child(n+3)]:block @md:[&:nth-child(n+3)]:block [@media(max-height:500px)]:[&:nth-child(n+3)]:hidden"
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestedAction.action}
            method={suggestedAction.method || "replace"}
            autoSend={
              suggestedAction.auto_send !== undefined
                ? suggestedAction.auto_send
                : true
            }
            asChild
          >
            <Button
              variant="ghost"
              className="aui-thread-welcome-suggestion w-full h-auto flex flex-col items-start justify-around gap-0.5 px-6 rounded-[25px] cursor-pointer [@media(max-width:600px)_or_(max-height:600px)]:gap-0 shadow-sm shadow-muted-foreground/10"
              aria-label={suggestedAction.action}
              matchBgColor={true}
            >
              <span className="aui-thread-welcome-suggestion-text-1 text-base font-inter font-normal text-foreground dark:text-background [@media(max-width:600px)_or_(max-height:600px)]:text-sm m-0 p-0">
                {suggestedAction.title}
              </span>
              <span className="aui-thread-welcome-suggestion-text-2 text-md font-inter font-light text-muted-foreground dark:text-muted">
                {suggestedAction.label}
              </span>
            </Button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};

const Composer: FC<{ chatConfig: ChatConfig | null; isLoading: boolean }> = ({
  chatConfig,
  isLoading,
}) => {
  const isMobile = useAtomValue(isMobileAtom);

  // Security hooks
  const MAX_LENGTH = 1000;
  const { canSend, remainingTime, consumeToken } = useRateLimiter(5, 60000); // 5 messages per minute
  const { sanitizePaste, getErrors } = useInputValidation(MAX_LENGTH);

  // State for validation feedback
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile) return;

    // If Enter pressed without Shift, blur after send
    if (e.key === "Enter" && !e.shiftKey) {
      setTimeout(() => {
        const input = document.querySelector(
          ".aui-composer-input"
        ) as HTMLElement;
        if (input) {
          input.blur();
        }
      }, 0);
    }
  };

  // Handle paste events - sanitize HTML
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData?.getData("text/plain");
    if (!pastedText) return;

    const cleaned = sanitizePaste(pastedText);

    // If cleaned text differs from original, prevent default and insert cleaned
    if (cleaned !== pastedText) {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      const currentValue = target.value;
      const newValue =
        currentValue.substring(0, start) +
        cleaned +
        currentValue.substring(end);

      // Manually update the input value
      target.value = newValue;
      target.setSelectionRange(start + cleaned.length, start + cleaned.length);

      // Trigger input event to update @assistant-ui state
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  // Validate input on change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const errors = getErrors(e.target.value);
    setValidationErrors(errors);
  };

  const text = useComposer((state) => state.text) || "";

  return (
    <>
      <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col overflow-visible rounded-t-md bg-background pb-4 md:px-4 md:pb-6 mobile-landscape:p-0">
        <ThreadScrollToBottom />
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center mb-4 font-inter">
            <Separator className="my-4 w-full mobile-landscape:hidden" />
            {chatConfig && !isLoading && (
              <FakeAssistantMessage
                text={
                  chatConfig.welcome_messages.filter(
                    (message: WelcomeMessage) =>
                      message.message_type === "assistant"
                  )[0]?.message_text as string
                }
              />
            )}
          </div>
        </ThreadPrimitive.Empty>

        {/* Security warnings - show above composer */}
        <div className="flex flex-col gap-2 mb-2">
          {!canSend && <RateLimitWarning remainingTime={remainingTime} />}
          {validationErrors.length > 0 && (
            <ValidationError errors={validationErrors} />
          )}
        </div>

        <ComposerPrimitive.Root className="aui-composer-root relative rounded-[25px] flex w-full flex-col bg-muted px-1 py-1 dark:border-muted-foreground/15 shadow-inner shadow-muted-foreground/5">
          <ComposerPrimitive.Input
            placeholder="Send a message..."
            className="aui-composer-input flex font-inter items-center justify-center mb-1 h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-2 text-base outline-none placeholder:text-muted-foreground focus:outline-primary"
            rows={1}
            maxLength={MAX_LENGTH}
            aria-label="Message input"
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onChange={handleChange}
          />
          <CharacterCounter value={text} maxLength={MAX_LENGTH} />
          <ComposerAction
            canSend={canSend}
            hasValidationErrors={validationErrors.length > 0}
            consumeToken={consumeToken}
          />
        </ComposerPrimitive.Root>
      </div>
    </>
  );
};

interface ComposerActionProps {
  canSend: boolean;
  hasValidationErrors: boolean;
  consumeToken: () => boolean;
}

const ComposerAction: FC<ComposerActionProps> = ({
  canSend,
  hasValidationErrors,
  consumeToken,
}) => {
  const isMobile = useAtomValue(isMobileAtom);
  const trackEvent = useAnalytics();

  const handlePreventBlur = (e: React.PointerEvent) => {
    if (!isMobile) return;

    // Prevent input from blurring when button is tapped
    // This prevents layout shift from padding removal during tap
    e.preventDefault();
  };

  const handleSendClick = () => {
    // Check rate limit before sending
    if (!canSend) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Security] Rate limit exceeded - message blocked");
      }
      return;
    }

    // Check validation before sending
    if (hasValidationErrors) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Security] Validation errors - message blocked");
      }
      return;
    }

    // Consume rate limit token
    const consumed = consumeToken();
    if (!consumed) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Security] Failed to consume token - message blocked");
      }
      return;
    }

    // Track message sent
    trackEvent("chat_message_sent");

    if (!isMobile) return;

    // Blur the input after the send action is triggered
    // Use setTimeout(0) to ensure the send happens first
    setTimeout(() => {
      const input = document.querySelector(
        ".aui-composer-input"
      ) as HTMLElement;
      if (input) {
        input.blur();
      }
    }, 0);
  };

  // Disable send button when rate limited or has validation errors
  const isDisabled = !canSend || hasValidationErrors;

  return (
    <div className="aui-composer-action-wrapper absolute bottom-1 right-2 mb-1 flex items-center ml-auto">
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild disabled={isDisabled}>
          <TooltipIconButton
            tooltip={
              isDisabled
                ? canSend
                  ? "Fix validation errors"
                  : "Rate limit reached"
                : "Send message"
            }
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            disabled={isDisabled}
            className="aui-composer-send size-[34px] rounded-full p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onPointerDown={handlePreventBlur}
            onClick={handleSendClick}
            aria-label="Send message"
          >
            <ArrowUpIcon className="aui-composer-send-icon size-5" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            className="aui-composer-cancel size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
            aria-label="Stop generating"
          >
            <Square className="aui-composer-cancel-icon size-3.5 fill-white dark:fill-black" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 font-inter rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  const gimliChoice = useAtomValue(gimliChoiceAtom);

  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 md:px-4 duration-200 fade-in slide-in-from-bottom-1 last:mb-24 font-inter"
        data-role="assistant"
      >
        <div className="flex">
          <Tooltip>
            <Avatar className="mr-3 mt-1 h-10 w-10 border shadow-sm shadow-muted-foreground/10">
              <TooltipTrigger className="flex align-top justify-start">
                <AvatarImage
                  src={`/gimli-ai/gimli-ai-avatar-${gimliChoice.choice}.webp`}
                  alt="GimlAI, Lev's dwarf sidekick"
                  className="object-cover"
                />
                <AvatarFallback>G</AvatarFallback>
              </TooltipTrigger>
            </Avatar>
            <TooltipContent>
              <p>{gimliChoice.mood} Gimli-AI</p>
            </TooltipContent>
          </Tooltip>
          <div className="aui-assistant-message-content mx-2 leading-7 break-words text-foreground">
            <MessagePrimitive.Parts
              components={{
                Text: MarkdownText,
                tools: { Fallback: ToolFallback },
              }}
            />
            <MessageError />
          </div>
        </div>

        <div className="aui-assistant-message-footer mt-2 ml-2 flex">
          <BranchPicker />
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm font-inter"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-user-message-root font-inter mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 md:px-4 py-4 duration-200 fade-in slide-in-from-bottom-1 first:mt-3 last:mb-5 [&:where(>*)]:col-start-2"
        data-role="user"
      >
        <UserMessageAttachments />

        <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
          <div className="aui-user-message-content rounded-[25px] bg-muted px-5 py-2.5 break-words text-foreground">
            <MessagePrimitive.Parts />
          </div>
          <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
            <UserActionBar />
          </div>
        </div>

        <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4 font-inter">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-7/8 flex-col rounded-xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
          autoFocus
        />

        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" aria-label="Cancel edit">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" aria-label="Update message">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-xs text-muted-foreground font-inter",
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
