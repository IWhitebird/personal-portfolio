import "server-only";
import { stripInlineMd } from "@/components/ui/InlineMd";
import type { SiteContent } from "@/lib/cms/schema";
import { allProjects, skillsByCategory, socialLinks } from "@/lib/cms/select";
import { formatRange } from "@/lib/format";
import { RESUME_PATH } from "@/lib/resume";
import { siteUrl } from "@/lib/site";

/**
 * Compact, plain-text views of the site content for the AI assistant.
 * The system prompt gets `summaryFacts()`; everything else is behind tools so
 * the per-request token budget stays small (Groq's free tier is 8K tokens/min).
 */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const matches = (haystack: string, needle?: string) => !needle || norm(haystack).includes(norm(needle));

export function getExperience(content: SiteContent, company?: string) {
  return content.experience
    .filter((e) => matches(e.company, company) || matches(e.role, company))
    .map((e) => ({
      company: e.company,
      role: e.role,
      period: formatRange(e.start, e.end),
      current: e.end === null,
      url: e.companyUrl,
      highlights: e.bullets.map(stripInlineMd),
    }));
}

export function getProjects(content: SiteContent, name?: string) {
  return allProjects(content)
    .filter((p) => matches(p.name, name))
    .map((p) => ({
      name: p.name,
      summary: p.summary,
      description: stripInlineMd(p.description),
      tech: p.tech,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      status: p.status,
      featured: p.featured,
    }));
}

export function getSkills(content: SiteContent, category?: string) {
  const groups = skillsByCategory(content).filter(
    (g) => !category || category === "all" || matches(g.category, category),
  );
  return Object.fromEntries(
    groups.map((g) => [g.category, g.skills.map((s) => (s.highlight ? `${s.name} (primary)` : s.name))]),
  );
}

export function getContactInfo(content: SiteContent) {
  const { profile } = content;
  return {
    email: profile.email,
    location: profile.location,
    availability: profile.availability.label,
    links: Object.fromEntries(socialLinks(content).map((s) => [s.label, s.href])),
    resumeUrl: `${siteUrl}${RESUME_PATH}`,
    contactForm: `${siteUrl}/#contact`,
  };
}

type Hit = { source: string; text: string };

/**
 * Every place a term appears across the content, with where it came from. This is
 * the grounding tool: asked "what did he build with Mastra?", the model can find the
 * Skylark bullet instead of guessing from a project list that never mentions it.
 * Tries the exact phrase first, then falls back to rows containing every word.
 */
export function searchContent(content: SiteContent, query: string): Hit[] {
  const q = norm(query);
  if (!q) return [];
  const words = q.split(" ").filter((w) => w.length > 1);
  const rows: { source: string; text: string; hay: string }[] = [];
  const add = (source: string, text: string) => rows.push({ source, text: stripInlineMd(text), hay: norm(text) });

  for (const e of content.experience) {
    const where = `${e.company}, ${e.role} (${formatRange(e.start, e.end)})`;
    for (const bullet of e.bullets) add(where, bullet);
  }
  for (const p of allProjects(content)) {
    add(`Project: ${p.name}`, `${p.summary} ${p.description} Built with ${p.tech.join(", ")}.`);
    for (const block of p.body) if ("text" in block) add(`Project: ${p.name} (case study)`, block.text);
  }
  for (const s of content.skills) add(`Skill, ${s.category}`, s.highlight ? `${s.name} (a primary tool)` : s.name);
  for (const a of content.achievements) add("Achievement", a.text);
  for (const paragraph of content.profile.bio) add("About", paragraph);

  const phrase = rows.filter((r) => r.hay.includes(q));
  const hits = phrase.length || words.length < 2 ? phrase : rows.filter((r) => words.every((w) => r.hay.includes(w)));
  return hits.slice(0, 8).map(({ source, text }) => ({ source, text }));
}

/** Short fact block for the system prompt. Aim for well under 300 tokens. */
export function summaryFacts(content: SiteContent): string {
  const { profile, experience, education, achievements, skills } = content;
  const current = experience.find((e) => e.end === null);
  const previous = experience.filter((e) => e !== current);
  const featured = allProjects(content).filter((p) => p.featured).map((p) => `${p.name} (${p.summary.replace(/\.$/, "")})`);
  const primarySkills = skills.filter((s) => s.highlight).map((s) => s.name);
  const edu = education[0];

  const lines = [
    `Name: ${profile.name}. ${profile.headline}`,
    current ? `Now: ${current.role} at ${current.company}, since ${formatRange(current.start, null).split(" – ")[0]}.` : null,
    previous.length ? `Before: ${previous.map((p) => `${p.role} at ${p.company} (${formatRange(p.start, p.end)})`).join("; ")}.` : null,
    edu ? `Education: ${edu.degree}, ${edu.institution}${edu.gpa ? `, GPA ${edu.gpa}` : ""} (${formatRange(edu.start, edu.end)}).` : null,
    achievements.length ? `Achievements: ${achievements.map((a) => stripInlineMd(a.text)).join(" ")}` : null,
    featured.length ? `Featured projects: ${featured.join("; ")}.` : null,
    primarySkills.length ? `Primary tools: ${primarySkills.join(", ")}.` : null,
    profile.location ? `Location: ${profile.location}.` : null,
    `Availability: ${profile.availability.label}.`,
    `Links: ${socialLinks(content).map((s) => `${s.label} ${s.href}`).join(", ")}${profile.email ? `, email ${profile.email}` : ""}.`,
  ];
  return lines.filter(Boolean).join("\n");
}
