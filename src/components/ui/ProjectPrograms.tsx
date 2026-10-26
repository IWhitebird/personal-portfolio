/** Startup programs a project was accepted into, as quiet pills. Credit programs, so never "backed by". */
export function ProjectPrograms({ programs, className = "" }: { programs: string[]; className?: string }) {
  if (programs.length === 0) return null;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px] text-muted ${className}`}>
      <span className="mr-0.5">Accepted into</span>
      {programs.map((name) => (
        <span key={name} className="inline-flex items-center rounded-full border border-line-strong px-2.5 py-[3px] text-[12.5px] leading-none text-fg-soft">
          {name}
        </span>
      ))}
    </p>
  );
}
