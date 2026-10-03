import { translations } from "@/i18n/generated";
import { locales } from "@/i18n/server";
import { getBlogPost } from "@/lib/github";
import { pageOg } from "@/lib/og";

export const alt = "blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string; repo: string }> }) {
  const { locale, repo: slug } = await params;
  const lang = locales.find((l) => l === locale) ?? "pt";
  // Só posts da lista do blog: senão qualquer nome na URL viraria uma imagem (texto arbitrário + cache sem limite).
  const post = await getBlogPost(slug, lang).catch(() => undefined);
  if (!post) return new Response(null, { status: 404 });
  return pageOg({
    path: `blog/${post.slug}`,
    title: post.title,
    description: post.description ?? translations[lang].app.blog.intro,
  });
}
