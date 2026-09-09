"use client";

import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { ResumeViewer } from "./ResumeViewer";

type Props = { src: string; onClose: () => void };

export default function ResumeModal({ src, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm md:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Résumé"
        className="flex h-full w-full max-w-[900px] flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <ResumeViewer
          src={src}
          className="h-full"
          toolbarEnd={
            <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close résumé">
              <FiX size={18} />
            </button>
          }
        />
      </div>
    </div>
  );
}
