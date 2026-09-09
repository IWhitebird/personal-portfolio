# shreyaspatange.vercel.app

Personal site of Shreyas Patange: experience, projects, skills, a résumé viewer, and an AI assistant that can answer questions about the work and operate the page (navigate, switch theme, open links).

Built with Next.js 16, React 19, Tailwind CSS v4, the Vercel AI SDK (Groq), Three.js, and Notion as the CMS.

## Run locally

```bash
bun install
cp .env.example .env         # fill in the keys you have
bun dev                      # http://localhost:3000
```

Without `GROQ_API_KEY` the assistant replies that it is not configured; without Notion keys the site uses the committed content snapshot in `src/content/site.json`.

## Edit content

All copy, experience, projects, skills, links, blog posts, and the résumé PDF live in a Notion page called **Portfolio CMS** (seven databases). To set it up once:

1. Create an internal Notion integration and an empty page; share the page with the integration.
2. Put `NOTION_TOKEN` and `NOTION_ROOT_PAGE_ID` in `.env.local`.
3. `bun run content:seed` creates the databases from the current snapshot and uploads screenshots and the résumé.

After that, edit in Notion and either run `bun run content:sync` locally or trigger a Vercel deploy (the build runs the sync). A Vercel Deploy Hook URL saved as a bookmark in the Notion page is the one-click "publish".

## Write a post

Add a row to the **Posts** database, write the body on the page, tick `Published`, and deploy. `Title`, `Date` and `Summary` are required; `Slug` defaults to a slug of the title. The page body supports paragraphs, two heading levels, bulleted, numbered and to-do lists (nested two deep), quotes, callouts, code blocks, images, bookmarks and dividers. Code is syntax-highlighted at build time, so nothing extra ships to the browser.

The "Block reference (keep unpublished)" row shows every supported block; duplicate it as a starting point. Unpublished rows never reach the site.

## Scripts

| Command | What it does |
| --- | --- |
| `bun dev` | Development server |
| `bun run build` | Sync content from Notion (falls back to the snapshot), then `next build` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | ESLint |
| `bun run content:sync` | Pull Notion → `src/content/site.json`, `public/cms`, `public/resume.pdf` |
| `bun run content:seed` | One-off: create and fill the Notion databases |

## Deploy

Vercel, framework preset Next.js, build command `bun run build`. Set the variables from `.env.example` in the project settings. `UPSTASH_REDIS_REST_*` is optional but recommended so the assistant's rate limit holds across serverless instances.
