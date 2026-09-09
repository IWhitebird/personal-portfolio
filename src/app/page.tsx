import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { SphereBackground } from "@/components/sphere/SphereBackground";
import {
  achievements,
  education,
  experience,
  featuredProjects,
  otherProjects,
  posts,
  profile,
  skillsByCategory,
  socialLinks,
} from "@/content";

export default function HomePage() {
  const socials = socialLinks();

  return (
    <main id="main">
      <SphereBackground />
      <Hero profile={profile} socials={socials} />
      <Experience items={experience} />
      <Projects featured={featuredProjects()} others={otherProjects()} />
      <About profile={profile} education={education} achievements={achievements} skillGroups={skillsByCategory()} />
      <Contact profile={profile} socials={socials} formspreeId={process.env.NEXT_PUBLIC_FORMSPREE_ID} />
      <Footer name={profile.name} email={profile.email} resumePath={profile.resume.path} showBlog={posts().length > 0} />
    </main>
  );
}
