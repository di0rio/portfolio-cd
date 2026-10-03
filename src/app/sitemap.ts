import type { MetadataRoute } from "next";
import { localePath } from "@/i18n/path";
import { getBlogRepos } from "@/lib/github";
import { site } from "@/lib/site";

// Cada página entra nas duas línguas, apontando uma pra outra (hreflang).
function entry(path: string, extra: Omit<MetadataRoute.Sitemap[number], "url"> = {}): MetadataRoute.Sitemap {
  const pt = site.url + localePath("pt", path);
  const en = site.url + localePath("en", path);
  const languages = { "pt-BR": pt, en };
  return [
    { url: pt, alternates: { languages }, ...extra },
    { url: en, alternates: { languages }, ...extra },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogRepos();
  return [
    ...entry("/", { changeFrequency: "monthly", priority: 1 }),
    ...entry("/blog", { changeFrequency: "weekly", priority: 0.8 }),
    ...posts.flatMap((p) => entry(`/blog/${p.name}`, { lastModified: p.pushed_at, priority: 0.6 })),
  ];
}
