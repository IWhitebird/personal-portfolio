/**
 * Tiny window-level event bus so loosely coupled islands (hero buttons, nav,
 * the AI assistant's client tools) can open the chat or the résumé viewer
 * without prop drilling through the server-rendered page.
 */
export const EVENTS = {
  openChat: "portfolio:open-chat",
  closeChat: "portfolio:close-chat",
  showResume: "portfolio:show-resume",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export function emit<T = unknown>(name: EventName, detail?: T): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<T = unknown>(name: EventName, handler: (detail: T) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
