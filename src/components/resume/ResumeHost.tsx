"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { EVENTS, on } from "@/lib/events";

const ResumeModal = dynamic(() => import("./ResumeModal"), { ssr: false });

/** Mounts the PDF viewer only when something asks for it (hero button, nav, the AI assistant). */
export function ResumeHost({ src }: { src: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => on(EVENTS.showResume, () => setOpen(true)), []);

  return open ? <ResumeModal src={src} onClose={close} /> : null;
}
