/**
 * Pulls site content from Notion into src/content/site.json and public/cms.
 *
 *   bun scripts/sync-content.ts            # warn and keep the committed snapshot on any failure (exit 0)
 *   bun scripts/sync-content.ts --strict   # exit 1 on failure (CI)
 *
 * Needs NOTION_TOKEN and NOTION_ROOT_PAGE_ID. The root page holds seven
 * databases titled Profile, Experience, Projects, Skills, Education,
 * Achievements, Posts (see scripts/seed-notion.ts for the exact property names).
 */
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { SiteContentSchema, type SiteContent } from "../src/content/schema";
import { pruneUnreferenced, storeImage, storeResume } from "./lib/assets";
import { readingMinutes, toPostBlocks } from "./lib/blocks";
import {
  assertProps,
  createNotion,
  discoverDatabases,
  pageBlocks,
  prop,
  queryAll,
  selectOptions,
  toYearMonth,
  type DiscoveredDatabase,
} from "./lib/notion";
import { toMd, toPlain } from "./lib/richtext";

const OUT = path.resolve("src/content/site.json");
const strict = process.argv.includes("--strict");

function fail(message: string, err?: unknown): never {
  console.error(`\n[sync] ${message}`);
  if (err) console.error(err instanceof Error ? err.message : err);
  if (strict) process.exit(1);
  console.warn("[sync] keeping the committed src/content/site.json snapshot\n");
  process.exit(0);
}

const AVAILABILITY: Record<string, SiteContent["profile"]["availability"]["status"]> = {
  open: "open",
  "not looking": "not-looking",
  consulting: "consulting",
};

const STATUS: Record<string, SiteContent["projects"][number]["status"]> = { live: "live", wip: "wip", archived: "archived" };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

async function main() {
  const token = process.env.NOTION_TOKEN;
  const rootPageId = process.env.NOTION_ROOT_PAGE_ID;
  if (!token || !rootPageId) fail("NOTION_TOKEN or NOTION_ROOT_PAGE_ID is not set; skipping Notion sync.");

  const previous = SiteContentSchema.parse(JSON.parse(await readFile(OUT, "utf8")));
  const notion = createNotion(token!);

  console.log("[sync] discovering databases…");
  const dbs = await discoverDatabases(notion, rootPageId!);
  const need = (title: Parameters<typeof dbs.get>[0]): DiscoveredDatabase => {
    const db = dbs.get(title);
    if (!db) throw new Error(`No child database titled "${title}" under the root page`);
    return db;
  };

  const profileDb = need("Profile");
  const experienceDb = need("Experience");
  const projectsDb = need("Projects");
  const skillsDb = need("Skills");
  const educationDb = need("Education");
  const achievementsDb = need("Achievements");
  const postsDb = dbs.get("Posts");

  assertProps(profileDb, ["Name", "Headline", "Site URL", "GitHub", "LinkedIn", "Availability", "SEO Title", "SEO Description", "Resume", "Taglines", "Chat Suggestions"]);
  assertProps(experienceDb, ["Company", "Role", "Dates", "Order", "Published"]);
  assertProps(projectsDb, ["Name", "Summary", "Screenshots", "Alt Text", "Tech", "Status", "Featured", "Order", "Published"]);
  assertProps(skillsDb, ["Name", "Category", "Order", "Highlight"]);
  assertProps(educationDb, ["Institution", "Degree", "Dates", "Order"]);
  assertProps(achievementsDb, ["Achievement", "Order"]);
  if (postsDb) assertProps(postsDb, ["Title", "Slug", "Date", "Summary", "Tags", "Published"]);

  const referenced = new Set<string>();

  // ---- Profile (single row) ----
  console.log("[sync] profile…");
  const [profilePage] = await queryAll(notion, profileDb);
  if (!profilePage) throw new Error("Profile database has no rows");
  const bioBlocks = await pageBlocks(notion, profilePage.id);
  const bio = bioBlocks.filter((b) => b.type === "paragraph").map((b) => toMd(b.paragraph.rich_text)).filter(Boolean);

  const resumeFile = prop.files(profilePage, "Resume")[0];
  const resumePath = resumeFile ? await storeResume(resumeFile.url) : previous.profile.resume.path;

  const profile: SiteContent["profile"] = {
    name: prop.title(profilePage, "Name"),
    headline: prop.text(profilePage, "Headline"),
    location: prop.text(profilePage, "Location") || undefined,
    email: prop.email(profilePage, "Email"),
    siteUrl: prop.url(profilePage, "Site URL") ?? previous.profile.siteUrl,
    socials: {
      github: prop.url(profilePage, "GitHub") ?? previous.profile.socials.github,
      linkedin: prop.url(profilePage, "LinkedIn") ?? previous.profile.socials.linkedin,
      leetcode: prop.url(profilePage, "LeetCode"),
      x: prop.url(profilePage, "X"),
    },
    availability: {
      status: AVAILABILITY[(prop.select(profilePage, "Availability") ?? "open").toLowerCase()] ?? "open",
      label: prop.text(profilePage, "Availability Note") || previous.profile.availability.label,
    },
    taglines: lines(toPlain(prop.richText(profilePage, "Taglines"))),
    seo: {
      title: prop.text(profilePage, "SEO Title"),
      description: prop.text(profilePage, "SEO Description"),
    },
    bio: bio.length ? bio : previous.profile.bio,
    resume: {
      path: resumePath,
      updatedAt: resumeFile ? String(profilePage.last_edited_time).slice(0, 10) : previous.profile.resume.updatedAt,
    },
  };

  // ---- Experience ----
  console.log("[sync] experience…");
  const experiencePages = (await queryAll(notion, experienceDb, [{ property: "Order", direction: "ascending" }])).filter((p) => prop.checkbox(p, "Published"));
  const experience: SiteContent["experience"] = [];
  for (const page of experiencePages) {
    const dates = prop.date(page, "Dates");
    const start = toYearMonth(dates.start);
    if (!start) throw new Error(`Experience "${prop.title(page, "Company")}" has no start date`);
    const blocks = await pageBlocks(notion, page.id);
    experience.push({
      id: slug(prop.title(page, "Company")),
      company: prop.title(page, "Company"),
      companyUrl: prop.url(page, "Company URL"),
      role: prop.text(page, "Role"),
      location: prop.text(page, "Location") || undefined,
      start,
      end: toYearMonth(dates.end),
      bullets: blocks.filter((b) => b.type === "bulleted_list_item").map((b) => toMd(b.bulleted_list_item.rich_text)).filter(Boolean),
    });
  }

  const storeProjectImage = (fallbackAlt: string) => async (url: string, alt: string) => {
    const stored = await storeImage(url);
    referenced.add(stored.src);
    return { ...stored, alt: alt || fallbackAlt };
  };

  // ---- Projects ----
  console.log("[sync] projects…");
  const projectPages = (await queryAll(notion, projectsDb, [{ property: "Order", direction: "ascending" }])).filter((p) => prop.checkbox(p, "Published"));
  const projects: SiteContent["projects"] = [];
  for (const page of projectPages) {
    const name = prop.title(page, "Name");
    const blocks = await pageBlocks(notion, page.id);
    // The first paragraph is the card copy; the whole page body is the case study.
    const description = blocks.filter((b) => b.type === "paragraph").map((b) => toMd(b.paragraph.rich_text)).find(Boolean) ?? "";
    const body = await toPostBlocks(blocks, storeProjectImage(name), (id) => pageBlocks(notion, id));
    // One "Alt Text" line per screenshot, in order. Notion filenames make poor alt text.
    const alts = lines(prop.text(page, "Alt Text"));
    const images = [];
    for (const file of prop.files(page, "Screenshots")) {
      if (/\.(pdf|txt|md)$/i.test(file.name)) continue;
      const stored = await storeImage(file.url);
      referenced.add(stored.src);
      images.push({ ...stored, alt: alts[images.length] ?? `${name} screenshot ${images.length + 1}` });
    }
    projects.push({
      id: slug(name),
      name,
      summary: prop.text(page, "Summary"),
      description: description || prop.text(page, "Summary"),
      images,
      liveUrl: prop.url(page, "Live URL"),
      githubUrl: prop.url(page, "GitHub URL"),
      tech: prop.multiSelect(page, "Tech"),
      status: STATUS[(prop.select(page, "Status") ?? "live").toLowerCase()] ?? "live",
      featured: prop.checkbox(page, "Featured"),
      order: prop.number(page, "Order"),
      body,
    });
  }

  // ---- Skills ----
  console.log("[sync] skills…");
  const skillPages = await queryAll(notion, skillsDb, [{ property: "Order", direction: "ascending" }]);
  const categoryOrder = selectOptions(skillsDb, "Category");
  const skills: SiteContent["skills"] = skillPages
    .map((p) => ({
      name: prop.title(p, "Name"),
      category: prop.select(p, "Category") ?? "Other",
      highlight: prop.checkbox(p, "Highlight"),
      order: prop.number(p, "Order"),
    }))
    .filter((s) => s.name)
    // Order restarts per category in Notion, so group before sorting to keep the snapshot diff stable.
    .sort(
      (a, b) =>
        categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) ||
        a.order - b.order ||
        a.name.localeCompare(b.name),
    );
  const skillCategories = categoryOrder.filter((c) => skills.some((s) => s.category === c));

  // ---- Education ----
  console.log("[sync] education…");
  const education: SiteContent["education"] = (await queryAll(notion, educationDb, [{ property: "Order", direction: "ascending" }])).map((p) => {
    const dates = prop.date(p, "Dates");
    const start = toYearMonth(dates.start);
    if (!start) throw new Error(`Education "${prop.title(p, "Institution")}" has no start date`);
    return {
      institution: prop.title(p, "Institution"),
      degree: prop.text(p, "Degree"),
      gpa: prop.text(p, "GPA") || undefined,
      location: prop.text(p, "Location") || undefined,
      start,
      end: toYearMonth(dates.end),
    };
  });

  // ---- Achievements ----
  console.log("[sync] achievements…");
  const achievements: SiteContent["achievements"] = (await queryAll(notion, achievementsDb, [{ property: "Order", direction: "ascending" }])).map((p) => ({
    text: toMd(p.properties?.Achievement?.title ?? []),
    url: prop.url(p, "URL"),
  }));

  // ---- Posts (optional database) ----
  const posts: SiteContent["posts"] = [];
  if (postsDb) {
    console.log("[sync] posts…");
    const postPages = (await queryAll(notion, postsDb, [{ property: "Date", direction: "descending" }])).filter((p) =>
      prop.checkbox(p, "Published"),
    );
    for (const page of postPages) {
      const title = prop.title(page, "Title");
      const date = prop.date(page, "Date").start;
      if (!title || !date) throw new Error(`Post "${title || page.id}" needs a Title and a Date`);

      const storePostImage = async (url: string, alt: string) => {
        const stored = await storeImage(url);
        referenced.add(stored.src);
        return { ...stored, alt: alt || title };
      };

      const body = await toPostBlocks(await pageBlocks(notion, page.id), storePostImage, (id) => pageBlocks(notion, id));
      const coverFile = prop.files(page, "Cover")[0];
      const cover = coverFile ? await storePostImage(coverFile.url, title) : undefined;

      posts.push({
        slug: slug(prop.text(page, "Slug") || title),
        title,
        date: date.slice(0, 10),
        updated: String(page.last_edited_time).slice(0, 10),
        summary: prop.text(page, "Summary") || title,
        tags: prop.multiSelect(page, "Tags"),
        readingMinutes: readingMinutes(body),
        cover,
        body,
      });
    }
  }

  const content: SiteContent = SiteContentSchema.parse({
    profile,
    experience,
    projects,
    skillCategories,
    skills,
    education,
    achievements,
    posts,
    chat: {
      suggestions: lines(toPlain(prop.richText(profilePage, "Chat Suggestions"))) || previous.chat.suggestions,
    },
    meta: { syncedAt: new Date().toISOString(), source: "notion" },
  });

  // Atomic write so a crash never leaves a half-written snapshot.
  const tmp = `${OUT}.tmp`;
  await writeFile(tmp, `${JSON.stringify(content, null, 2)}\n`);
  await rename(tmp, OUT);

  const pruned = await pruneUnreferenced(referenced);
  console.log(
    `[sync] done: ${experience.length} roles, ${projects.length} projects (${referenced.size} images), ${skills.length} skills, ${education.length} education, ${achievements.length} achievements, ${posts.length} posts; pruned ${pruned} unused files`,
  );
}

main().catch((err) => fail("Notion sync failed.", err));
