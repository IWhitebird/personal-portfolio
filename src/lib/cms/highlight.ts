import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/**
 * Syntax highlighting runs server-side while content is fetched, so posts ship
 * pre-coloured with no highlighter in the browser bundle. `defaultColor: false`
 * emits `--shiki-light` / `--shiki-dark` custom properties per span, which
 * globals.css picks the right one from.
 *
 * Languages are listed explicitly rather than pulled from shiki's full bundle:
 * the bundle is ~7 MB of grammars and only these reach a code block.
 */
const LANGUAGES = {
  bash: () => import("@shikijs/langs/bash"),
  cpp: () => import("@shikijs/langs/cpp"),
  css: () => import("@shikijs/langs/css"),
  dockerfile: () => import("@shikijs/langs/dockerfile"),
  go: () => import("@shikijs/langs/go"),
  html: () => import("@shikijs/langs/html"),
  javascript: () => import("@shikijs/langs/javascript"),
  json: () => import("@shikijs/langs/json"),
  markdown: () => import("@shikijs/langs/markdown"),
  python: () => import("@shikijs/langs/python"),
  rust: () => import("@shikijs/langs/rust"),
  sql: () => import("@shikijs/langs/sql"),
  tsx: () => import("@shikijs/langs/tsx"),
  typescript: () => import("@shikijs/langs/typescript"),
  yaml: () => import("@shikijs/langs/yaml"),
} as const;

type Language = keyof typeof LANGUAGES;

const ALIASES: Record<string, Language> = {
  "c++": "cpp",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  js: "javascript",
  jsx: "tsx",
  ts: "typescript",
  typescript: "typescript",
  tsx: "tsx",
  py: "python",
  python: "python",
  yml: "yaml",
  md: "markdown",
  docker: "dockerfile",
};

function resolveLanguage(language: string): Language | null {
  const key = language.toLowerCase();
  if (key in LANGUAGES) return key as Language;
  return ALIASES[key] ?? null;
}

// One highlighter per process, reused across regenerations. Holding the promise
// (not the resolved value) means concurrent callers share a single load.
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [import("@shikijs/themes/github-light"), import("@shikijs/themes/github-dark")],
    langs: Object.values(LANGUAGES).map((load) => load()),
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

export async function highlight(code: string, language: string): Promise<string> {
  const lang = resolveLanguage(language);
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: lang ?? "text",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
