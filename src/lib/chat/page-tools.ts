/**
 * The parts of the tool contract the browser needs.
 *
 * Kept free of imports on purpose: `tools.ts` reaches site.json through
 * `knowledge.ts`, so a client component importing a value from there would pull
 * the whole CMS snapshot into the bundle. Page tools live here instead.
 */
export const SECTIONS = ["home", "experience", "projects", "about", "contact"] as const;
export const PLATFORMS = ["github", "linkedin", "leetcode", "x"] as const;

/** Tools with no `execute`: the browser runs them and reports back with `addToolOutput`. */
export const PAGE_TOOLS = [
  "navigate_to_section",
  "set_theme",
  "show_resume",
  "download_resume",
  "open_link",
  "open_project",
  "focus_contact_form",
] as const;

export type SectionId = (typeof SECTIONS)[number];
export type Platform = (typeof PLATFORMS)[number];
export type PageToolName = (typeof PAGE_TOOLS)[number];

export function isPageTool(name: string): name is PageToolName {
  return (PAGE_TOOLS as readonly string[]).includes(name);
}
