import type { Project } from "@/lib/cms/schema";

/**
 * A quiet marker for anything that is not simply live. Cyan is the signal
 * colour, so work in progress earns it; archived does not.
 */
export function ProjectStatus({ status, className = "" }: { status: Project["status"]; className?: string }) {
  if (status === "live") return null;
  const wip = status === "wip";
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[12px] ${wip ? "text-accent" : "text-muted"} ${className}`}>
      <span aria-hidden className={`inline-block h-[6px] w-[6px] rounded-full ${wip ? "live-dot bg-accent" : "bg-muted/60"}`} />
      {wip ? "In progress" : "Archived"}
    </span>
  );
}
