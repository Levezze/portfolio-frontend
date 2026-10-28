"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { wsManager } from "@/lib/api/core/wsManager";
import {
  errorReply,
  messagesLeft,
  restoreTurns,
  type ServerMessage,
  step,
  type Turn,
  type Typing,
  toWire,
  typeStep,
} from "./chat";
import type { NavState } from "./LabNav";

/**
 * The lab chat over the site's existing WebSocket. Connects on the first
 * send, not on mount, so a page load with the backend down stays quiet. A
 * reply that has not started within FIRST_TOKEN_MS counts as offline:
 * wsManager queues sends while disconnected and never fails them, so without
 * this timer a reply would wait forever.
 *
 * Replies arrive in a burst and are typed out on screen (typeStep). The
 * stored turns always hold the full text; only what's shown is cut short.
 *
 * A chat takes CHAT_LIMIT messages, then asks for a new one (reset).
 *
 * The conversation is kept in localStorage so a reload carries on where it
 * left off. The backend is stateless (every send carries the whole history),
 * so nothing else needs restoring.
 */

const FIRST_TOKEN_MS = 8000;
const STORAGE_KEY = "levezze-chat";

export type ChatStatus = "idle" | "waiting" | "streaming" | "offline";

export function useLabChat(nav: NavState) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  // Characters of the last reply on screen while it types; null otherwise.
  const [shown, setShown] = useState<number | null>(null);
  // nav.go closes over the app's current page and phase; read it fresh.
  const navRef = useRef(nav);
  navRef.current = nav;
  const cleanup = useRef<(() => void) | null>(null);
  const frame = useRef(0);

  useEffect(
    () => () => {
      cleanup.current?.();
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  // Read after mount, not during render, so the server HTML still matches.
  const restored = useRef(false);
  useEffect(() => {
    try {
      setTurns(restoreTurns(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // Storage can be blocked; the chat simply starts fresh.
    }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
    } catch {
      // Same: no storage, no memory across reloads.
    }
  }, [turns]);

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || status === "waiting" || status === "streaming") return;
      if (messagesLeft(turns) === 0) return;
      const history: Turn[] = [...turns, { role: "user", text: content }];
      setTurns([...history, { role: "assistant", text: "" }]);
      setStatus("waiting");

      const id = uuidv4();
      let reply = "";
      let started = false;
      let ended: ChatStatus | null = null;
      let goTo: number | undefined;
      let typing: Typing = { shown: 0, rate: 0 };
      let last = 0;
      const setReply = (t: string, error = false) =>
        setTurns((all) => [
          ...all.slice(0, -1),
          error
            ? { role: "assistant", text: t, error }
            : { role: "assistant", text: t },
        ]);

      // Once the reply is fully on screen: settle the status, then turn the
      // page if a tool asked to, letting the sentence land first.
      const settle = () => {
        if (ended === null) return;
        setShown(null);
        setStatus(ended);
        if (goTo !== undefined) {
          const to = goTo;
          setTimeout(() => navRef.current.go(to), 600);
        }
      };

      const tick = (now: number) => {
        typing = typeStep(typing, reply.length, last ? now - last : 16);
        last = now;
        setShown(Math.floor(typing.shown));
        setStatus((st) => (st === "waiting" ? "streaming" : st));
        if (typing.shown < reply.length) {
          frame.current = requestAnimationFrame(tick);
          return;
        }
        frame.current = 0;
        settle();
      };
      const type = () => {
        if (frame.current) return;
        // Set with the new text, so the full reply never flashes for a frame.
        setShown(Math.floor(typing.shown));
        last = 0;
        frame.current = requestAnimationFrame(tick);
      };

      const finish = (next: ChatStatus) => {
        cleanup.current?.();
        cleanup.current = null;
        ended = next;
        // Drop an assistant bubble that never got any text.
        if (!reply)
          setTurns((all) =>
            all.at(-1)?.role === "assistant" && !all.at(-1)?.text
              ? all.slice(0, -1)
              : all,
          );
        if (!frame.current) settle();
      };

      const timer = setTimeout(() => {
        if (!started) finish("offline");
      }, FIRST_TOKEN_MS);

      const offMessage = wsManager.on("message", (raw: unknown) => {
        const msg = raw as ServerMessage & { message_id?: string };
        if (msg.message_id !== id) return;
        started = true;
        const s = step(reply, msg);
        if (s.text !== reply) {
          reply = s.text;
          setReply(reply);
          type();
        }
        if (s.goTo !== undefined) goTo = s.goTo;
        // A refusal or failure before any text: Gimli says what happened.
        if (s.error && !reply) {
          reply = errorReply(msg);
          setReply(reply, true);
          type();
        }
        if (s.done) finish("idle");
      });
      const offFailed = wsManager.on("reconnectFailed", () => {
        if (!started) finish("offline");
      });

      cleanup.current = () => {
        clearTimeout(timer);
        offMessage();
        offFailed();
      };

      wsManager.connect();
      wsManager.send({
        type: "message",
        content: toWire(history),
        message_id: id,
      });
    },
    [turns, status],
  );

  const visible = useMemo(() => {
    const end = turns.at(-1);
    if (shown === null || end?.role !== "assistant") return turns;
    return [...turns.slice(0, -1), { ...end, text: end.text.slice(0, shown) }];
  }, [turns, shown]);

  // Start over: the conversation, its count, and anything still in flight.
  const reset = useCallback(() => {
    cleanup.current?.();
    cleanup.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setShown(null);
    setTurns([]);
    setStatus("idle");
  }, []);

  return { turns: visible, status, send, left: messagesLeft(turns), reset };
}
