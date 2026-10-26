# AI assistant: improvement plan (plan only, nothing built yet)

## 1. What works today and what is weak

### What works
- **Grounding.** `search_content` returns each hit with its source (`src/lib/knowledge.ts:75-98`). The prompt tells the model to search first and to answer only from what it finds (`src/lib/chat/prompt.ts:17`). It already covers experience bullets, project case studies, skills, achievements, the About text and the new `now` line (`knowledge.ts:82-93`).
- **Token budget.** The system prompt is small (`summaryFacts`, `knowledge.ts:101-123`). History is cut to 10 messages (`route.ts:20,41-45`), output is capped at 500 tokens and reasoning effort is low (`route.ts:100-106`).
- **Safety.** Requests are checked for origin, body size and per-IP rate, and the guard allows a tool round trip (`guard.ts:11-42, 60-124`). The visitor never sees raw errors (`Chat.tsx:31-42`, `route.ts:47-58`).
- **Page tools.** Scroll, theme, résumé, links, project demos and the contact form all run in the browser (`useClientTools.ts:32-85`). The model only resends when it acted without saying anything (`Chat.tsx:23-28`).
- **Small details.** The chat code loads only when the panel first opens (`ChatLauncher.tsx:11`). There is Cmd/Ctrl+K, the `/#assistant` deep link (`ChatLauncher.tsx:39-51`), conversation memory per tab (`persist.ts`), and a cleanup of tool calls left half-done by a reload (`persist.ts:37-52`).

### What is weak

| Area | Finding | Where |
|---|---|---|
| **Doesn't know the new content** | Nothing about writing or the blog. `searchContent` does not search `content.posts` or education, and the prompt never mentions writing. | `knowledge.ts:82-93`, `prompt.ts:11-25` |
| | No link to proomt: `PLATFORMS` and `SocialsSchema` only have github, linkedin, leetcode and x, so "open his blog" has nothing to open. | `page-tools.ts:9`, `schema.ts:18-23` |
| | Project status is missing from the prompt facts. Only featured projects are listed, with no status, so "is Valka finished?" depends on the model choosing to call `get_projects`. | `knowledge.ts:105,116` |
| | The `now` line is labelled "Building on the side", which undersells proomt if it is the main thing he is building. | `knowledge.ts:112` |
| **Answers don't point anywhere** | Each search hit has a `source`, but the UI only shows "searched for X". The visitor never sees where on the page the fact lives. | `MessageParts.tsx:27,69-77` |
| | There are no anchors below section level: experience rows and project articles have no DOM `id`. `navigate_to_section` only knows 5 sections (no skills, no blog). `open_project` only opens external links and cannot scroll to the card. | `Experience.tsx:20`, `Projects.tsx:59`, `page-tools.ts:8` |
| **First open** | One muted line plus static chips from Notion `Chat Suggestions` (`content.ts:305`). No intro saying what it is. No follow-up suggestions after an answer. The placeholder "ask anything" contradicts the rule to decline off-topic questions. | `Chat.tsx:192-208, 249` |
| | The title bar reads `shreyas.terminal`, an in-joke for developers. Recruiters are the main audience. | `Chat.tsx:175` |
| | The chat code is fetched on the first click and there is no loading view, so the panel slides in empty. | `ChatLauncher.tsx:11` |
| **Latency feel** | Questions that name something take at least two model steps (search, then answer) on a reasoning model. While waiting, the only feedback is a blinking cursor. | `Chat.tsx:215-220`, `route.ts:99` |
| | `get_projects("")` returns the full description of every project. As the project list grows, this inflates tokens per minute. | `knowledge.ts:31-44` |
| **Errors and quota** | The per-IP rate limit replies with plain assistant text (`route.ts:76-80`). The client starts its countdown only from `onError` (`Chat.tsx:79-86`), so a rate-limited visitor gets no countdown and the input stays enabled. | `route.ts:76-80`, `Chat.tsx:79-86` |
| | `isQuotaError` treats every 5xx as quota, so a Groq outage shows "busy, try again in 20 seconds", which is misleading. | `model.ts:11` |
| | The rate limit is held in memory per instance unless Upstash is configured. One model, no fallback, and no answer at all when Groq's free tier is exhausted. | `guard.ts:81-124`, `model.ts:22-25` |
| **Accessibility** | Streamed answers are not announced: there is no `aria-live` on the message list. | `Chat.tsx:191` |
| | The dialog has no `aria-modal`, no focus trap, and focus does not return to the trigger on close. | `ChatLauncher.tsx:110-114` |
| | The button's visible text "Ask AI" differs from its accessible name "Ask the assistant" (WCAG 2.5.3). | `ChatLauncher.tsx:89-93` |
| **Mobile** | The input is 13.5px, below the 16px at which iOS zooms in on focus. | `Chat.tsx:169, 254` |
| | The input autofocuses on open, so the keyboard pops up over the suggestions. | `Chat.tsx:120-123` |
| **Can't answer** | Typical recruiter questions: notice period, work authorisation, remote or relocation, interview availability, what he writes about. There is no data for these, so it falls back to "use the contact form". | Content gap |

## 2. Improvements, ranked by value to a recruiter

### 1. Make it aware of the new content (proomt, writing, statuses, Now, programs). Effort S. Risk low.
- **What changes:**
  - Add a `Writing URL` property on the Notion Profile row, asserted in `assertProps`, or a `proomt` social.
  - Add `proomt` to `PLATFORMS` and the `open_link` handler.
  - Add `Writes at proomt.com/u/iwhitebird` and status tags to the fact block, for example `proomt (WIP)` and `Valka (WIP)`.
  - Rename the line to "Building now".
  - Add posts (title and summary) to `searchContent`.
  - Add one prompt rule: say a WIP project is in progress and do not describe it as shipped.
  - AWS Activate and Claude for Startups need no code if they are Achievements rows, because achievements already feed the facts and search (`knowledge.ts:91,115`).
- **Files:** `knowledge.ts`, `prompt.ts`, `page-tools.ts`, `tools.ts` (enum flows through), `useClientTools.ts`, `schema.ts`, `cms/content.ts`.
- **Risk:** the fact block grows. Keep the instructions under about 700 tokens and check the `tokens` field in the `[chat]` log line (`route.ts:107-117`).
- **Check in the real UI:** ask "Where does he write?" (should name and open proomt), "Is Valka done?" (should say in progress), "What is AWS Activate?" (should give the achievement with its source), and "What is he working on now?".

### 2. A better first open. Effort S. Risk low.
- **What changes:**
  - **Chips (Notion only, no code).** Rewrite `Chat Suggestions` to 4 or 5 chips: "What is proomt?", "What is he building right now?", "Tell me about AWS Activate and Claude for Startups", "Where can I read his writing?", "Is he open to new roles?".
  - **Intro (code).** Add a one-line intro in plain sans, for example "I can answer questions about Shreyas's work and take you to the right part of the page."
  - **Title bar.** Use "Ask about Shreyas" instead of `shreyas.terminal`, but keep the mono styling for the transcript.
  - **Placeholder.** "Ask about his work".
  - **Follow-up chips.** After each answer, show up to 2 unused suggestions, picked on the client from the same list. The model is not involved.
  - **Preload.** Fetch the `Chat` chunk on hover, focus or idle of the floating button so the panel never opens empty.
- **Files:** `Chat.tsx`, `ChatLauncher.tsx`, Notion.
- **Check in the real UI:** cold load with the network throttled, then click "Ask AI". The panel should arrive filled. Click each chip and confirm each answer is grounded (a tool label appears).

### 3. Answers that cite where the fact is and can scroll there. Effort M. Risk medium.
- **What changes:**
  - Give each search hit and each `get_*` result a stable `anchor`, for example `exp-<id>` and `project-<id>`.
  - Add matching `id`s and `scroll-margin` to the experience `li` and project `article`.
  - Under an answer, show small source links built from the tool outputs already in the message parts (for example "Experience, Skylark" and "Projects, Valka"). They are derived on the client, so the model cannot invent an anchor.
  - Clicking a source scrolls there and briefly outlines the target. This is motion that answers a click, which the design rules allow.
  - Optionally, `open_project` falls back to scrolling to the card when the project has no demo.
- **Files:** `knowledge.ts`, `MessageParts.tsx`, `Experience.tsx`, `Projects.tsx`, `lib/scroll.ts`, `useClientTools.ts`.
- **Risk:** the anchors must survive changes to the project layout. On mobile the sheet covers the page, so clicking a source should soft-close it, the same way `navigate_to_section` does.
- **Check in the real UI:** ask "What did he build with Mastra?", click the source link, and confirm the right row lands under the nav on desktop and on mobile.

### 4. Graceful degradation on the Groq free tier. Effort M. Risk low.
- **What changes:**
  - **Rate-limit path.** Send the cooldown as an error, or as a data part the client reads, so the countdown and disabled input also apply when the rate limit trips (`route.ts:76-80`).
  - **Separate outages from quota.** Only 429 counts as quota. A 5xx gets "having trouble, try again shortly" without a fake countdown.
  - **Canned answers for the chips.** Build them on the server from content, for example the chip "What is he building now?" answers with `profile.now` plus links. The chips are then served without a model call, so the most common questions still work when the quota is gone.
  - **Smaller project tool output.** `get_projects("")` returns name, status and summary only. Full details only when a name filter is given.
  - **Upstash.** Turn it on in production so limits hold across instances.
  - **Owner decision.** A second Groq model with its own tokens-per-minute pool as fallback. CLAUDE.md says "no fallback model" on purpose, so this needs an explicit yes.
- **Files:** `route.ts`, `model.ts`, `Chat.tsx`, `knowledge.ts`, `tools.ts`.
- **Check in the real UI:** temporarily drop `PER_MINUTE` locally, send messages until the limit trips, and confirm the countdown appears and the input disables. Click a chip while limited: it should still answer.

### 5. Accessibility and mobile quick wins. Effort S. Risk low.
- **What changes:**
  - Add `aria-live="polite"` on a visually hidden region that receives each finished answer (not the token-by-token stream).
  - Add `aria-modal` to the dialog, trap focus, and return focus to the trigger on close.
  - Match the button's accessible name to its visible text ("Ask AI").
  - Make the input 16px on mobile.
  - Skip autofocus on touch devices.
  - Make sure Escape does not close the chat when the résumé modal is on top.
- **Files:** `Chat.tsx`, `ChatLauncher.tsx`.
- **Check in the real UI:** keyboard only (Tab, Escape, Cmd+K), VoiceOver or NVDA reading an answer, and an iOS Safari focus test.

### 6. Answer recruiter logistics. Effort S. Risk low (content decision).
- **What changes:** add an `Assistant Notes` rich-text property on Profile (notice period, remote or relocation, work authorisation, preferred roles). Put it behind `get_contact_info` and inside search, not in the always-on prompt facts.
- **Files:** `cms/content.ts`, `schema.ts`, `knowledge.ts`, Notion.
- **Check in the real UI:** ask "Is he open to relocation?" and confirm it answers from the notes, or sends the visitor to the contact form when the notes are empty.

### 7. Optional, later: a homepage chat box. Effort M to L. Risk medium (design rules).
None of the three layouts below may add an entrance animation: the box renders static and still, because the hero decode and sphere fade are the only entrance animation allowed.

| Layout | What it is | Trade-offs |
|---|---|---|
| **A. Hero prompt line** (recommended) | Replace the hero's "Ask the assistant" button (`Hero.tsx:84-87`) with a one-line input in the same mono style as the tagline line, plus 2 chips under it. Submitting opens the panel with the question already sent. | Keeps exactly **two** entry points, since it replaces the hero button rather than adding one. Small change, and loads no AI code until a visitor types. Risks crowding the hero next to the Now line and the tagline, so it must sit where the button row is today. |
| **B. "Questions before you reach out?" strip** above Contact | Input plus 3 chips that open the panel. | Catches visitors at the decision point. Adds a **third** entry point, so the rule in CLAUDE.md would need updating. Moderate effort. |
| **C. Inline embedded conversation** in its own section | The full chat renders in the page. | Most "wow", but it duplicates the panel's state and tools, pulls the AI SDK into the main page, makes the page jump as answers stream, and breaks the two-entry-points rule. Highest effort and highest maintenance. Not recommended. |

## 3. Recommended first slice (1 to 2 days)

**Day 1, content and first open (items 1 and 2):**
- The proomt link and the `open_link` platform.
- Status tags and the "Building now" wording in the facts.
- Posts added to search.
- The WIP rule in the prompt.
- The rewritten Notion `Chat Suggestions` and the intro line.
- The recruiter-friendly title and placeholder.
- Preloading the chat code on hover or idle.

**Day 2, robustness (items 4 partial and 5):**
- The rate-limit countdown fix.
- Only 429 counts as quota.
- The smaller `get_projects("")` output.
- The accessibility and mobile quick wins.

**After that, as their own changes:** item 3 (source links with scroll), then item 6, then the homepage box (layout A) once the owner signs off on the entry-point rule.

**Verification:** to keep hot reload off as much as possible, start one dev server on port 3100 only to drive the real panel. Run through the questions from items 1 and 2, the forced rate-limit case, and a mobile viewport, then stop the server. Finish with `bun run typecheck` and `bun run lint`.

**Before building:** confirm the exact writing URL. The request said "prompt.com/iwhitebird", the brief says `proomt.com/u/iwhitebird`, and the owner's email domain is proomt.com.