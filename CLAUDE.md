# Personal Portfolio: Shreyas Patange (IWhitebird)

Portfolio site for **Shreyas Patange**, Software Development Engineer II at Skylark Labs. Deployed on **Vercel**.
Live: https://iwhitebird.com

## Stack
- **Next.js 16** (App Router, TypeScript, Turbopack) · React 19
- **Tailwind CSS v4** with design tokens in `src/app/globals.css` (`@theme inline`, light default + `.dark`)
- **Fonts**: Geist Sans (body, UI) and Geist Mono (terminal, clock, tech tags) via the `geist` package; **Newsreader** (`next/font/google`, variable, `opsz` axis) for headings only, applied with the `.display` class
- **Theme**: `next-themes` (class strategy, system default)
- **Motion**: `motion/react` for the chat panel; `popmotion` springs for the DecoderText scramble and the sphere
- **3D**: `spherethree` = `three@0.122` alias. The displacement sphere's shaders use 0.122 chunk names; do not bump this version without porting `src/components/sphere/*.glsl.ts`.
- **AI assistant**: Vercel AI SDK 7 (`ai`, `@ai-sdk/react`, `@ai-sdk/groq`), model `openai/gpt-oss-120b` on Groq, no fallback model
- **CMS**: Notion, fetched at render time by `src/lib/cms/content.ts` through a cache that revalidates hourly
- **Images**: screenshots are mirrored from Notion into **Vercel Blob** by content hash and served through `next/image`
- **Code highlighting**: `shiki` runs on the server while content is fetched, never in the browser. Dual theme via `--shiki-light` / `--shiki-dark`.
- **Icons**: `src/app/icon.svg` is the Newsreader "S" glyph converted to a path (self-contained, no font dependency); `apple-icon.png`, `public/logo*.png` and `public/favicon.ico` are generated from it.
- **PDF**: `react-pdf` 10 (client-only, worker via `import.meta.url`)
- **Package manager**: bun (`bun.lock`). Node 24 works for the scripts too.

## Content flow (single source of truth)
```
Notion "Portfolio CMS" page → 7 databases (Profile, Experience, Projects, Skills, Education, Achievements, Posts)
   │                                  Google Drive (résumé PDF; share link in Notion)
   ▼                                        ▼
src/lib/cms/content.ts  getContent()   src/lib/cms/resume.ts  getResumePdf()
   'use cache: remote' · cacheLife("cms") · cacheTag("cms") · zod-validated
   │  mirrors new screenshots into Vercel Blob (src/lib/cms/blob.ts)
   ├─ src/lib/cms/select.ts     → pure selectors over the fetched object
   ├─ every page, generateMetadata, sitemap, robots, manifest, OG images, RSS
   ├─ src/app/resume.pdf/route.ts → the PDF, same-origin
   └─ src/lib/knowledge.ts      → compact facts for the AI system prompt + data behind the get_* tools
```
- **Nothing about content is committed.** No snapshot, no images, no PDF. `NOTION_TOKEN` is a runtime dependency, not just a build one.
- **Editing content = edit Notion.** The `cms` cacheLife profile is `stale 300 / revalidate 3600 / expire 2592000`, so an edit is live within the hour; a redeploy publishes it at once. Worst case is about two hours, because a page's revalidate window and the content entry's window run on independent clocks. The month-long `expire` is deliberate: if Notion is unreachable at regeneration the last good snapshot keeps serving instead of the site going blank.
- `'use cache: remote'` (not plain `'use cache'`) is required: plain is in-memory per instance, so every cold function would refetch Notion. `remote` puts the entry in Vercel's Runtime Cache, shared across instances and the build.
- **A connected Vercel Blob store is mandatory**, in every environment including local dev. `assertBlob()` throws a one-line instruction rather than falling back, because a fallback would mean rendering Notion's expiring URLs. Blob names are `cms/<sha1-12 of the Notion S3 path>_<w>x<h>.<ext>`: dimensions ride in the name so `next/image` needs no second lookup, and one `list()` per regeneration decides what to upload. Blobs are immutable and never pruned.
- The **résumé PDF is never in the repo.** It lives in the owner's public Google Drive folder; the share link sits in Notion on `Profile` → `Resume URL`. `getResumePdf()` rewrites it to its direct-download form (`directDownloadUrl`), refuses anything not starting `%PDF-` (what a not-yet-shared Drive file returns), and `/resume.pdf` streams the bytes same-origin, which is what lets react-pdf load it without CORS. Updating the résumé means replacing the file in Drive. Code never changes for it.
- **Posts** is optional in the fetch (a CMS without it still works) and is seeded empty: the blog is written in Notion. `Published` gates it; an unchecked post never reaches the site. There is a "Block reference (keep unpublished)" page in the Posts database showing every supported block.
- Post bodies are flattened by `src/lib/cms/blocks.ts` into the subset `PostBlockSchema` allows: p, h2, h3 (both get anchor slugs), ul, ol, todo, quote, callout, code (highlighted by `src/lib/cms/highlight.ts`), image, bookmark, hr. Nesting is followed two levels deep and stored as a `depth` on list items, so the schema stays non-recursive. Anything else in Notion is skipped rather than breaking the fetch.
- Property names are asserted by `assertProps` in `content.ts`. A rename in Notion aborts the regeneration loudly instead of silently dropping a field, and the stale entry keeps serving.
- Projects carry an **Alt Text** property, one line per screenshot in order. Notion filenames make useless alt text, so this is the source for it.
- A project's Notion **page body is its case study** at `/projects/[slug]` (slug = the project id), converted with the same block pipeline as posts. The first paragraph doubles as the card copy on the home page. An empty body falls back to that paragraph, so a project with no write-up still gets a page.
- `Status` (Live / WIP / Archived) renders as a quiet marker on cards and case studies via `ProjectStatus`. Archived is muted; WIP takes the accent because it is a live-state signal.
- Skills come back sorted by category order then row order, because `Order` restarts inside each category in Notion.
- Inline markdown subset in content strings: `**bold**`, `` `code` ``, `[text](url)`; rendered by `src/components/ui/InlineMd.tsx`.

## Cache Components
`cacheComponents: true` is on, which changes the rules:
- **Incompatible segment configs**: `runtime`, `dynamic`, `dynamicParams`, `revalidate`, `fetchCache`. None are used. Node is the default runtime in Next 16, so `export const runtime = "nodejs"` is not just unnecessary, it fails the build.
- **`generateStaticParams` must return at least one param.** `slugParams()` in `select.ts` returns `[{ slug: "__placeholder__" }]` for an empty list; the page's existing `if (!post) notFound()` turns it into a 404. Slugs that appear mid-hour still render on request.
- **Static `metadata` and `alt` exports cannot read content**, so `layout.tsx`, `blog/page.tsx` and `resume/page.tsx` use `generateMetadata`, and the root `opengraph-image.tsx` uses `generateImageMetadata` for its `alt`.
- **Reading the clock during a prerender is an error** (`Date.now()`, zero-argument `new Date()`, `Math.random()` in a Server Component). `content.meta.fetchedAt` is the server's "now": `Footer` takes a `year` prop and `formatDuration` takes a required `now`. Client effects are unaffected.
- `"use cache"` cannot decorate a route handler's `GET` export; the handler calls a cached helper instead.

## Layout
```
src/
├── app/                 layout, page (composes sections), api/chat/route.ts, resume.pdf/route.ts,
│                        blog/{page,[slug],rss.xml}, projects/[slug], resume/, metadata routes
├── components/
│   ├── sections/        Hero, Experience, Projects, About, Contact, Footer
│   ├── nav/             TopNav (glass bar on scroll, active section), SectionLink (smooth anchor scroll), ThemeToggle, Clock (IST)
│   ├── chat/            ChatLauncher (FAB + panel), Chat (useChat), MessageParts, useClientTools, persist
│   ├── blog/            PostBody (renders the fetched block subset), TableOfContents
│   ├── providers/       ThemeProvider
│   ├── sphere/          DisplacementSphere (client, transparent canvas), SphereBackground (idle-mounted), shaders
│   ├── resume/          ResumeViewer, ResumeModal, ResumeHost (event-driven), ResumeStandalone (/resume page)
│   └── ui/              DecoderText, InlineMd, JsonLd, ProjectStatus, ScrollProgress, SectionHeading, TrackedLink, VisuallyHidden
├── lib/
│   ├── cms/             content.ts (getContent), select.ts, blob.ts, resume.ts (getResumePdf),
│   │                    schema.ts (zod + types), notion.ts, blocks.ts, richtext.ts, highlight.ts
│   ├── site.ts (origin), resume.ts (path + download filename), seo.ts (JSON-LD graphs),
│   └── knowledge.ts, format.ts, events.ts, three.ts, scroll.ts, analytics.ts,
│                        chat/{prompt,tools,page-tools,model,guard}.ts
└── hooks/               usePrefersReducedMotion, useInViewport, useWindowSize, useRotatingText
```

## Client/server boundary
- `lib/cms/content.ts`, `lib/cms/resume.ts`, `lib/cms/blob.ts`, `lib/knowledge.ts` and `lib/chat/tools.ts` start with `import "server-only"`, so a client component that value-imports one fails the build instead of shipping the CMS to the browser (it did, once, for 570 KB). `lib/cms/schema.ts` is types and zod only, safe to `import type` from anywhere; `lib/resume.ts` is two constants shared by both sides.
- Server components fetch once at the top of a route and pass plain data down as props. `lib/cms/select.ts` is pure and takes the fetched object.
- The browser gets its half of the tool contract from `lib/chat/page-tools.ts`, which deliberately has no imports. `tools.ts` re-exports it as `PAGE_TOOL_NAMES` with a `satisfies readonly ToolName[]` so a typo still fails the build.
- Guard against regressions with `grep -rl "<a bullet from Notion>" .next/static` after a build.

## AI assistant
- `POST /api/chat` (`maxDuration` 30): origin allowlist → zod body caps (20 msgs / 2000 chars per part / 8000 total) → per-IP rate limit (in-memory, or Upstash when `UPSTASH_*` is set) → last 10 UI messages → `streamText` with `stopWhen: isStepCount(3)`, `maxOutputTokens` 500, `reasoningEffort: "low"`.
- Server tools (`execute`): `search_content` (grounding: every mention of a term across the content, with source), `get_experience`, `get_projects`, `get_skills`, `get_contact_info`. The route awaits `getContent()` once and `buildTools(content)` closes over it, so a request costs one cache read and no Notion calls. The prompt tells the model to search first whenever a question names something specific; before that tool existed it answered "what did he build with Mastra?" with the wrong project. Everything the assistant knows comes from Notion, and there are deliberately no live third-party lookups: they add a key to rotate, a rate limit to babysit, and a failure mode, to restate something the content already says.
- Page tools (no `execute`, run in the browser via `onToolCall` + `addToolOutput`): `navigate_to_section`, `set_theme`, `show_resume`, `download_resume`, `open_link`, `open_project`, `focus_contact_form`. Custom `sendAutomaticallyWhen` only resends when the model acted silently.
- Groq free tier is ~8K tokens/minute org-wide: keep `buildInstructions()` under ~700 tokens and tool descriptions terse; detail belongs behind tools.
- Rate-limit and quota errors come back as normal assistant text ("try again in N seconds"); the UI shows a countdown.
- **The body guard must accept a tool round trip.** After a page tool runs, the SDK resends with the *assistant* message last (it now holds the tool outputs). `guard.ts` allows that one case; rejecting it is what once put `{"error":"Invalid request"...}` in front of a visitor.
- The chat UI never renders `error.message`. Transport failures map to a short friendly line from `HICCUPS` in `Chat.tsx` plus a retry link; cooldowns show the countdown. Test any change to the route by driving the real UI, not only curl.
- Loose coupling via `src/lib/events.ts` (`portfolio:open-chat`, `portfolio:show-resume`).

## Copy rules
- The site is read by recruiters, not by developers. Never surface build or CMS plumbing in the UI: no "synced from Notion", no "not configured", no "the site was rebuilt". `meta.fetchedAt` is for the sitemap's `lastModified` and the footer's year, never shown as a timestamp.
- A section heading matches what the nav calls it, so "Projects" in the nav means "Projects" as the heading.

## Environment variables (see `.env.example`)
Required: `NEXT_PUBLIC_SITE_URL` (throws at import if unset), `NEXT_PUBLIC_FORMSPREE_ID`, `GROQ_API_KEY`, `NOTION_TOKEN`, `NOTION_ROOT_PAGE_ID`. Optional: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. Only `NEXT_PUBLIC_*` reaches the browser. `BLOB_STORE_ID` / `BLOB_READ_WRITE_TOKEN` and `VERCEL*` are injected by Vercel (`vercel env pull` locally), never set by hand.

## Scripts
- `bun dev`: dev server (port 3000)
- `bun run build`: `next build`
- `bun run typecheck` / `bun run lint`

## Analytics
- Vercel Analytics + Speed Insights load only on Vercel. Custom events go through `src/lib/analytics.ts`, which no-ops when `NEXT_PUBLIC_VERCEL_ENV` is unset so local clicks never reach the dashboard. Adding an event means adding it to the `AnalyticsEvent` union.

## TypeScript
- `strict` plus `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `verbatimModuleSyntax`. `bun run typecheck` must be clean; array and regex-group access is checked, so index with a guard or a default rather than a non-null assertion.

## Design rules
- Cyan (`--accent`, `#00ddff` dark / `#007a99` light) is a signal colour: live/current state, focus, cursor, active nav. Not decoration.
- Sentence-case headings, no all-caps labels, hairlines over cards, mono only for machine-like text.
- Exactly one entrance animation (hero decode + sphere fade). Sections do not fade in on scroll. Motion that answers a click (mobile menu, theme icon, button press) is fine.
- The assistant has two entry points and no more: the hero button and the floating "Ask AI" pill. The nav deliberately has none.
- Skills render in full, server-side, with the ones he uses most weeks marked `chip--strong`. The owner chose this over a show-few/show-all toggle: highlighting carries the emphasis without hiding anything behind a click.
- No headline stats band. The numbers live in the experience bullets, where they have context; standing alone they read as a brag wall.
- No em dashes in copy or comments.
- Headings are serif (`.display`), body and UI are Geist Sans, machine-like text is Geist Mono.
- The sphere's canvas is **fixed to the viewport** and mounted at the page root (not inside `Hero`, whose `overflow-hidden` would clip it). It travels across whole-page scroll progress: `SCROLL_TRAVEL` for the descent and `SWEEP_TO` for one monotonic slide from the resting offset on the right to its mirror on the left at the bottom, eased per frame by `SCROLL_EASE`. Both are multiples of the per-breakpoint resting offset, so the path scales instead of needing per-device numbers. Keep it monotonic: an oscillating path reads as fidgety.
- Its opacity is written straight to `canvas.style` inside the render loop, never through React state, so scrolling causes no re-renders. `maxOpacity` is the per-theme ceiling; `FADE_START`/`FADE_END`/`FADE_TO` dim it once the hero is past so section text stays readable.
- Scroll-driven CSS (`animation-timeline`) powers the hero rise and the experience rail, behind `@supports` so unsupporting browsers get the finished state. The rail is drawn **per `li`** (each item owns the segment from its dot to the next item's dot), so it starts and ends exactly on the markers; a single `ol`-level line overshoots both ends. Both are switched off outright under `prefers-reduced-motion`, since a scroll timeline ignores `animation-duration`.
- A film-grain overlay (`.grain`) sits above the page at 6% (light, multiply) / 9% (dark, screen). Visible, not gritty; this was tuned down once already. It is the only decorative texture; do not add more.
- The nav bar is transparent until you scroll, so a fixed gradient scrim in `TopNav` (`from-bg` to transparent over 6rem) sits behind it. Without it the nav text lands straight on the sphere and drops below AA. Nav quiet text is `fg-soft`, not `muted`, for the same reason.
- Respect `prefers-reduced-motion` everywhere (sphere renders one frame, typewriter is static).

## Workflow
- Work on a feature branch; the owner reviews and commits. Do not commit or push from an agent session.
- No `vercel.json`: bun is detected from `bun.lock` and `next build` is Vercel's default. A Blob store must be connected to the project for every environment.
