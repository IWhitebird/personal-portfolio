"use client";

import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";
import { useMounted } from "@/hooks/useMounted";
import { track } from "@/lib/analytics";

const ICON = "absolute inset-0 transition-[opacity,transform] duration-300 ease-out-quart";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Toggle theme"}
      onClick={() => {
        const next = dark ? "light" : "dark";
        setTheme(next);
        track("theme_change", { theme: next });
      }}
    >
      <span aria-hidden className="relative block h-[17px] w-[17px]">
        <FiSun size={17} className={`${ICON} ${mounted && dark ? "rotate-0 opacity-100" : "rotate-90 opacity-0"}`} />
        <FiMoon size={17} className={`${ICON} ${mounted && !dark ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`} />
      </span>
    </button>
  );
}
