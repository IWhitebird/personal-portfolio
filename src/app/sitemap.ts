import type { MetadataRoute } from "next";
import { allProjects, meta, posts } from "@/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(meta.syncedAt);
  const all = posts();

  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/resume`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${siteUrl}/blog`,
      lastModified: all[0] ? new Date(all[0].updated ?? all[0].date) : lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...allProjects().map((project) => ({
      url: `${siteUrl}/projects/${project.id}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...all.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
