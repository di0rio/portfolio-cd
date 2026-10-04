import type { Metadata } from "next";
import Link from "next/link";
import { Heatmap } from "@/components/heatmap";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { getContributions, getRecentRepos } from "@/lib/github";
import { projects } from "@/lib/projects";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.agora.title,
		description: t.app.agora.description,
		alternates: alternates(locale, "/agora"),
	};
}

const link =
	"underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand";

// Unidades do maior pro menor; a primeira em que a diferença cabe vira o texto ("há 3 dias").
const units: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 365 * 86400],
	["month", 30 * 86400],
	["day", 86400],
	["hour", 3600],
	["minute", 60],
];

function ago(rtf: Intl.RelativeTimeFormat, iso: string) {
	const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
	const [unit, size] = units.find(([, s]) => Math.abs(seconds) >= s) ?? [
		"minute",
		60,
	];
	return rtf.format(Math.trunc(seconds / size), unit);
}

export default async function Agora() {
	const { t, locale, dateLocale } = await getT();
	const copy = t.app.agora;
	const [repos, contributions] = await Promise.all([
		getRecentRepos(),
		getContributions(),
	]);
	const rtf = new Intl.RelativeTimeFormat(dateLocale, { numeric: "auto" });
	const fmt = new Intl.DateTimeFormat(dateLocale, {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
	const study = [copy.study1, copy.study2, copy.study3];

	return (
		<>
			<PageHeader intro={copy.intro} title={copy.title} />

			<Section id="mexendo" title={copy.workingTitle}>
				{repos.length === 0 ? (
					<p className="text-muted-foreground">{copy.workingEmpty}</p>
				) : (
					<ul className="flex flex-col gap-6">
						{repos.map((repo) => {
							const project = projects.find(
								(p) =>
									p.slug === repo.name.toLowerCase() ||
									p.repo?.toLowerCase().endsWith(`/${repo.name.toLowerCase()}`),
							);
							return (
								<li key={repo.name}>
									<a
										className={link}
										href={repo.url}
										rel="noopener noreferrer"
										target="_blank"
									>
										{repo.name}
									</a>
									{repo.description && (
										<p className="text-muted-foreground">{repo.description}</p>
									)}
									<p className="mt-0.5 text-muted-foreground text-sm">
										{repo.language && (
											<span className="font-mono">{repo.language} · </span>
										)}
										<time dateTime={repo.pushedAt}>
											{copy.updatedAgo({ when: ago(rtf, repo.pushedAt) })}
										</time>
										{project && (
											<>
												{" · "}
												<Link
													className={link}
													href={localePath(locale, `/projetos/${project.slug}`)}
												>
													{copy.caseStudy}
												</Link>
											</>
										)}
									</p>
								</li>
							);
						})}
					</ul>
				)}
			</Section>

			{contributions && (
				<Section id="contribuicoes" title={copy.contribTitle}>
					<Heatmap
						days={contributions.days}
						label={copy.contribLabel}
						legend={[t.app.log.heatLess, t.app.log.heatMore]}
						locale={dateLocale}
						unit={[copy.contribUnitOne, copy.contribUnitMany]}
					/>
					<p className="mt-3 text-muted-foreground text-sm">
						{copy.contribTotal({
							n: contributions.total.toLocaleString(dateLocale),
						})}
					</p>
				</Section>
			)}

			<Section id="estudando" title={copy.studyingTitle}>
				<ul className="flex list-disc flex-col gap-3 pl-5 marker:text-muted-foreground">
					{study.map((item) => (
						<li className="text-pretty" key={item}>
							{item}
						</li>
					))}
				</ul>
			</Section>

			{repos.length > 0 && (
				<p className="text-muted-foreground text-sm">
					{copy.lastUpdated({ date: fmt.format(new Date(repos[0].pushedAt)) })}
				</p>
			)}
		</>
	);
}
