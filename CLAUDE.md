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
- **AI assistant**: Vercel AI SDK 7 (`ai`, `@ai-sdk/react`, `@ai-sdk/groq`), model `openai/gpt-oss-120b` on Groq, optional in-Groq fallback to `openai/gpt-oss-20b`
- **CMS**: Notion, pulled at build time by `scripts/sync-content.ts` into `src/content/site.json`
- **Code highlighting**: `shiki` (devDependency) runs at sync time, not in the browser. Dual theme via `--shiki-light` / `--shiki-dark`.
- **Icons**: `src/app/icon.svg` is the Newsreader "S" glyph converted to a path (self-contained, no font dependency); `apple-icon.png`, `public/logo*.png` and `public/favicon.ico` are generated from it.
- **PDF**: `react-pdf` 10 (client-only, worker via `import.meta.url`)
- **Package manager**: bun (`bun.lock`). Node 24 works for the scripts too.

## Content flow (single source of truth)
```
Notion "Portfolio CMS" page → 7 databases (Profile, Experience, Projects, Skills, Education, Achievements, Posts)
   │  bun scripts/sync-content.ts   (runs in `bun run build`; on any failure keeps the committed snapshot, exit 0)
   ▼
src/content/site.json (committed snapshot) + public/cms/*.webp + public/resume.pdf
   ├─ src/content/index.ts      → typed accessors, zod-validated at import (src/content/schema.ts)
   ├─ src/app/layout.tsx        → metadata, JSON-LD, OG image, sitemap, manifest
   └─ src/lib/knowledge.ts      → compact facts for the AI system prompt + data behind the get_* tools
```
- Editing content = edit Notion, then trigger a Vercel deploy (Deploy Hook). `bun run content:sync` pulls locally.
- `scripts/seed-notion.ts` creates the databases from `site.json` once (uploads screenshots + résumé). Property names it creates are the ones `sync-content.ts` asserts on.
- **Posts** is optional in the sync (a CMS without it still syncs) and is seeded empty: the blog is written in Notion, never from the snapshot. `Published` gates it; an unchecked post never reaches the site. There is a "Block reference (keep unpublished)" page in the Posts database showing every supported block.
- Post bodies are flattened by `scripts/lib/blocks.ts` into the subset `PostBlockSchema` allows: p, h2, h3 (both get anchor slugs), ul, ol, todo, quote, callout, code (highlighted by `scripts/lib/highlight.ts`), image, bookmark, hr. Nesting is followed two levels deep and stored as a `depth` on list items, so the schema stays non-recursive. Anything else in Notion is skipped rather than breaking the build.
- Projects carry an **Alt Text** property, one line per screenshot in order. Notion filenames make useless alt text, so this is the source for it.
- A project's Notion **page body is its case study** at `/projects/[slug]` (slug = the project id), converted with the same block pipeline as posts. The first paragraph doubles as the card copy on the home page. An empty body falls back to that paragraph, so a project with no write-up still gets a page.
- `Status` (Live / WIP / Archived) renders as a quiet marker on cards and case studies via `ProjectStatus`. Archived is muted; WIP takes the accent because it is a live-state signal.
- Skills come back sorted by category order then row order, because `Order` restarts inside each category in Notion. Keeps the snapshot diff stable.
- Inline markdown subset in content strings: `**bold**`, `` `code` ``, `[text](url)`; rendered by `src/components/ui/InlineMd.tsx`.
- Screenshots referenced in `site.json` carry `width`/`height` for `next/image`.

## Layout
```
src/
├── app/                 layout, page (composes sections), api/chat/route.ts, blog/{page,[slug],rss.xml}, projects/[slug], resume/, metadata routes
├── components/
│   ├── sections/        Hero, Experience, Projects, About, Contact, Footer
│   ├── nav/             TopNav (glass bar on scroll, active section), SectionLink (smooth anchor scroll), ThemeToggle, Clock (IST)
│   ├── chat/            ChatLauncher (FAB + panel), Chat (useChat), MessageParts, useClientTools, persist
│   ├── blog/            PostBody (renders the synced block subset), TableOfContents
│   ├── providers/       ThemeProvider
│   ├── sphere/          DisplacementSphere (client, transparent canvas), SphereBackground (idle-mounted), shaders
│   ├── resume/          ResumeViewer, ResumeModal, ResumeHost (event-driven), ResumeStandalone (/resume page)
│   └── ui/              DecoderText, InlineMd, JsonLd, ProjectStatus, ScrollProgress, SectionHeading, TrackedLink, VisuallyHidden
├── content/             schema.ts (zod), site.json (snapshot), index.ts (accessors)
├── lib/                 site.ts (origin), seo.ts (JSON-LD graphs), knowledge.ts, format.ts, events.ts,
│                        three.ts, scroll.ts, analytics.ts, chat/{prompt,tools,page-tools,model,guard}.ts
└── hooks/               usePrefersReducedMotion, useInViewport, useWindowSize, useRotatingText
scripts/                 sync-content.ts, seed-notion.ts, lib/{notion,richtext,assets,blocks,highlight}.ts
```

## Client/server boundary
- `src/content/index.ts` reaches `site.json`, and `lib/knowledge.ts` and `lib/chat/tools.ts` reach `src/content`. **A client component must never value-import any of them**: doing so bundles the entire CMS snapshot into the browser (it did, once, for 570 KB). `import type` is fine because it is erased.
- The browser gets its half of the tool contract from `lib/chat/page-tools.ts`, which deliberately has no imports. `tools.ts` re-exports it as `PAGE_TOOL_NAMES` with a `satisfies readonly ToolName[]` so a typo still fails the build.
- Guard against regressions with `grep -rl "<a string from site.json>" .next/static` after a build.

## AI assistant
- `POST /api/chat` (Node runtime, `maxDuration` 30): origin allowlist → zod body caps (20 msgs / 2000 chars per part / 8000 total) → per-IP rate limit (in-memory, or Upstash when `UPSTASH_*` is set) → last 10 UI messages → `streamText` with `stopWhen: isStepCount(3)`, `maxOutputTokens` 500, `reasoningEffort: "low"`.
- Server tools (`execute`): `search_content` (grounding: every mention of a term across the content, with source), `get_experience`, `get_projects`, `get_skills`, `get_contact_info`, all reading `site.json`. The prompt tells the model to search first whenever a question names something specific; before that tool existed it answered "what did he build with Mastra?" with the wrong project. Everything the assistant knows comes from Notion, and there are deliberately no live third-party lookups: they add a key to rotate, a rate limit to babysit, and a failure mode, to restate something the content already says.
- Page tools (no `execute`, run in the browser via `onToolCall` + `addToolOutput`): `navigate_to_section`, `set_theme`, `show_resume`, `download_resume`, `open_link`, `open_project`, `focus_contact_form`. Custom `sendAutomaticallyWhen` only resends when the model acted silently.
- Groq free tier is ~8K tokens/minute org-wide: keep `buildInstructions()` under ~700 tokens and tool descriptions terse; detail belongs behind tools.
- Rate-limit and quota errors come back as normal assistant text ("try again in N seconds"); the UI shows a countdown.
- **The body guard must accept a tool round trip.** After a page tool runs, the SDK resends with the *assistant* message last (it now holds the tool outputs). `guard.ts` allows that one case; rejecting it is what once put `{"error":"Invalid request"...}` in front of a visitor.
- The chat UI never renders `error.message`. Transport failures map to a short friendly line from `HICCUPS` in `Chat.tsx` plus a retry link; cooldowns show the countdown. Test any change to the route by driving the real UI, not only curl.
- Loose coupling via `src/lib/events.ts` (`portfolio:open-chat`, `portfolio:show-resume`).

## Copy rules
- The site is read by recruiters, not by developers. Never surface build or CMS plumbing in the UI: no "synced from Notion", no "not configured", no "the site was rebuilt". `meta.syncedAt` is for the sitemap's `lastModified`, not for the footer.
- A section heading matches what the nav calls it, so "Projects" in the nav means "Projects" as the heading.

## Environment variables (see `.env.example`)
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_FORMSPREE_ID`, `GROQ_API_KEY`, `NOTION_TOKEN`, `NOTION_ROOT_PAGE_ID`; optional `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CHAT_FALLBACK_MODEL` (empty string disables the fallback), `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

## Scripts
- `bun dev`: dev server (port 3000)
- `bun run build`: Notion sync (soft-fails to snapshot) + `next build`
- `bun run typecheck` / `bun run lint`
- `bun run content:sync` (`:strict` exits 1 on failure) · `bun run content:seed`

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
- After content edits in Notion, the deploy hook (or a push) rebuilds the site.
