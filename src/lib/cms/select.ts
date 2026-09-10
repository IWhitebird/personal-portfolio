import type { Post, Project, SiteContent, Skill, SocialKey } from "./schema";

/**
 * Pure views over a fetched `SiteContent`. Nothing here touches Notion or the
 * cache, so a route fetches the content once and shapes it with these.
 */

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function featuredProjects(content: SiteContent): Project[] {
  return content.projects.filter((p) => p.featured).sort(byOrder);
}

export function otherProjects(content: SiteContent): Project[] {
  return content.projects.filter((p) => !p.featured).sort(byOrder);
}

export function allProjects(content: SiteContent): Project[] {
  return [...content.projects].sort(byOrder);
}

export function projectBySlug(content: SiteContent, slug: string): Project | undefined {
  return content.projects.find((p) => p.id === slug);
}

export function skillsByCategory(content: SiteContent): { category: string; skills: Skill[] }[] {
  return content.skillCategories
    .map((category) => ({
      category,
      skills: content.skills
        .filter((s) => s.category === category)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.skills.length > 0);
}

/** Newest first. */
export function posts(content: SiteContent): Post[] {
  return [...content.posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function postBySlug(content: SiteContent, slug: string): Post | undefined {
  return content.posts.find((p) => p.slug === slug);
}

const SOCIAL_LABELS: Record<SocialKey, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  leetcode: "LeetCode",
  x: "X",
};

export type SocialLink = { key: SocialKey; label: string; href: string };

export function socialLinks(content: SiteContent): SocialLink[] {
  return (Object.keys(SOCIAL_LABELS) as SocialKey[])
    .map((key) => ({ key, label: SOCIAL_LABELS[key], href: content.profile.socials[key] }))
    .filter((s): s is SocialLink => typeof s.href === "string");
}

/** The X/Twitter handle, derived from the profile URL so it has one source. */
export function xHandle(content: SiteContent): string | undefined {
  return content.profile.socials.x?.split("/").filter(Boolean).pop();
}

/**
 * Cache Components requires at least one param from `generateStaticParams`, so
 * an empty list yields a placeholder that the page turns into a 404. Slugs that
 * appear later (a post published mid-hour) still render on request.
 */
export const PLACEHOLDER_SLUG = "__placeholder__";

export function slugParams(slugs: string[]): { slug: string }[] {
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: PLACEHOLDER_SLUG }];
}
