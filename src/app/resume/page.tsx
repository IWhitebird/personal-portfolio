import type { Metadata } from "next";
import { ResumeStandalone } from "@/components/resume/ResumeStandalone";
import { profile } from "@/content";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${profile.name}, ${profile.headline}`,
  alternates: { canonical: "/resume" },
  openGraph: { type: "profile", url: "/resume", title: `Résumé | ${profile.name}` },
};

export default function ResumePage() {
  return (
    <main id="main" className="pt-14">
      <ResumeStandalone src={profile.resume.path} />
    </main>
  );
}
