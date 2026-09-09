import { tool, type InferUITools, type ToolSet, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { getContactInfo, getExperience, getProjects, getSkills, searchContent } from "@/lib/knowledge";
import { PAGE_TOOLS, PLATFORMS, SECTIONS } from "./page-tools";

const empty = (v: string) => (v.trim() === "" ? undefined : v.trim());

/**
 * Server tools carry `execute` and run inside the route handler against site.json
 * or public APIs. Page tools have no `execute`: the browser runs them via
 * `onToolCall` and reports back with `addToolOutput`.
 *
 * Schemas stay flat (strings, enums, no defaults/transforms) for Groq's JSON-schema validation.
 */
export const tools = {
  search_content: tool({
    description:
      "Find every mention of a technology, tool, metric, company or term across Shreyas's experience, projects, skills and bio, with its source. Call this first whenever a question names something specific.",
    inputSchema: z.object({
      query: z.string().describe('The term to look for, e.g. "Mastra", "Maglev", "p95"'),
    }),
    execute: async ({ query }) => {
      const hits = searchContent(query);
      return hits.length ? { hits } : { hits, note: `Nothing in the content mentions "${query}". Say so instead of guessing.` };
    },
  }),

  get_experience: tool({
    description: "Shreyas's work history: role, dates, and achievement highlights with metrics. Filter by company or pass an empty string for all.",
    inputSchema: z.object({
      company: z.string().describe('Company name to filter by, e.g. "Skylark". Empty string returns every role.'),
    }),
    execute: async ({ company }) => getExperience(empty(company)),
  }),

  get_projects: tool({
    description: "Shreyas's side projects with summary, how they work, tech stack, and demo/source links. Filter by name or pass an empty string for all.",
    inputSchema: z.object({
      name: z.string().describe('Project name to filter by, e.g. "Gor". Empty string returns every project.'),
    }),
    execute: async ({ name }) => getProjects(empty(name)),
  }),

  get_skills: tool({
    description: 'Skills grouped by category. "(primary)" marks the tools he uses most.',
    inputSchema: z.object({
      category: z
        .string()
        .describe('One of: Languages, Frameworks, Infrastructure, Databases, Cloud, Exposure, Concepts, or "all".'),
    }),
    execute: async ({ category }) => getSkills(empty(category) ?? "all"),
  }),

  get_contact_info: tool({
    description: "Email, location, availability, profile links, and the résumé URL.",
    inputSchema: z.object({}),
    execute: async () => getContactInfo(),
  }),

  // ---- page tools (run in the browser) ----

  navigate_to_section: tool({
    description: "Scroll the page to a section. Only when the visitor explicitly asks to go to, see, or scroll to it.",
    inputSchema: z.object({
      section: z.enum(SECTIONS).describe("Section to scroll to"),
    }),
  }),

  set_theme: tool({
    description: "Switch the site between light and dark theme. Only on an explicit request; never set the theme it already has.",
    inputSchema: z.object({
      theme: z.enum(["light", "dark"]).describe("Theme to apply"),
    }),
  }),

  show_resume: tool({
    description: "Open the résumé viewer on the page. Use when the visitor asks to see or view the résumé/CV.",
    inputSchema: z.object({}),
  }),

  download_resume: tool({
    description: "Download the résumé PDF to the visitor's device. Only when they explicitly say download.",
    inputSchema: z.object({}),
  }),

  open_link: tool({
    description: "Open one of Shreyas's profiles in a new tab.",
    inputSchema: z.object({
      platform: z.enum(PLATFORMS).describe("Which profile to open"),
    }),
  }),

  open_project: tool({
    description: "Open a project's live demo or source repository in a new tab.",
    inputSchema: z.object({
      name: z.string().describe('Project name, e.g. "Gor" or "GeoQuiz"'),
      target: z.enum(["demo", "source"]).describe("Open the live demo or the source repository"),
    }),
  }),

  focus_contact_form: tool({
    description: "Scroll to the contact form and focus its first field. Use when the visitor wants to send Shreyas a message.",
    inputSchema: z.object({}),
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
export type ToolName = keyof typeof tools;

/** Re-exported with a `satisfies` so a typo in page-tools.ts fails the build here. */
export const PAGE_TOOL_NAMES = PAGE_TOOLS satisfies readonly ToolName[];
