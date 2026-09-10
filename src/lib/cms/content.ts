import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { imageMirror } from "./blob";
import { readingMinutes, toPostBlocks } from "./blocks";
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
} from "./notion";
import { toMd, toPlain, type RichTextItem } from "./richtext";
import { SiteContentSchema, type SiteContent } from "./schema";

/**
 * The site's only content source. Notion holds seven databases under one root
 * page; this builds them into a single validated object which every page, the
 * metadata routes and the AI assistant read.
 *
 * The cache is what makes it cheap: one regeneration an hour serves every
 * request, and `expire` in the `cms` profile is a month, so a Notion outage
 * keeps the last good snapshot serving instead of blanking the site.
 */

const AVAILABILITY: Record<string, SiteContent["profile"]["availability"]["status"]> = {
  open: "open",
  "not looking": "not-looking",
  consulting: "consulting",
};

const STATUS: Record<string, SiteContent["projects"][number]["status"]> = {
  live: "live",
  wip: "wip",
  archived: "archived",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** A URL the site cannot render without, so a blank cell fails the regeneration by name. */
function requireUrl(page: unknown, name: string): string {
  const url = prop.url(page, name);
  if (!url) throw new Error(`Profile is missing "${name}"`);
  return url;
}

function env(name: "NOTION_TOKEN" | "NOTION_ROOT_PAGE_ID"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. The site reads its content from Notion at runtime.`);
  return value;
}

type Databases = Map<string, DiscoveredDatabase>;

/**
 * Resolving the databases costs ~8 Notion calls and only changes when the CMS
 * structure does, so it gets its own longer-lived cache entry.
 */
async function getDatabases(): Promise<Databases> {
  "use cache: remote";
  cacheLife("days");
  cacheTag("cms");

  const notion = createNotion(env("NOTION_TOKEN"));
  return discoverDatabases(notion, env("NOTION_ROOT_PAGE_ID"));
}

export async function getContent(): Promise<SiteContent> {
  "use cache: remote";
  cacheLife("cms");
  cacheTag("cms");

  const notion = createNotion(env("NOTION_TOKEN"));
  const dbs = await getDatabases();
  const need = (title: string): DiscoveredDatabase => {
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

  // A renamed property would otherwise drop a field silently.
  assertProps(profileDb, ["Name", "Headline", "Site URL", "GitHub", "LinkedIn", "Availability", "SEO Title", "SEO Description", "Resume URL", "Taglines", "Chat Suggestions"]);
  assertProps(experienceDb, ["Company", "Role", "Dates", "Order", "Published"]);
  assertProps(projectsDb, ["Name", "Summary", "Screenshots", "Alt Text", "Tech", "Status", "Featured", "Order", "Published"]);
  assertProps(skillsDb, ["Name", "Category", "Order", "Highlight"]);
  assertProps(educationDb, ["Institution", "Degree", "Dates", "Order"]);
  assertProps(achievementsDb, ["Achievement", "Order"]);
  if (postsDb) assertProps(postsDb, ["Title", "Slug", "Date", "Summary", "Tags", "Published"]);

  const mirror = await imageMirror();
  const storeImage = (fallbackAlt: string) => async (url: string, alt: string) => ({
    ...(await mirror(url)),
    alt: alt || fallbackAlt,
  });

  // Notion returns a page body as a flat list; only paragraphs are read here.
  const paragraphs = (blocks: { type: string; paragraph: { rich_text: RichTextItem[] } }[]) =>
    blocks.filter((b) => b.type === "paragraph").map((b) => toMd(b.paragraph.rich_text)).filter(Boolean);

  const [profilePage] = await queryAll(notion, profileDb);
  if (!profilePage) throw new Error("Profile database has no rows");

  const [bioBlocks, experiencePages, projectPages, skillPages, educationPages, achievementPages, postPages] = await Promise.all([
    pageBlocks(notion, profilePage.id),
    queryAll(notion, experienceDb, [{ property: "Order", direction: "ascending" }]),
    queryAll(notion, projectsDb, [{ property: "Order", direction: "ascending" }]),
    queryAll(notion, skillsDb, [{ property: "Order", direction: "ascending" }]),
    queryAll(notion, educationDb, [{ property: "Order", direction: "ascending" }]),
    queryAll(notion, achievementsDb, [{ property: "Order", direction: "ascending" }]),
    postsDb ? queryAll(notion, postsDb, [{ property: "Date", direction: "descending" }]) : Promise.resolve([]),
  ]);

  // ---- Profile ----
  const profile: SiteContent["profile"] = {
    name: prop.title(profilePage, "Name"),
    headline: prop.text(profilePage, "Headline"),
    location: prop.text(profilePage, "Location") || undefined,
    email: prop.email(profilePage, "Email"),
    siteUrl: requireUrl(profilePage, "Site URL"),
    socials: {
      github: requireUrl(profilePage, "GitHub"),
      linkedin: requireUrl(profilePage, "LinkedIn"),
      leetcode: prop.url(profilePage, "LeetCode"),
      x: prop.url(profilePage, "X"),
    },
    availability: {
      status: AVAILABILITY[(prop.select(profilePage, "Availability") ?? "open").toLowerCase()] ?? "open",
      label: prop.text(profilePage, "Availability Note"),
    },
    taglines: lines(toPlain(prop.richText(profilePage, "Taglines"))),
    seo: {
      title: prop.text(profilePage, "SEO Title"),
      description: prop.text(profilePage, "SEO Description"),
    },
    bio: paragraphs(bioBlocks),
    resume: {
      // The public Drive link to the PDF; the file itself is never in the repo.
      sourceUrl: requireUrl(profilePage, "Resume URL"),
      updatedAt: String(profilePage.last_edited_time).slice(0, 10),
    },
  };

  // ---- Experience ----
  const experience: SiteContent["experience"] = await Promise.all(
    experiencePages
      .filter((p) => prop.checkbox(p, "Published"))
      .map(async (page) => {
        const company = prop.title(page, "Company");
        const dates = prop.date(page, "Dates");
        const start = toYearMonth(dates.start);
        if (!start) throw new Error(`Experience "${company}" has no start date`);
        const blocks = await pageBlocks(notion, page.id);
        return {
          id: slug(company),
          company,
          companyUrl: prop.url(page, "Company URL"),
          role: prop.text(page, "Role"),
          location: prop.text(page, "Location") || undefined,
          start,
          end: toYearMonth(dates.end),
          bullets: blocks
            .filter((b) => b.type === "bulleted_list_item")
            .map((b) => toMd(b.bulleted_list_item.rich_text))
            .filter(Boolean),
        };
      }),
  );

  // ---- Projects ----
  const projects: SiteContent["projects"] = await Promise.all(
    projectPages
      .filter((p) => prop.checkbox(p, "Published"))
      .map(async (page) => {
        const name = prop.title(page, "Name");
        const summary = prop.text(page, "Summary");
        const blocks = await pageBlocks(notion, page.id);
        // The first paragraph is the card copy; the whole page body is the case study.
        const description = paragraphs(blocks)[0] ?? summary;
        const body = await toPostBlocks(blocks, storeImage(name), (id) => pageBlocks(notion, id));

        // One "Alt Text" line per screenshot, in order. Notion filenames make poor alt text.
        const alts = lines(prop.text(page, "Alt Text"));
        const files = prop.files(page, "Screenshots").filter((f) => !/\.(pdf|txt|md)$/i.test(f.name));
        const images = await Promise.all(
          files.map(async (file, i) => ({
            ...(await mirror(file.url)),
            alt: alts[i] ?? `${name} screenshot ${i + 1}`,
          })),
        );

        return {
          id: slug(name),
          name,
          summary,
          description,
          images,
          liveUrl: prop.url(page, "Live URL"),
          githubUrl: prop.url(page, "GitHub URL"),
          tech: prop.multiSelect(page, "Tech"),
          status: STATUS[(prop.select(page, "Status") ?? "live").toLowerCase()] ?? "live",
          featured: prop.checkbox(page, "Featured"),
          order: prop.number(page, "Order"),
          body,
        };
      }),
  );

  // ---- Skills ----
  const categoryOrder = selectOptions(skillsDb, "Category");
  const skills: SiteContent["skills"] = skillPages
    .map((p) => ({
      name: prop.title(p, "Name"),
      category: prop.select(p, "Category") ?? "Other",
      highlight: prop.checkbox(p, "Highlight"),
      order: prop.number(p, "Order"),
    }))
    .filter((s) => s.name)
    // Order restarts per category in Notion, so group before sorting.
    .sort(
      (a, b) =>
        categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) ||
        a.order - b.order ||
        a.name.localeCompare(b.name),
    );

  // ---- Education ----
  const education: SiteContent["education"] = educationPages.map((p) => {
    const institution = prop.title(p, "Institution");
    const dates = prop.date(p, "Dates");
    const start = toYearMonth(dates.start);
    if (!start) throw new Error(`Education "${institution}" has no start date`);
    return {
      institution,
      degree: prop.text(p, "Degree"),
      gpa: prop.text(p, "GPA") || undefined,
      location: prop.text(p, "Location") || undefined,
      start,
      end: toYearMonth(dates.end),
    };
  });

  // ---- Posts ----
  const posts: SiteContent["posts"] = await Promise.all(
    postPages
      .filter((p) => prop.checkbox(p, "Published"))
      .map(async (page) => {
        const title = prop.title(page, "Title");
        const date = prop.date(page, "Date").start;
        if (!title || !date) throw new Error(`Post "${title || page.id}" needs a Title and a Date`);

        const storePostImage = storeImage(title);
        const body = await toPostBlocks(await pageBlocks(notion, page.id), storePostImage, (id) => pageBlocks(notion, id));
        const coverFile = prop.files(page, "Cover")[0];

        return {
          slug: slug(prop.text(page, "Slug") || title),
          title,
          date: date.slice(0, 10),
          updated: String(page.last_edited_time).slice(0, 10),
          summary: prop.text(page, "Summary") || title,
          tags: prop.multiSelect(page, "Tags"),
          readingMinutes: readingMinutes(body),
          cover: coverFile ? await storePostImage(coverFile.url, title) : undefined,
          body,
        };
      }),
  );

  return SiteContentSchema.parse({
    profile,
    experience,
    projects,
    skillCategories: categoryOrder.filter((c) => skills.some((s) => s.category === c)),
    skills,
    education,
    achievements: achievementPages.map((p) => ({
      text: toMd(p.properties?.Achievement?.title ?? []),
      url: prop.url(p, "URL"),
    })),
    posts,
    chat: { suggestions: lines(toPlain(prop.richText(profilePage, "Chat Suggestions"))) },
    meta: { fetchedAt: new Date().toISOString() },
  });
}
