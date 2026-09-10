import type { Metadata } from "next";
import { ResumeStandalone } from "@/components/resume/ResumeStandalone";
import { getContent } from "@/lib/cms/content";
import { RESUME_PATH } from "@/lib/resume";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();

  return {
    title: "Résumé",
    description: `Résumé of ${profile.name}, ${profile.headline}`,
    alternates: { canonical: "/resume" },
    openGraph: { type: "profile", url: "/resume", title: `Résumé | ${profile.name}` },
  };
}

export default function ResumePage() {
  return (
    <main id="main" className="pt-14">
      <ResumeStandalone src={RESUME_PATH} />
    </main>
  );
}
