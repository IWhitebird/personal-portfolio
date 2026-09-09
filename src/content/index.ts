import raw from "./site.json";
import { SiteContentSchema, type Post, type Project, type SiteContent, type Skill } from "./schema";

/** Parsed once at module load; a schema violation fails the build loudly instead of rendering garbage. */
export const site: SiteContent = SiteContentSchema.parse(raw);

export const profile = site.profile;
export const experience = site.experience;
export const education = site.education;
export const achievements = site.achievements;
export const meta = site.meta;
export const chatSuggestions = site.chat.suggestions;

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function featuredProjects(): Project[] {
  return site.projects.filter((p) => p.featured).sort(byOrder);
}

export function otherProjects(): Project[] {
  return site.projects.filter((p) => !p.featured).sort(byOrder);
}

export function allProjects(): Project[] {
  return [...site.projects].sort(byOrder);
}

export function projectBySlug(slug: string): Project | undefined {
  return site.projects.find((p) => p.id === slug);
}

export function skillsByCategory(): { category: string; skills: Skill[] }[] {
  return site.skillCategories
    .map((category) => ({
      category,
      skills: site.skills
        .filter((s) => s.category === category)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.skills.length > 0);
}

/** Newest first. */
export function posts(): Post[] {
  return [...site.posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function postBySlug(slug: string): Post | undefined {
  return site.posts.find((p) => p.slug === slug);
}

export type SocialKey = keyof SiteContent["profile"]["socials"];

const SOCIAL_LABELS: Record<SocialKey, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  leetcode: "LeetCode",
  x: "X",
};

export function socialLinks(): { key: SocialKey; label: string; href: string }[] {
  return (Object.keys(SOCIAL_LABELS) as SocialKey[])
    .map((key) => ({ key, label: SOCIAL_LABELS[key], href: site.profile.socials[key] }))
    .filter((s): s is { key: SocialKey; label: string; href: string } => typeof s.href === "string");
}
