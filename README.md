# iwhitebird.com

Personal site of Shreyas Patange: experience, projects, skills, a résumé viewer, and an AI assistant that can answer questions about the work and operate the page (navigate, switch theme, open links).

Built with Next.js 16, React 19, Tailwind CSS v4, the Vercel AI SDK (Groq), Three.js, and Notion as the CMS.

## Run locally

```bash
bun install
cp .env.example .env         # fill in the keys you have
vercel link && vercel env pull .env.local   # once, for the Blob credentials
bun dev                      # http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL`, the Notion keys and a connected Vercel Blob store are required: the site has no bundled content to fall back on. Without `GROQ_API_KEY` the assistant replies that it is not configured.

## Edit content

All copy, experience, projects, skills, links and blog posts live in a Notion page called **Portfolio CMS** (seven databases). The résumé PDF lives in a public Google Drive folder; its share link is a property on the `Profile` row.

Edit in Notion and the change is live within the hour: pages are prerendered from a cached fetch that revalidates every 60 minutes. To publish immediately, redeploy.

Screenshots are copied out of Notion into Vercel Blob the first time they are seen, named by content hash, and served through `next/image`.

## Write a post

Add a row to the **Posts** database, write the body on the page, and tick `Published`. `Title`, `Date` and `Summary` are required; `Slug` defaults to a slug of the title. The page body supports paragraphs, two heading levels, bulleted, numbered and to-do lists (nested two deep), quotes, callouts, code blocks, images, bookmarks and dividers. Code is syntax-highlighted on the server, so nothing extra ships to the browser.

The "Block reference (keep unpublished)" row shows every supported block; duplicate it as a starting point. Unpublished rows never reach the site.

## Update the résumé

Replace the file in the Drive folder. Nothing in the repo or in Notion changes. If Drive assigns a new file id, paste the new share link into `Profile` → `Resume URL`.

## Scripts

| Command | What it does |
| --- | --- |
| `bun dev` | Development server |
| `bun run build` | `next build` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | ESLint |

## Deploy

Vercel. `vercel.json` pins the framework to Next.js and the install command to `bunx bun@1.4.2 install`, because the build image's bun is older than the one that writes this repo's lockfile. Bump that version when you upgrade bun locally.

Set the variables from `.env.example` in the project settings, and connect a Blob store under **Storage** for all environments (including Development, which is what `vercel env pull` reads).

`UPSTASH_REDIS_REST_*` is optional but recommended so the assistant's rate limit holds across serverless instances.
