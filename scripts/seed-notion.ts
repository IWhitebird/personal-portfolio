/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * One-off: creates the seven CMS databases under NOTION_ROOT_PAGE_ID and fills
 * them from src/content/site.json, uploading screenshots and the résumé PDF so
 * nothing has to be retyped. Databases that already exist are left untouched.
 *
 *   bun scripts/seed-notion.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SiteContentSchema, type SiteContent } from "../src/content/schema";
import { call, createNotion, discoverDatabases, DATABASE_TITLES, type DatabaseTitle } from "./lib/notion";
import { mdToRichText } from "./lib/richtext";

const token = process.env.NOTION_TOKEN;
const rootPageId = process.env.NOTION_ROOT_PAGE_ID;
if (!token || !rootPageId) {
  console.error("Set NOTION_TOKEN and NOTION_ROOT_PAGE_ID first (see .env.example).");
  process.exit(1);
}
const notion = createNotion(token);

const text = (content: string) => ({ rich_text: mdToRichText(content) });
const title = (content: string) => ({ title: [{ type: "text", text: { content } }] });
const url = (u?: string) => ({ url: u ?? null });
const select = (name?: string) => (name ? { select: { name } } : { select: null });
const date = (start: string, end: string | null) => ({ date: { start: `${start}-01`, end: end ? `${end}-01` : null } });
const paragraph = (md: string) => ({ object: "block", type: "paragraph", paragraph: { rich_text: mdToRichText(md) } });
const bullet = (md: string) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: mdToRichText(md) } });

const SCHEMAS: Record<DatabaseTitle, Record<string, any>> = {
  Profile: {
    Name: { title: {} },
    Headline: { rich_text: {} },
    Location: { rich_text: {} },
    Email: { email: {} },
    "Site URL": { url: {} },
    GitHub: { url: {} },
    LinkedIn: { url: {} },
    LeetCode: { url: {} },
    X: { url: {} },
    Availability: { select: { options: [{ name: "Open", color: "green" }, { name: "Not looking", color: "gray" }, { name: "Consulting", color: "blue" }] } },
    "Availability Note": { rich_text: {} },
    Taglines: { rich_text: {} },
    "Chat Suggestions": { rich_text: {} },
    "SEO Title": { rich_text: {} },
    "SEO Description": { rich_text: {} },
    Resume: { files: {} },
  },
  Experience: {
    Company: { title: {} },
    Role: { rich_text: {} },
    Dates: { date: {} },
    Location: { rich_text: {} },
    "Company URL": { url: {} },
    Order: { number: { format: "number" } },
    Published: { checkbox: {} },
  },
  Projects: {
    Name: { title: {} },
    Summary: { rich_text: {} },
    Screenshots: { files: {} },
    "Alt Text": { rich_text: {} },
    "Live URL": { url: {} },
    "GitHub URL": { url: {} },
    Tech: { multi_select: { options: [] } },
    Status: { select: { options: [{ name: "Live", color: "green" }, { name: "WIP", color: "yellow" }, { name: "Archived", color: "gray" }] } },
    Featured: { checkbox: {} },
    Order: { number: { format: "number" } },
    Published: { checkbox: {} },
  },
  Skills: {
    Name: { title: {} },
    Category: { select: { options: [] } },
    Order: { number: { format: "number" } },
    Highlight: { checkbox: {} },
  },
  Education: {
    Institution: { title: {} },
    Degree: { rich_text: {} },
    GPA: { rich_text: {} },
    Location: { rich_text: {} },
    Dates: { date: {} },
    Order: { number: { format: "number" } },
  },
  Achievements: {
    Achievement: { title: {} },
    URL: { url: {} },
    Order: { number: { format: "number" } },
  },
  Posts: {
    Title: { title: {} },
    Slug: { rich_text: {} },
    Date: { date: {} },
    Summary: { rich_text: {} },
    Tags: { multi_select: { options: [] } },
    Cover: { files: {} },
    Published: { checkbox: {} },
  },
};

async function uploadFile(localPath: string, contentType: string): Promise<{ type: "file_upload"; file_upload: { id: string }; name: string }> {
  const data = await readFile(localPath);
  const filename = path.basename(localPath);
  const upload: any = await call(() => notion.fileUploads.create({ mode: "single_part", filename, content_type: contentType } as any), "upload.create");
  await call(
    () => notion.fileUploads.send({ file_upload_id: upload.id, file: { data: new Blob([data], { type: contentType }), filename } } as any),
    "upload.send",
  );
  return { type: "file_upload", file_upload: { id: upload.id }, name: filename };
}

async function createDatabase(name: DatabaseTitle, extraSelectOptions: Record<string, string[]> = {}): Promise<string> {
  const properties = structuredClone(SCHEMAS[name]);
  for (const [propName, options] of Object.entries(extraSelectOptions)) {
    const kind = properties[propName].select ? "select" : "multi_select";
    properties[propName][kind].options = options.map((o) => ({ name: o }));
  }
  const db: any = await call(
    () =>
      notion.databases.create({
        parent: { type: "page_id", page_id: rootPageId! },
        title: [{ type: "text", text: { content: name } }],
        initial_data_source: { properties },
      } as any),
    `create ${name}`,
  );
  const dataSourceId: string = db.data_sources?.[0]?.id ?? db.initial_data_source?.id;
  if (!dataSourceId) throw new Error(`Created "${name}" but no data source id came back`);
  console.log(`+ database ${name}`);
  return dataSourceId;
}

async function createPage(dataSourceId: string, properties: Record<string, any>, children: any[] = []) {
  await call(
    () =>
      notion.pages.create({
        parent: { type: "data_source_id", data_source_id: dataSourceId },
        properties,
        ...(children.length ? { children: children.slice(0, 100) } : {}),
      } as any),
    "pages.create",
  );
}

async function main() {
  const site: SiteContent = SiteContentSchema.parse(JSON.parse(await readFile(path.resolve("src/content/site.json"), "utf8")));
  const existing = await discoverDatabases(notion, rootPageId!);
  const skip = (name: DatabaseTitle) => {
    if (existing.has(name)) {
      console.log(`= database ${name} already exists, skipping`);
      return true;
    }
    return false;
  };

  if (!skip("Profile")) {
    const ds = await createDatabase("Profile");
    const resume = await uploadFile(path.resolve("public", site.profile.resume.path.replace(/^\//, "")), "application/pdf");
    await createPage(
      ds,
      {
        Name: title(site.profile.name),
        Headline: text(site.profile.headline),
        Location: text(site.profile.location ?? ""),
        Email: { email: site.profile.email ?? null },
        "Site URL": url(site.profile.siteUrl),
        GitHub: url(site.profile.socials.github),
        LinkedIn: url(site.profile.socials.linkedin),
        LeetCode: url(site.profile.socials.leetcode),
        X: url(site.profile.socials.x),
        Availability: select({ open: "Open", "not-looking": "Not looking", consulting: "Consulting" }[site.profile.availability.status]),
        "Availability Note": text(site.profile.availability.label),
        Taglines: text(site.profile.taglines.join("\n")),
        "Chat Suggestions": text(site.chat.suggestions.join("\n")),
        "SEO Title": text(site.profile.seo.title),
        "SEO Description": text(site.profile.seo.description),
        Resume: { files: [resume] },
      },
      site.profile.bio.map(paragraph),
    );
    console.log("  + profile row (+ résumé upload)");
  }

  if (!skip("Experience")) {
    const ds = await createDatabase("Experience");
    let order = 1;
    for (const e of site.experience) {
      await createPage(
        ds,
        {
          Company: title(e.company),
          Role: text(e.role),
          Dates: date(e.start, e.end),
          Location: text(e.location ?? ""),
          "Company URL": url(e.companyUrl),
          Order: { number: order++ },
          Published: { checkbox: true },
        },
        e.bullets.map(bullet),
      );
      console.log(`  + ${e.company}`);
    }
  }

  if (!skip("Projects")) {
    const tech = [...new Set(site.projects.flatMap((p) => p.tech))];
    const ds = await createDatabase("Projects", { Tech: tech });
    for (const p of site.projects) {
      const files = [];
      for (const img of p.images) {
        files.push(await uploadFile(path.resolve("public", img.src.replace(/^\//, "")), "image/webp"));
      }
      await createPage(
        ds,
        {
          Name: title(p.name),
          Summary: text(p.summary),
          Screenshots: { files },
          "Alt Text": text(p.images.map((img) => img.alt).join("\n")),
          "Live URL": url(p.liveUrl),
          "GitHub URL": url(p.githubUrl),
          Tech: { multi_select: p.tech.map((t) => ({ name: t })) },
          Status: select({ live: "Live", wip: "WIP", archived: "Archived" }[p.status]),
          Featured: { checkbox: p.featured },
          Order: { number: p.order },
          Published: { checkbox: true },
        },
        [paragraph(p.description)],
      );
      console.log(`  + ${p.name} (${files.length} screenshots)`);
    }
  }

  if (!skip("Skills")) {
    const ds = await createDatabase("Skills", { Category: site.skillCategories });
    for (const s of site.skills) {
      await createPage(ds, {
        Name: title(s.name),
        Category: select(s.category),
        Order: { number: s.order },
        Highlight: { checkbox: s.highlight },
      });
    }
    console.log(`  + ${site.skills.length} skills`);
  }

  if (!skip("Education")) {
    const ds = await createDatabase("Education");
    let order = 1;
    for (const e of site.education) {
      await createPage(ds, {
        Institution: title(e.institution),
        Degree: text(e.degree),
        GPA: text(e.gpa ?? ""),
        Location: text(e.location ?? ""),
        Dates: date(e.start, e.end),
        Order: { number: order++ },
      });
      console.log(`  + ${e.institution}`);
    }
  }

  if (!skip("Achievements")) {
    const ds = await createDatabase("Achievements");
    let order = 1;
    for (const a of site.achievements) {
      await createPage(ds, {
        Achievement: { title: mdToRichText(a.text) },
        URL: url(a.url),
        Order: { number: order++ },
      });
    }
    console.log(`  + ${site.achievements.length} achievements`);
  }

  // Posts start empty: the blog is written in Notion, not seeded from the snapshot.
  if (!skip("Posts")) await createDatabase("Posts");

  console.log(`\nDone. Databases: ${DATABASE_TITLES.join(", ")}. Run \`bun run content:sync\` to pull them back into site.json.`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err?.body ?? err?.message ?? err);
  process.exit(1);
});
