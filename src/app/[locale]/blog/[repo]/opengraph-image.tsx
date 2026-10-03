import { translations } from "@/i18n/generated";
import { locales } from "@/i18n/server";
import { getBlogRepo } from "@/lib/github";
import { pageOg } from "@/lib/og";

export const alt = "blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string; repo: string }> }) {
  const { locale, repo: name } = await params;
  const lang = locales.find((l) => l === locale) ?? "pt";
  // Só repos da lista do blog: senão qualquer nome na URL viraria uma imagem (texto arbitrário + cache sem limite).
  const repo = await getBlogRepo(name).catch(() => undefined);
  if (!repo) return new Response(null, { status: 404 });
  return pageOg({
    path: `blog/${repo.name}`,
    title: repo.name,
    description: repo.description ?? translations[lang].app.blog.intro,
  });
}
