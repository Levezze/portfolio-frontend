"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { wsManager } from "@/lib/api/core/wsManager";
import {
  restoreTurns,
  type ServerMessage,
  step,
  type Turn,
  toWire,
} from "./chat";
import type { NavState } from "./LabNav";

/**
 * The lab chat over the site's existing WebSocket. Connects on the first
 * send, not on mount, so a page load with the backend down stays quiet. A
 * reply that has not started within FIRST_TOKEN_MS counts as offline:
 * wsManager queues sends while disconnected and never fails them, so without
 * this timer a reply would wait forever.
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
  // nav.go closes over the app's current page and phase; read it fresh.
  const navRef = useRef(nav);
  navRef.current = nav;
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

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
      const history: Turn[] = [...turns, { role: "user", text: content }];
      setTurns([...history, { role: "assistant", text: "" }]);
      setStatus("waiting");

      const id = uuidv4();
      let reply = "";
      let started = false;
      const setReply = (t: string) =>
        setTurns((all) => [
          ...all.slice(0, -1),
          { role: "assistant", text: t },
        ]);

      const finish = (next: ChatStatus) => {
        cleanup.current?.();
        cleanup.current = null;
        setStatus(next);
        // Drop an assistant bubble that never got any text.
        if (!reply)
          setTurns((all) =>
            all.at(-1)?.role === "assistant" && !all.at(-1)?.text
              ? all.slice(0, -1)
              : all,
          );
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
          setStatus("streaming");
        }
        if (s.goTo !== undefined) {
          const to = s.goTo;
          // Let the sentence land before the page turns.
          setTimeout(() => navRef.current.go(to), 600);
        }
        if (s.error) {
          reply = reply || `Something went wrong: ${s.error}`;
          setReply(reply);
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

  return { turns, status, send };
}
