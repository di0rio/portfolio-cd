import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.processo.title,
		description: t.app.processo.description,
		alternates: alternates(locale, "/processo"),
	};
}

const link =
	"underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand";

const github = "https://github.com/di0rio";

export default async function Processo() {
	const { t, locale } = await getT();
	const copy = t.app.processo;

	const internal = (path: string, label: string) => ({
		label,
		node: (
			<Link className={link} href={localePath(locale, path)} key={path}>
				{label}
			</Link>
		),
	});
	const external = (href: string, label: string) => ({
		label,
		node: (
			<a
				className={link}
				href={href}
				key={href}
				rel="noopener noreferrer"
				target="_blank"
			>
				{label}
			</a>
		),
	});

	const items = [
		{
			...copy.problem,
			proof: [internal("/projetos/loopvet-hub", copy.problem.caseStudy)],
		},
		{
			...copy.ai,
			proof: [
				external(`${github}/clean-code-ai`, copy.ai.repo),
				internal("/blog/skill-de-codigo-pragmatico", copy.ai.post),
			],
		},
		{
			...copy.test,
			proof: [
				external(
					`${github}/clean-code-ai/blob/main/bench/RESULTS.md`,
					copy.test.results,
				),
			],
		},
		{
			...copy.measure,
			proof: [internal("/projetos/cd-ui", copy.measure.caseStudy)],
		},
		{
			...copy.machine,
			proof: [
				external(
					`${github}/portfolio-cd/blob/main/.github/workflows/ci.yml`,
					copy.machine.ci,
				),
			],
		},
		{
			...copy.decisions,
			proof: [
				external(
					`${github}/portfolio-cd/blob/main/DESIGN.md`,
					copy.decisions.design,
				),
			],
		},
		{
			...copy.demo,
			proof: [internal("/lab", copy.demo.lab)],
		},
	];

	return (
		<>
			<PageHeader intro={copy.intro} title={copy.title} />

			<Section id="processo" title={copy.sectionTitle}>
				<ol className="flex list-decimal flex-col gap-5 pl-5 marker:text-muted-foreground">
					{items.map((item) => (
						<li className="text-pretty" key={item.title}>
							<span className="font-medium">{item.title}</span>
							<p>{item.text}</p>
							<p className="mt-0.5 text-muted-foreground text-sm">
								{copy.proof}{" "}
								{item.proof.map((p, i) => (
									<span key={p.label}>
										{i > 0 && " · "}
										{p.node}
									</span>
								))}
							</p>
						</li>
					))}
				</ol>
			</Section>
		</>
	);
}
