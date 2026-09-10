/* eslint-disable @typescript-eslint/no-explicit-any -- Notion's response unions are deep; only a handful of fields are read */
import { Client } from "@notionhq/client";

export const DATABASE_TITLES = ["Profile", "Experience", "Projects", "Skills", "Education", "Achievements", "Posts"] as const;
export type DatabaseTitle = (typeof DATABASE_TITLES)[number];

// Notion allows roughly 3 requests/second. Three in flight keeps a regeneration
// fast without tripping the limit; a 429 is retried once with its Retry-After.
const MAX_IN_FLIGHT = 3;
let inFlight = 0;
const queue: (() => void)[] = [];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function acquire(): Promise<void> {
  if (inFlight < MAX_IN_FLIGHT) {
    inFlight += 1;
    return;
  }
  await new Promise<void>((resolve) => queue.push(resolve));
  inFlight += 1;
}

function release(): void {
  inFlight -= 1;
  queue.shift()?.();
}

export function createNotion(token: string): Client {
  return new Client({ auth: token });
}

export async function call<T>(fn: () => Promise<T>, label = "notion"): Promise<T> {
  await acquire();
  try {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status !== 429 && err?.code !== "rate_limited") throw err;
      const retry = Number(err?.headers?.["retry-after"] ?? 2);
      console.warn(`[cms] ${label} rate limited, retrying in ${retry}s`);
      await sleep(retry * 1000);
      return await fn();
    }
  } finally {
    release();
  }
}

export async function paginate<T>(fetchPage: (cursor?: string) => Promise<{ results: T[]; has_more: boolean; next_cursor: string | null }>): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await call(() => fetchPage(cursor));
    all.push(...page.results);
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined;
  } while (cursor);
  return all;
}

export type DiscoveredDatabase = { title: string; databaseId: string; dataSourceId: string; properties: Record<string, any> };

/** Finds the child databases under the CMS root page by title and resolves each one's data source and schema. */
export async function discoverDatabases(notion: Client, rootPageId: string): Promise<Map<DatabaseTitle, DiscoveredDatabase>> {
  const blocks = await paginate<any>((cursor) => notion.blocks.children.list({ block_id: rootPageId, start_cursor: cursor, page_size: 100 }) as any);
  const found = new Map<DatabaseTitle, DiscoveredDatabase>();

  for (const block of blocks) {
    if (block.type !== "child_database") continue;
    const title = String(block.child_database?.title ?? "").trim() as DatabaseTitle;
    if (!DATABASE_TITLES.includes(title) || found.has(title)) continue;

    const db: any = await call(() => notion.databases.retrieve({ database_id: block.id }), `retrieve ${title}`);
    const dataSourceId: string | undefined = db.data_sources?.[0]?.id;
    if (!dataSourceId) throw new Error(`Database "${title}" has no data source`);
    const ds: any = await call(() => notion.dataSources.retrieve({ data_source_id: dataSourceId }), `schema ${title}`);
    found.set(title, { title, databaseId: block.id, dataSourceId, properties: ds.properties ?? {} });
  }
  return found;
}

/** Fails loudly when a property was renamed in Notion, so a regeneration aborts instead of silently losing a field. */
export function assertProps(db: DiscoveredDatabase, required: string[]): void {
  const missing = required.filter((name) => !(name in db.properties));
  if (missing.length) {
    throw new Error(`Database "${db.title}" is missing properties: ${missing.join(", ")}. Present: ${Object.keys(db.properties).join(", ")}`);
  }
}

export async function queryAll(notion: Client, db: DiscoveredDatabase, sorts?: any[]): Promise<any[]> {
  return paginate<any>(
    (cursor) =>
      notion.dataSources.query({
        data_source_id: db.dataSourceId,
        start_cursor: cursor,
        page_size: 100,
        ...(sorts ? { sorts } : {}),
      }) as any,
  );
}

export async function pageBlocks(notion: Client, pageId: string): Promise<any[]> {
  return paginate<any>((cursor) => notion.blocks.children.list({ block_id: pageId, start_cursor: cursor, page_size: 100 }) as any);
}

// ---- property readers ----

export const prop = {
  title: (page: any, name: string): string => (page.properties?.[name]?.title ?? []).map((t: any) => t.plain_text).join("").trim(),
  richText: (page: any, name: string): any[] => page.properties?.[name]?.rich_text ?? [],
  text: (page: any, name: string): string => (page.properties?.[name]?.rich_text ?? []).map((t: any) => t.plain_text).join("").trim(),
  url: (page: any, name: string): string | undefined => page.properties?.[name]?.url ?? undefined,
  email: (page: any, name: string): string | undefined => page.properties?.[name]?.email ?? undefined,
  select: (page: any, name: string): string | undefined => page.properties?.[name]?.select?.name ?? undefined,
  multiSelect: (page: any, name: string): string[] => (page.properties?.[name]?.multi_select ?? []).map((o: any) => o.name),
  checkbox: (page: any, name: string): boolean => Boolean(page.properties?.[name]?.checkbox),
  number: (page: any, name: string): number => Number(page.properties?.[name]?.number ?? 0),
  date: (page: any, name: string): { start: string | null; end: string | null } => ({
    start: page.properties?.[name]?.date?.start ?? null,
    end: page.properties?.[name]?.date?.end ?? null,
  }),
  files: (page: any, name: string): { name: string; url: string }[] =>
    (page.properties?.[name]?.files ?? [])
      .map((f: any) => ({ name: f.name as string, url: (f.type === "external" ? f.external?.url : f.file?.url) as string | undefined }))
      .filter((f: any): f is { name: string; url: string } => Boolean(f.url)),
};

/** "2025-07-14" → "2025-07" */
export function toYearMonth(iso: string | null): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  return m ? `${m[1]}-${m[2]}` : null;
}

/** Option order of a select property, used for category ordering. */
export function selectOptions(db: DiscoveredDatabase, name: string): string[] {
  return (db.properties?.[name]?.select?.options ?? []).map((o: any) => o.name as string);
}
