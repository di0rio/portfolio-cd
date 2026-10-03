import type { MetadataRoute } from "next";
import { getBlogRepos } from "@/lib/github";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogRepos();
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.name}`, lastModified: p.pushed_at, priority: 0.6 })),
  ];
}
