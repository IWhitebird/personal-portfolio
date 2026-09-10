import { z } from "zod";

/**
 * Single source of truth for everything the site, the SEO metadata, and the AI
 * assistant know about Shreyas. `src/lib/cms/content.ts` builds this shape from
 * Notion on every regeneration and parses it here before anything renders.
 *
 * Types and zod only, so client components can `import type` from this file.
 *
 * Strings marked "md" allow a tiny inline-markdown subset: **bold**, `code`, [text](url).
 */

const md = z.string();
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "expected YYYY-MM");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
const urlOrEmpty = z.union([z.url(), z.literal("")]).transform((v) => (v === "" ? undefined : v));

export const SocialsSchema = z.object({
  github: z.url(),
  linkedin: z.url(),
  leetcode: z.url().optional(),
  x: z.url().optional(),
});

export const AvailabilitySchema = z.object({
  status: z.enum(["open", "not-looking", "consulting"]),
  label: z.string(),
});

export const ProfileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().optional(),
  email: z.email().optional(),
  siteUrl: z.url(),
  socials: SocialsSchema,
  availability: AvailabilitySchema,
  taglines: z.array(z.string()).default([]),
  seo: z.object({
    title: z.string(),
    description: z.string().max(200),
  }),
  bio: z.array(md).min(1),
  resume: z.object({
    /** The public Google Drive link the PDF is pulled from. Lives in Notion, never in code. */
    sourceUrl: z.url(),
    updatedAt: z.string().optional(),
  }),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  companyUrl: z.url().optional(),
  role: z.string(),
  location: z.string().optional(),
  start: yearMonth,
  end: yearMonth.nullable(),
  bullets: z.array(md),
});

export const ImageSchema = z.object({
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  description: md,
  images: z.array(ImageSchema),
  liveUrl: urlOrEmpty.optional(),
  githubUrl: urlOrEmpty.optional(),
  tech: z.array(z.string()),
  status: z.enum(["live", "wip", "archived"]).default("live"),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

export const SkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  highlight: z.boolean().default(false),
  order: z.number().default(0),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  gpa: z.string().optional(),
  location: z.string().optional(),
  start: yearMonth,
  end: yearMonth.nullable(),
});

export const AchievementSchema = z.object({
  text: md,
  url: z.url().optional(),
});

/** A list row. Notion nesting is flattened to a depth so the schema stays non-recursive. */
export const ListItemSchema = z.object({
  text: md,
  depth: z.number().int().min(0).max(2).default(0),
});

/** The block subset a Notion post body is flattened into when content is fetched. */
export const PostBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: md }),
  z.object({ type: z.literal("h2"), text: z.string(), slug: z.string() }),
  z.object({ type: z.literal("h3"), text: z.string(), slug: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(ListItemSchema) }),
  z.object({ type: z.literal("ol"), items: z.array(ListItemSchema) }),
  z.object({ type: z.literal("todo"), items: z.array(ListItemSchema.extend({ done: z.boolean() })) }),
  z.object({ type: z.literal("quote"), text: md }),
  z.object({ type: z.literal("callout"), text: md, emoji: z.string().optional() }),
  z.object({
    type: z.literal("code"),
    language: z.string(),
    code: z.string(),
    /** Shiki output with per-theme CSS variables, generated while fetching. */
    html: z.string(),
  }),
  z.object({ type: z.literal("image"), image: ImageSchema, caption: z.string().optional() }),
  z.object({ type: z.literal("bookmark"), url: z.url(), caption: z.string().optional() }),
  z.object({ type: z.literal("hr") }),
]);

export const PostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "expected a kebab-case slug"),
  title: z.string().min(1),
  date: isoDate,
  updated: isoDate.optional(),
  summary: z.string().min(1).max(300),
  tags: z.array(z.string()).default([]),
  readingMinutes: z.number().int().positive(),
  cover: ImageSchema.optional(),
  body: z.array(PostBlockSchema),
});

/** A project row plus its Notion page body, which is the case study at /projects/[slug]. */
export const ProjectWithBodySchema = ProjectSchema.extend({
  body: z.array(PostBlockSchema).default([]),
});

export const SiteContentSchema = z.object({
  profile: ProfileSchema,
  experience: z.array(ExperienceSchema),
  projects: z.array(ProjectWithBodySchema),
  skillCategories: z.array(z.string()),
  skills: z.array(SkillSchema),
  education: z.array(EducationSchema),
  achievements: z.array(AchievementSchema),
  posts: z.array(PostSchema).default([]),
  chat: z.object({
    suggestions: z.array(z.string()),
  }),
  meta: z.object({
    /** When this snapshot was built. Also the "now" every server render measures against. */
    fetchedAt: z.string(),
  }),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type Profile = SiteContent["profile"];
export type Experience = SiteContent["experience"][number];
export type Project = SiteContent["projects"][number];
export type Skill = SiteContent["skills"][number];
export type Education = SiteContent["education"][number];
export type Achievement = SiteContent["achievements"][number];
export type Post = SiteContent["posts"][number];
export type PostBlock = Post["body"][number];
export type PostHeading = Extract<PostBlock, { type: "h2" | "h3" }>;
export type ListItem = z.infer<typeof ListItemSchema>;
export type SocialKey = keyof SiteContent["profile"]["socials"];
