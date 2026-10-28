"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { wsManager } from "@/lib/api/core/wsManager";
import {
  CUT_OFF_NOTE,
  errorReply,
  messagesLeft,
  OFFLINE_REPLY,
  restoreTurns,
  type ServerMessage,
  SLOW_REPLY,
  step,
  type Turn,
  type Typing,
  toWire,
  typeStep,
} from "./chat";
import type { NavState } from "./LabNav";

/**
 * The lab chat over the site's existing WebSocket. Connects on the first
 * send, not on mount, so a page load with the backend down stays quiet.
 *
 * Every reply ends, whatever the network does. wsManager queues sends while
 * disconnected and never fails them, so a watchdog does: a message the
 * server hasn't taken up (`start`) within START_MS is offline (and withdrawn
 * from the queue). The server then writes the whole reply before streaming
 * it, so it gets GENERATE_MS, and the stream STALL_MS between chunks. A
 * reply that runs out of time, or whose socket closes, ends as an error
 * turn, keeping any text that arrived; error turns neither count against
 * the chat nor go back to the model.
 *
 * Replies arrive in a burst and are typed out on screen (typeStep). The
 * stored turns always hold the full text; only what's shown is cut short.
 *
 * A chat takes CHAT_LIMIT messages, then asks for a new one (reset).
 *
 * The conversation is kept in localStorage so a reload carries on where it
 * left off; only settled turns are saved, never a reply mid-arrival. The
 * backend is stateless (every send carries the whole history), so nothing
 * else needs restoring.
 */

const START_MS = 8000;
const GENERATE_MS = 60000;
const STALL_MS = 20000;
/** Between tries at a page turn a tool asked for, while another runs. */
const TURN_RETRY_MS = 300;
const TURN_TRIES = 20;
const STORAGE_KEY = "levezze-chat";

export type ChatStatus = "idle" | "waiting" | "streaming" | "offline";

export function useLabChat(nav: NavState) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  // Characters of the last reply on screen while it types; null otherwise.
  const [shown, setShown] = useState<number | null>(null);
  // State, not a ref: the save effect must not run before the restored
  // turns have rendered, or it writes the empty initial list over them.
  const [restored, setRestored] = useState(false);
  // nav.go closes over the app's current page and phase; read it fresh.
  const navRef = useRef(nav);
  navRef.current = nav;
  // Stops the latest send: listeners, timers, typing.
  const stop = useRef<(() => void) | null>(null);
  // A page turn a tool asked for. It outlives its reply, so a quick next
  // message doesn't cancel it; a new chat or leaving does.
  const pageTurn = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const turnTo = useCallback((to: number, delay: number, tries: number) => {
    clearTimeout(pageTurn.current);
    pageTurn.current = setTimeout(() => {
      // Refused while another turn runs: try again once it has landed.
      if (!navRef.current.go(to) && tries > 1)
        turnTo(to, TURN_RETRY_MS, tries - 1);
    }, delay);
  }, []);

  useEffect(
    () => () => {
      stop.current?.();
      clearTimeout(pageTurn.current);
    },
    [],
  );

  // Read after mount, not during render, so the server HTML still matches.
  useEffect(() => {
    try {
      setTurns(restoreTurns(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // Storage can be blocked; the chat simply starts fresh.
    }
    setRestored(true);
  }, []);

  const busy = status === "waiting" || status === "streaming";
  useEffect(() => {
    if (!restored || busy) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
    } catch {
      // Same: no storage, no memory across reloads.
    }
  }, [turns, restored, busy]);

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      if (messagesLeft(turns) === 0) return;
      stop.current?.();
      const history: Turn[] = [...turns, { role: "user", text: content }];
      setTurns([...history, { role: "assistant", text: "" }]);
      setStatus("waiting");

      const id = uuidv4();
      let reply = "";
      let ended: ChatStatus | null = null;
      let goTo: number | undefined;
      let typing: Typing = { shown: 0, rate: 0 };
      let last = 0;
      let frame = 0;
      let started = false;
      let watchdog: ReturnType<typeof setTimeout> | undefined;
      let off: (() => void)[] = [];

      const setReply = (t: string, flags?: { error: true; cut?: true }) =>
        setTurns((all) => [
          ...all.slice(0, -1),
          { role: "assistant", text: t, ...flags },
        ]);

      // Once the reply is fully on screen: settle the status, then turn the
      // page if a tool asked to, letting the sentence land first.
      const settle = () => {
        if (ended === null) return;
        setShown(null);
        setStatus(ended);
        if (goTo !== undefined && ended === "idle")
          turnTo(goTo, 600, TURN_TRIES);
      };

      const tick = (now: number) => {
        typing = typeStep(typing, reply.length, last ? now - last : 16);
        last = now;
        setShown(Math.floor(typing.shown));
        setStatus((st) => (st === "waiting" ? "streaming" : st));
        if (typing.shown < reply.length) {
          frame = requestAnimationFrame(tick);
          return;
        }
        frame = 0;
        settle();
      };
      const type = () => {
        if (frame) return;
        // Set with the new text, so the full reply never flashes for a frame.
        setShown(Math.floor(typing.shown));
        last = 0;
        frame = requestAnimationFrame(tick);
      };

      const detach = () => {
        for (const f of off) f();
        off = [];
        clearTimeout(watchdog);
      };
      const finish = (next: ChatStatus) => {
        detach();
        ended = next;
        // Drop an assistant bubble that never got any text.
        if (!reply)
          setTurns((all) =>
            all.at(-1)?.role === "assistant" && !all.at(-1)?.text
              ? all.slice(0, -1)
              : all,
          );
        if (!frame) settle();
      };
      // `cut`: keep the text that arrived; the note shows beneath it.
      const fail = (t: string, next: ChatStatus, cut = false) => {
        reply = t;
        setReply(reply, cut ? { error: true, cut: true } : { error: true });
        type();
        finish(next);
      };

      // The connection closed, or the reply ran out of time.
      const drop = (closed: boolean) => {
        if (ended !== null) return;
        if (reply) return fail(reply, "idle", true);
        // The server took the message, so it was reachable after all.
        if (started) return fail(closed ? CUT_OFF_NOTE : SLOW_REPLY, "idle");
        wsManager.cancel(id);
        fail(OFFLINE_REPLY, "offline");
      };
      const arm = (ms: number) => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => drop(false), ms);
      };

      const onMessage = (raw: unknown) => {
        const msg = raw as ServerMessage & { message_id?: string };
        if (msg.message_id !== id || ended !== null) return;
        if (msg.type === "start") started = true;
        arm(msg.type === "start" ? GENERATE_MS : STALL_MS);
        const s = step(reply, msg);
        if (s.goTo !== undefined) goTo = s.goTo;
        if (s.error) {
          // A refusal before any text is Gimli's to explain; after some, the
          // reply was cut short and says so.
          return reply
            ? fail(reply, "idle", true)
            : fail(errorReply(msg), "idle");
        }
        if (s.text !== reply) {
          reply = s.text;
          setReply(reply);
          type();
        }
        if (s.done) finish("idle");
      };

      off = [
        wsManager.on("message", onMessage),
        wsManager.on("disconnected", () => drop(true)),
        wsManager.on("reconnectFailed", () => drop(true)),
      ];
      arm(START_MS);
      stop.current = () => {
        if (ended === null) wsManager.cancel(id);
        ended ??= "idle";
        detach();
        cancelAnimationFrame(frame);
        frame = 0;
      };

      wsManager.connect();
      wsManager.send({
        type: "message",
        content: toWire(history),
        message_id: id,
      });
    },
    [turns, busy, turnTo],
  );

  const visible = useMemo(() => {
    const end = turns.at(-1);
    if (shown === null || end?.role !== "assistant") return turns;
    // The cut-off note waits until the text above it has typed out.
    const typing = { ...end, text: end.text.slice(0, shown), cut: undefined };
    return [...turns.slice(0, -1), typing];
  }, [turns, shown]);

  // Start over: the conversation, its count, and anything still in flight.
  const reset = useCallback(() => {
    stop.current?.();
    stop.current = null;
    clearTimeout(pageTurn.current);
    setShown(null);
    setTurns([]);
    setStatus("idle");
  }, []);

  return { turns: visible, status, send, left: messagesLeft(turns), reset };
}
