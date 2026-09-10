"use client";

import { useCallback } from "react";
import { useTheme } from "next-themes";
import { EVENTS, emit } from "@/lib/events";
import { scrollToSection } from "@/lib/scroll";
import { isPageTool, SECTIONS, type SectionId } from "@/lib/chat/page-tools";
import type { SocialKey } from "@/lib/cms/schema";

export type ProjectLink = { name: string; liveUrl?: string; githubUrl?: string };

export type ClientToolResult =
  | { kind: "ok"; output: Record<string, unknown> }
  | { kind: "error"; errorText: string }
  | { kind: "not-client" };

type Deps = {
  socials: { key: SocialKey; href: string }[];
  projects: ProjectLink[];
  resumePath: string;
};

/** Executes page tools requested by the model. Returns `not-client` for server tools so the caller ignores them. */
export function useClientTools({ socials, projects, resumePath }: Deps) {
  const { setTheme, resolvedTheme } = useTheme();

  return useCallback(
    (toolName: string, input: unknown): ClientToolResult => {
      if (!isPageTool(toolName)) return { kind: "not-client" };
      const args = (input ?? {}) as Record<string, string>;

      switch (toolName) {
        case "navigate_to_section": {
          const section = args.section as SectionId;
          if (!SECTIONS.includes(section)) return { kind: "error", errorText: `No section named ${args.section}` };
          emit(EVENTS.closeChat, { soft: true });
          if (!scrollToSection(section)) return { kind: "error", errorText: `No section named ${args.section}` };
          return { kind: "ok", output: { ok: true, section } };
        }
        case "set_theme": {
          if (args.theme !== "light" && args.theme !== "dark") return { kind: "error", errorText: "Unknown theme" };
          if (resolvedTheme === args.theme) return { kind: "ok", output: { ok: true, theme: args.theme, unchanged: true } };
          setTheme(args.theme);
          return { kind: "ok", output: { ok: true, theme: args.theme } };
        }
        case "show_resume": {
          emit(EVENTS.showResume);
          return { kind: "ok", output: { ok: true } };
        }
        case "download_resume": {
          const a = document.createElement("a");
          a.href = resumePath;
          a.download = "Shreyas_Patange_Resume.pdf";
          a.rel = "noopener";
          document.body.appendChild(a);
          a.click();
          a.remove();
          return { kind: "ok", output: { ok: true } };
        }
        case "open_link": {
          const href = socials.find((s) => s.key === args.platform)?.href;
          if (!href) return { kind: "error", errorText: `No ${args.platform} profile is configured` };
          window.open(href, "_blank", "noopener,noreferrer");
          return { kind: "ok", output: { ok: true, url: href } };
        }
        case "open_project": {
          const needle = (args.name ?? "").toLowerCase();
          const project = projects.find((p) => p.name.toLowerCase() === needle) ?? projects.find((p) => p.name.toLowerCase().includes(needle));
          if (!project) return { kind: "error", errorText: `No project named ${args.name}` };
          const url = args.target === "source" ? project.githubUrl ?? project.liveUrl : project.liveUrl ?? project.githubUrl;
          if (!url) return { kind: "error", errorText: `${project.name} has no ${args.target} link` };
          window.open(url, "_blank", "noopener,noreferrer");
          return { kind: "ok", output: { ok: true, project: project.name, url } };
        }
        case "focus_contact_form": {
          const contact = document.getElementById("contact");
          if (!contact) return { kind: "error", errorText: "Contact section not found" };
          emit(EVENTS.closeChat, { soft: true });
          scrollToSection("contact");
          window.setTimeout(() => contact.querySelector<HTMLInputElement>("input[type=email]")?.focus({ preventScroll: true }), 650);
          return { kind: "ok", output: { ok: true } };
        }
        default:
          return { kind: "not-client" };
      }
    },
    [socials, projects, resumePath, setTheme, resolvedTheme],
  );
}
