import { About } from "@/components/sections/About";
import { Achievements } from "@/components/sections/Achievements";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { SphereBackground } from "@/components/sphere/SphereBackground";
import { getContent } from "@/lib/cms/content";
import { RESUME_PATH } from "@/lib/resume";
import { blogLink, featuredProjects, otherProjects, skillsByCategory, socialLinks } from "@/lib/cms/select";

export default async function HomePage() {
  const content = await getContent();
  const { profile } = content;
  const socials = socialLinks(content);
  const now = new Date(content.meta.fetchedAt);

  return (
    <main id="main">
      <SphereBackground />
      <Hero profile={profile} resumePath={RESUME_PATH} socials={socials} />
      <Experience items={content.experience} now={now} />
      <Projects featured={featuredProjects(content)} others={otherProjects(content)} intro={profile.projectsIntro} />
      <Achievements items={content.achievements} />
      <About profile={profile} education={content.education} skillGroups={skillsByCategory(content)} />
      <Contact profile={profile} socials={socials} formspreeId={process.env.NEXT_PUBLIC_FORMSPREE_ID} />
      <Footer
        name={profile.name}
        email={profile.email}
        resumePath={RESUME_PATH}
        blog={blogLink(content)}
        year={now.getFullYear()}
      />
    </main>
  );
}
