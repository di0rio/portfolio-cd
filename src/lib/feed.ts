import { translations } from "@/i18n/generated";
import { localePath } from "@/i18n/path";
import { getBlogPosts } from "@/lib/github";
import { site } from "@/lib/site";

const esc = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

/** Feed RSS 2.0 do blog num idioma. As rotas ficam fora de [locale] porque o proxy ignora URLs com extensão. */
export async function blogFeed(locale: "pt" | "en") {
	const t = translations[locale];
	const posts = await getBlogPosts(locale);
	const blog = site.url + localePath(locale, "/blog");
	const items = posts.map((p) => {
		const url = site.url + localePath(locale, `/blog/${p.slug}`);
		const date = new Date(p.repo?.pushed_at ?? p.date).toUTCString();
		return `<item><title>${esc(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${date}</pubDate>${
			p.description ? `<description>${esc(p.description)}</description>` : ""
		}</item>`;
	});
	const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(site.name)}</title><link>${blog}</link><description>${esc(t.app.blog.intro)}</description><language>${locale === "pt" ? "pt-BR" : "en"}</language><atom:link href="${site.url}${localePath(locale, "/feed.xml")}" rel="self" type="application/rss+xml"/>${items.join("")}</channel></rss>`;
	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}
