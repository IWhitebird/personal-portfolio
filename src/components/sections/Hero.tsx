"use client";

import type { IconType } from "react-icons";
import { FiDownload, FiGithub, FiLinkedin, FiMessageSquare } from "react-icons/fi";
import { SiLeetcode, SiX } from "react-icons/si";
import { DecoderText } from "@/components/ui/DecoderText";
import { useRotatingText } from "@/hooks/useRotatingText";
import { track } from "@/lib/analytics";
import { EVENTS, emit } from "@/lib/events";
import type { Profile } from "@/lib/cms/schema";
import { RESUME_FILENAME } from "@/lib/resume";
import type { SocialKey } from "@/lib/cms/schema";

const SOCIAL_ICONS: Record<SocialKey, IconType> = {
  github: FiGithub,
  linkedin: FiLinkedin,
  leetcode: SiLeetcode,
  x: SiX,
};

type Props = {
  profile: Profile;
  resumePath: string;
  socials: { key: SocialKey; label: string; href: string }[];
};

export function Hero({ profile, resumePath, socials }: Props) {
  const tagline = useRotatingText(profile.taglines);
  const isOpen = profile.availability.status !== "not-looking";

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="hero-rise container-x relative pb-24 pt-32 md:pb-28 md:pt-24">
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <span
            aria-hidden
            className={`inline-block h-[7px] w-[7px] rounded-full ${isOpen ? "live-dot bg-accent" : "bg-muted"}`}
          />
          {profile.availability.label}
        </p>

        <h1 className="display mt-5 text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.95] tracking-[-0.02em] text-fg">
          <DecoderText text={profile.name} />
        </h1>

        <p className="mt-6 max-w-[36ch] text-[clamp(1.125rem,2.1vw,1.5rem)] leading-snug text-fg-soft">
          {profile.headline}
        </p>

        <p className="mt-5 flex h-6 items-center font-mono text-[13px] text-muted" aria-live="off">
          <span aria-hidden className="mr-2 text-accent/70">{">"}</span>
          <span>{tagline.text}</span>
          <span aria-hidden className="block-cursor" />
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              track("resume_view", { from: "hero" });
              emit(EVENTS.showResume);
            }}
          >
            View résumé
          </button>
          <a
            className="btn-ghost"
            href={resumePath}
            download={RESUME_FILENAME}
            onClick={() => track("resume_download", { from: "hero" })}
          >
            <FiDownload size={15} />
            Download PDF
          </a>
          <button type="button" className="btn-ghost" onClick={() => emit(EVENTS.openChat)}>
            <FiMessageSquare size={15} />
            Ask the assistant
          </button>
        </div>

        <ul className="mt-14 flex items-center gap-5">
          {socials.map(({ key, label, href }) => {
            const Icon = SOCIAL_ICONS[key];
            return (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={label}
                  onClick={() => track("social_open", { platform: key })}
                  className="block text-muted transition-[color,transform] duration-200 ease-out-quart hover:text-accent hover:-translate-y-0.5"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
