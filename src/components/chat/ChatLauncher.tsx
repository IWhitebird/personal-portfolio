"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FiMessageSquare } from "react-icons/fi";
import { track } from "@/lib/analytics";
import { EVENTS, on } from "@/lib/events";
import type { ChatProps } from "./Chat";

const Chat = dynamic(() => import("./Chat"), { ssr: false });

type Props = Omit<ChatProps, "onClose">;

/**
 * Floating trigger + slide-in panel. The chat bundle (AI SDK, message
 * rendering) loads only when the panel is first opened.
 */
export function ChatLauncher(props: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const offOpen = on(EVENTS.openChat, () => setOpen(true));
    // "soft" closes come from page tools (navigate, contact form): on mobile the sheet hides the page, on desktop it can stay.
    const offClose = on<{ soft?: boolean } | undefined>(EVENTS.closeChat, (detail) => {
      if (!detail?.soft || window.matchMedia("(max-width: 767px)").matches) setOpen(false);
    });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    // Deep link: /#assistant opens the panel (deferred a tick to keep hydration deterministic).
    const deepLink = window.setTimeout(() => {
      if (window.location.hash === "#assistant") setOpen(true);
    }, 0);
    return () => {
      offOpen();
      offClose();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(deepLink);
    };
  }, []);

  useEffect(() => {
    if (open) track("chat_open");
  }, [open]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  const hidden = isMobile ? { y: "100%" } : { x: "100%" };
  const shown = isMobile ? { y: 0 } : { x: 0 };

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            key="fab"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="group fixed bottom-6 right-6 z-[70] flex h-12 items-center gap-2.5 rounded-full bg-fg px-4 text-[14px] font-medium text-bg shadow-panel transition-transform duration-200 ease-out-quart hover:scale-[1.03] active:scale-100 md:bottom-7 md:right-7"
            aria-label="Ask the assistant"
            title="Ask the assistant"
          >
            <FiMessageSquare size={17} aria-hidden />
            <span>Ask AI</span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[70] bg-black/30 md:bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={close}
            />
            <motion.aside
              key="panel"
              role="dialog"
              aria-label="AI assistant"
              className="fixed z-[75] flex flex-col overflow-hidden border-line bg-surface shadow-panel max-md:inset-x-0 max-md:bottom-0 max-md:h-[82svh] max-md:rounded-t-xl max-md:border-t md:inset-y-0 md:right-0 md:w-[420px] md:border-l"
              initial={reduceMotion ? { opacity: 0 } : hidden}
              animate={reduceMotion ? { opacity: 1 } : shown}
              exit={reduceMotion ? { opacity: 0 } : hidden}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <Chat {...props} onClose={close} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
