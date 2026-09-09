import { bundledLanguages, codeToHtml } from "shiki";

/**
 * Syntax highlighting is done here, at sync time, so posts ship pre-coloured
 * with no highlighter in the browser bundle. `defaultColor: false` emits
 * `--shiki-light` / `--shiki-dark` custom properties per span, which
 * globals.css picks the right one from.
 */
const THEMES = { light: "github-light", dark: "github-dark" } as const;

const ALIASES: Record<string, string> = {
  "plain text": "text",
  plaintext: "text",
  "c++": "cpp",
  "c#": "csharp",
  "objective-c": "objc",
  shell: "bash",
  sh: "bash",
};

function resolveLanguage(language: string): string {
  const key = ALIASES[language.toLowerCase()] ?? language.toLowerCase();
  return key in bundledLanguages ? key : "text";
}

export async function highlight(code: string, language: string): Promise<string> {
  return codeToHtml(code, {
    lang: resolveLanguage(language),
    themes: THEMES,
    defaultColor: false,
  });
}
