import { allProjects, education, achievements, experience, profile, site, skillsByCategory, socialLinks } from "@/content";
import { stripInlineMd } from "@/components/ui/InlineMd";
import { formatRange } from "@/lib/format";

/**
 * Compact, plain-text views of the site content for the AI assistant.
 * The system prompt gets `summaryFacts()`; everything else is behind tools so
 * the per-request token budget stays small (Groq's free tier is 8K tokens/min).
 */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const matches = (haystack: string, needle?: string) => !needle || norm(haystack).includes(norm(needle));

export function getExperience(company?: string) {
  return experience
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

export function getProjects(name?: string) {
  return allProjects()
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

export function getSkills(category?: string) {
  const groups = skillsByCategory().filter((g) => !category || category === "all" || matches(g.category, category));
  return Object.fromEntries(groups.map((g) => [g.category, g.skills.map((s) => (s.highlight ? `${s.name} (primary)` : s.name))]));
}

export function getContactInfo() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? profile.siteUrl;
  return {
    email: profile.email,
    location: profile.location,
    availability: profile.availability.label,
    links: Object.fromEntries(socialLinks().map((s) => [s.label, s.href])),
    resumeUrl: new URL(profile.resume.path, siteUrl).toString(),
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
export function searchContent(query: string): Hit[] {
  const q = norm(query);
  if (!q) return [];
  const words = q.split(" ").filter((w) => w.length > 1);
  const rows: { source: string; text: string; hay: string }[] = [];
  const add = (source: string, text: string) => rows.push({ source, text: stripInlineMd(text), hay: norm(text) });

  for (const e of experience) {
    const where = `${e.company}, ${e.role} (${formatRange(e.start, e.end)})`;
    for (const bullet of e.bullets) add(where, bullet);
  }
  for (const p of allProjects()) {
    add(`Project: ${p.name}`, `${p.summary} ${p.description} Built with ${p.tech.join(", ")}.`);
    for (const block of p.body) if ("text" in block) add(`Project: ${p.name} (case study)`, block.text);
  }
  for (const s of site.skills) add(`Skill, ${s.category}`, s.highlight ? `${s.name} (a primary tool)` : s.name);
  for (const a of achievements) add("Achievement", a.text);
  for (const paragraph of profile.bio) add("About", paragraph);

  const phrase = rows.filter((r) => r.hay.includes(q));
  const hits = phrase.length || words.length < 2 ? phrase : rows.filter((r) => words.every((w) => r.hay.includes(w)));
  return hits.slice(0, 8).map(({ source, text }) => ({ source, text }));
}

export function getProjectByName(name: string) {
  const n = norm(name);
  return allProjects().find((p) => norm(p.name) === n) ?? allProjects().find((p) => norm(p.name).includes(n) || n.includes(norm(p.name)));
}

/** Short fact block for the system prompt. Aim for well under 300 tokens. */
export function summaryFacts(): string {
  const current = experience.find((e) => e.end === null);
  const previous = experience.filter((e) => e !== current);
  const featured = allProjects().filter((p) => p.featured).map((p) => `${p.name} (${p.summary.replace(/\.$/, "")})`);
  const primarySkills = site.skills.filter((s) => s.highlight).map((s) => s.name);
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
    `Links: ${socialLinks().map((s) => `${s.label} ${s.href}`).join(", ")}${profile.email ? `, email ${profile.email}` : ""}.`,
  ];
  return lines.filter(Boolean).join("\n");
}
