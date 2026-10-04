import type { Metadata } from "next";
import { Suspense } from "react";
import { LogFallback, LogView } from "@/components/log-view";
import { PageHeader } from "@/components/page-header";
import { alternates, getT } from "@/i18n/server";
import { getSiteCommits } from "@/lib/github";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.log.title,
		description: t.app.log.description,
		alternates: alternates(locale, "/log"),
	};
}

const link =
	"underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand";

export default async function Log() {
	const { t, dateLocale } = await getT();
	const copy = t.app.log;
	const commits = await getSiteCommits();
	const props = {
		commits,
		locale: dateLocale,
		labels: {
			heat: copy.heatLabel,
			less: copy.heatLess,
			more: copy.heatMore,
			commit: copy.commitOne,
			commits: copy.commitMany,
			clear: copy.clear,
			none: copy.noMatch,
			filterBy: copy.filterBy,
		},
	};

	return (
		<>
			<PageHeader intro={copy.intro} title={copy.title} />

			{commits.length === 0 ? (
				<p className="text-muted-foreground">{copy.empty}</p>
			) : (
				// useSearchParams (filtros no URL) pede Suspense: o fallback é a versão sem filtro, e a página segue estática.
				<Suspense fallback={<LogFallback {...props} />}>
					<LogView {...props} />
				</Suspense>
			)}

			<p className="text-muted-foreground text-sm">
				<a
					className={link}
					href={`https://github.com/${site.github}/portfolio-cd/commits`}
					rel="noopener noreferrer"
					target="_blank"
				>
					{copy.all}
				</a>
			</p>
		</>
	);
}
