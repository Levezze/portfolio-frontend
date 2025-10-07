"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { createPortal } from "react-dom";
import { Textarea } from "@/components/shared/ui/textarea";
import {
  activeInputElementAtom,
  keyboardVisibleAtom,
  isMobileAtom,
} from "@/atoms/atomStore";

export const FloatingInputMirror: React.FC = () => {
  const activeInput = useAtomValue(activeInputElementAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);
  const isMobile = useAtomValue(isMobileAtom);

  const floatingRef = useRef<HTMLTextAreaElement>(null);
  const isUpdating = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const isVisible = isMobile && keyboardVisible && activeInput !== null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // When visible, copy value and focus
  useEffect(() => {
    if (isVisible && floatingRef.current && activeInput) {
      floatingRef.current.value = activeInput.value;
      floatingRef.current.focus();
    }
  }, [isVisible, activeInput]);

  // One-way sync: floating → actual
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeInput || isUpdating.current) return;

    isUpdating.current = true;
    const newValue = e.target.value;

    // Use native setter to bypass React's input tracking
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    if (activeInput instanceof HTMLInputElement) {
      nativeInputValueSetter?.call(activeInput, newValue);
    } else if (activeInput instanceof HTMLTextAreaElement) {
      nativeTextAreaValueSetter?.call(activeInput, newValue);
    }

    // Dispatch input event for React
    activeInput.dispatchEvent(new Event("input", { bubbles: true }));

    isUpdating.current = false;
  };

  // Enter submits for single-line inputs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      activeInput instanceof HTMLInputElement
    ) {
      e.preventDefault();
      activeInput.closest("form")?.requestSubmit();
    }
  };

  if (!isMounted || !isVisible) return null;

  return createPortal(
    <div className="fixed left-0 right-0 bottom-0 z-[9999] p-2 bg-background/15">
      <Textarea
        ref={floatingRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={activeInput?.placeholder || "Type here..."}
        className="resize-none overflow-y-auto min-h-[2.5rem] max-h-[7.5rem] rounded-[25px] bg-transparent border-none focus-visible:ring-0"
        rows={1}
      />
    </div>,
    document.body
  );
};
