"use client";

import dynamic from "next/dynamic";

const ResumeViewer = dynamic(() => import("./ResumeViewer").then((m) => m.ResumeViewer), {
  ssr: false,
  loading: () => <p className="py-12 text-center text-[13px] text-muted">Loading résumé…</p>,
});

export function ResumeStandalone({ src }: { src: string }) {
  return <ResumeViewer src={src} className="h-[calc(100svh-3.5rem)]" />;
}
