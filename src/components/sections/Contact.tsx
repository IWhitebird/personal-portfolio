"use client";

import { useRef, useState, type FormEvent } from "react";
import { DecoderText } from "@/components/ui/DecoderText";
import { useInViewport } from "@/hooks/useInViewport";
import { track } from "@/lib/analytics";
import type { Profile } from "@/lib/cms/schema";
import type { SocialKey } from "@/lib/cms/schema";

type Props = {
  profile: Profile;
  socials: { key: SocialKey; label: string; href: string }[];
  formspreeId?: string;
};

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({ profile, socials, formspreeId }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInViewport(sectionRef, { threshold: 0.05 }, true);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formspreeId) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { errors?: { message: string }[] } | null;
        throw new Error(body?.errors?.map((x) => x.message).join(", ") || `Request failed (${res.status})`);
      }
      form.reset();
      setStatus("sent");
      track("contact_submit");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section id="contact" ref={sectionRef} className="container-x py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <h2 className="display text-[2.625rem] leading-none tracking-[-0.02em] text-fg md:text-[3.625rem]">
            <DecoderText text="Say hi" start={inView} delayMs={100} />
          </h2>
          <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed text-muted">
            Have a role, a project, or a hard systems problem? Send a message here or write to me directly.
          </p>
          {profile.email ? (
            <p className="mt-6">
              <a href={`mailto:${profile.email}`} className="link text-[16px]">
                {profile.email}
              </a>
            </p>
          ) : null}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
            {socials.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer me" className="link">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-7 md:pl-8">
          {status === "sent" ? (
            <div className="rounded-lg border border-line bg-surface p-6 shadow-panel" role="status">
              <p className="text-[17px] font-medium text-fg">Sent.</p>
              <p className="mt-1 text-[15px] text-muted">Thanks for writing. I usually reply within a day or two.</p>
              <button type="button" className="btn-ghost mt-5" onClick={() => setStatus("idle")}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5" noValidate={false}>
              <label className="grid gap-2 text-[14px] text-muted">
                Your email
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-md border border-line bg-surface px-3 text-[15px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </label>
              <label className="grid gap-2 text-[14px] text-muted">
                Message
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="What are you building?"
                  className="min-h-[9rem] resize-y rounded-md border border-line bg-surface px-3 py-2.5 text-[15px] leading-relaxed text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </label>
              {/* Formspree honeypot */}
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" className="btn-primary" disabled={status === "sending" || !formspreeId}>
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
                {!formspreeId ? (
                  <p className="text-[13px] text-muted">The form is unavailable right now. Email works.</p>
                ) : null}
                {status === "error" ? (
                  <p className="text-[13px] text-muted" role="alert">
                    Couldn&apos;t send ({error}). Email me instead.
                  </p>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
