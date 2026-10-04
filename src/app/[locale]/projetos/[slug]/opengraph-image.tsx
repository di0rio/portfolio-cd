import { translations } from "@/i18n/generated";
import { locales } from "@/i18n/server";
import { pageOg } from "@/lib/og";
import { projects } from "@/lib/projects";

export const alt = "case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
	return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}) {
	const { locale, slug } = await params;
	const lang = locales.find((l) => l === locale) ?? "pt";
	const project = projects.find((p) => p.slug === slug);
	const copy = translations[lang].app.projetos;
	return pageOg({
		path: `projetos/${slug}`,
		title: project?.name ?? slug,
		description: project ? copy[project.key].intro : copy.caseStudy,
	});
}
