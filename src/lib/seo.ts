import { achievements, education, experience, profile, site, socialLinks } from "@/content";
import type { Post, Project } from "@/content/schema";
import { absolute, siteUrl } from "./site";

const PERSON = `${siteUrl}/#person`;
const WEBSITE = `${siteUrl}/#website`;
const BLOG = `${siteUrl}/#blog`;

const person = () => ({ "@id": PERSON });

/**
 * One `@graph` per page rather than several loose blocks, so Google resolves
 * Person, WebSite and the page node to the same entities across the site.
 */
export function homeGraph() {
  const current = experience.find((e) => e.end === null) ?? experience[0];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON,
        name: profile.name,
        url: siteUrl,
        description: profile.seo.description,
        jobTitle: current?.role,
        worksFor: current ? { "@type": "Organization", name: current.company, url: current.companyUrl } : undefined,
        alumniOf: education.map((e) => ({ "@type": "EducationalOrganization", name: e.institution })),
        knowsAbout: site.skills.filter((s) => s.highlight).map((s) => s.name),
        award: achievements.map((a) => a.text.replace(/\*\*|`|\[|\]\([^)]*\)/g, "")),
        sameAs: socialLinks().map((s) => s.href),
        ...(profile.location ? { address: { "@type": "PostalAddress", addressLocality: profile.location } } : {}),
        ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE,
        url: siteUrl,
        name: profile.name,
        description: profile.seo.description,
        inLanguage: "en",
        publisher: person(),
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profilepage`,
        url: siteUrl,
        name: profile.seo.title,
        isPartOf: { "@id": WEBSITE },
        about: person(),
        mainEntity: person(),
      },
    ],
  };
}

export function blogGraph(posts: Post[], description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": BLOG,
        url: absolute("/blog"),
        name: `Blog | ${profile.name}`,
        description,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE },
        author: person(),
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          "@id": absolute(`/blog/${post.slug}#post`),
          headline: post.title,
          datePublished: post.date,
          url: absolute(`/blog/${post.slug}`),
        })),
      },
      breadcrumbs([{ name: "Blog", path: "/blog" }]),
    ],
  };
}

export function postGraph(post: Post) {
  const url = absolute(`/blog/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: post.title,
        description: post.summary,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        timeRequired: `PT${post.readingMinutes}M`,
        keywords: post.tags.length ? post.tags.join(", ") : undefined,
        image: post.cover ? absolute(post.cover.src) : absolute(`/blog/${post.slug}/opengraph-image`),
        inLanguage: "en",
        isPartOf: { "@id": BLOG },
        author: person(),
        publisher: person(),
      },
      breadcrumbs([
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  };
}

export function projectGraph(project: Project) {
  const url = absolute(`/projects/${project.id}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#project`,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        name: project.name,
        description: project.summary,
        programmingLanguage: project.tech,
        ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
        ...(project.images[0] ? { image: absolute(project.images[0].src) } : {}),
        author: person(),
        isPartOf: { "@id": WEBSITE },
      },
      breadcrumbs([
        { name: "Projects", path: "/#projects" },
        { name: project.name, path: `/projects/${project.id}` },
      ]),
    ],
  };
}

function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: profile.name, item: siteUrl },
      ...trail.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: absolute(crumb.path),
      })),
    ],
  };
}
