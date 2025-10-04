"use client";
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantRuntime,
  useThread,
} from "@assistant-ui/react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState, type FC } from "react";

import { UserMessageAttachments } from "@/components/scene/chat/assistant-ui/attachment";
import { MarkdownText } from "@/components/scene/chat/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/scene/chat/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/scene/chat/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/general";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import { getChatConfig } from "@/lib/api/services/chatService";
import { type WelcomeMessage, type ChatConfig } from "@/lib/api/schemas/chat";
import useSWR from "swr";
import { Separator } from "@/components/ui/separator";
import { useAtomValue } from "jotai";
import { gimliChoiceAtom } from "@/atoms/atomStore";
import { ButtonFrame } from "@/components/shared/ButtonFrame";
import { LinkButton } from "@/components/shared/LinkButton";
import { FailedLoad } from "@/components/shared/FailedLoad";
import { BackButton } from "@/components/shared/BackButton";

const ChatBackButton: FC = () => {
  const runtime = useAssistantRuntime();
  const thread = useThread();

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
            <ThreadPrimitive.Root
              className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
              style={{
                ["--thread-max-width" as string]: "44rem",
              }}
            >
              <ThreadPrimitive.Viewport className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-auto">
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
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
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
          <Avatar className="mr-3 mt-1 h-12 w-12 shadow-sm shadow-muted-foreground/10">
            <TooltipTrigger>
              <AvatarImage
                src={`/gimli-ai/gimli-ai-avatar-${gimliChoice}.webp`}
                alt="GimlAI, Lev's dwarf sidekick"
                className="object-cover"
              />
              <AvatarFallback>G</AvatarFallback>
            </TooltipTrigger>
          </Avatar>
          <TooltipContent>
            <p>Gimli-AI, Lev's sidekick</p>
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
  return (
    <ThreadPrimitive.Empty>
      <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-col h-full justify-around overflow-y-auto px-0 md:px-8 mobile-landscape:p-0">
        <div className="aui-thread-welcome-center flex w-full flex-col justify-center">
          <div className="aui-thread-welcome-message flex size-full flex-col justify-center">
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="aui-thread-welcome-message-motion-1 font-merriweather font-bold text-base [@media(min-width:700px)_and_(min-height:700px)]:text-xl [@media(min-width:800px)_and_(min-height:800px)]:text-2xl mb-2"
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
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
            >
              <ButtonFrame variant="inverse" classNameAdditional="px-2">
                <LinkButton
                  className="text-foreground color-foreground size-4"
                  icon="linkedin"
                  linkUrl="https://www.linkedin.com/in/lev-zhitnik/"
                  tooltipText="LinkedIn profile"
                />
                <LinkButton
                  className="text-foreground color-foreground size-4"
                  icon="github"
                  linkUrl="https://github.com/Levezze"
                  tooltipText="GitHub profile"
                />
                <LinkButton
                  className="text-foreground color-foreground size-5"
                  icon="email"
                  linkUrl="mailto:contact@levezze.com"
                  tooltipText="Email me"
                />
              </ButtonFrame>
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
              className="aui-thread-welcome-suggestion w-full h-auto hover:bg-accent/90 flex flex-col items-start justify-around gap-0.5 px-6 rounded-full cursor-pointer [@media(max-width:600px)_or_(max-height:600px)]:gap-0"
              // className="aui-thread-welcome-suggestion rounded-none h-auto w-full flex-1 flex-wrap items-start justify-start gap-0 border-none px-5 py-3 text-left text-sm @md:flex-col dark:hover:bg-accent/60 dark:text-background cursor-pointer"
              aria-label={suggestedAction.action}
              matchBgColor={true}
            >
              <span className="aui-thread-welcome-suggestion-text-1 text-base font-inter font-normal text-background [@media(max-width:600px)_or_(max-height:600px)]:text-sm m-0 p-0">
                {suggestedAction.title}
              </span>
              <span className="aui-thread-welcome-suggestion-text-2 text-md font-light text-muted-foreground dark:text-muted">
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
  return (
    <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col overflow-visible rounded-t-md bg-background pb-4 md:pb-6 mobile-landscape:p-0">
      <ThreadScrollToBottom />
      <ThreadPrimitive.Empty>
        <div className="flex flex-col items-center justify-center mb-4">
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
      <ComposerPrimitive.Root className="aui-composer-root relative rounded-full flex w-full flex-col bg-muted px-1 pt-2 dark:border-muted-foreground/15 shadow-inner shadow-muted-foreground/5">
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="aui-composer-input flex items-center justify-center mb-1 h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground focus:outline-primary"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper absolute bottom-1 right-2 mb-1 flex items-center ml-auto">
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            className="aui-composer-send size-[34px] rounded-full p-1"
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
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
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
        className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-200 fade-in slide-in-from-bottom-1 last:mb-24"
        data-role="assistant"
      >
        <div className="flex">
          <Tooltip>
            <Avatar className="mr-3 mt-1 h-10 w-10 shadow-sm shadow-muted-foreground/10">
              <TooltipTrigger className="flex align-top justify-start">
                <AvatarImage
                  src={`/gimli-ai/gimli-ai-avatar-${gimliChoice}.webp`}
                  alt="GimlAI, Lev's dwarf sidekick"
                  className="object-cover"
                />
                <AvatarFallback>G</AvatarFallback>
              </TooltipTrigger>
            </Avatar>
            <TooltipContent>
              <p>Gimli-AI, Lev's sidekick</p>
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
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
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
        className="aui-user-message-root mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 duration-200 fade-in slide-in-from-bottom-1 first:mt-3 last:mb-5 [&:where(>*)]:col-start-2"
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
    <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4">
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
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-xs text-muted-foreground",
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
