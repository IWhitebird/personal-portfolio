"use client";

import { useEffect, useMemo, useState } from "react";

/** Shreyas's local time (IST), so a visitor knows whether a reply is likely right now. */
export function Clock({ className = "" }: { className?: string }) {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    [],
  );
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [formatter]);

  return (
    <span
      className={`font-mono text-[12px] tabular-nums text-fg-soft ${className}`}
      title="Current time in India"
      suppressHydrationWarning
    >
      {time ?? "--:--:--"} IST
    </span>
  );
}
