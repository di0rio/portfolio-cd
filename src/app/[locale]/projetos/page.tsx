import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProjectMetric } from "@/components/project-metric";
import { StackList } from "@/components/stack-list";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { projectImage, projects } from "@/lib/projects";

export async function generateMetadata(): Promise<Metadata> {
	const { t, locale } = await getT();
	return {
		title: t.app.projetos.title,
		description: t.app.projetos.intro,
		alternates: alternates(locale, "/projetos"),
	};
}

// Índice dos estudos de caso: miniatura (ou o nome no prompt, pra quem não tem print), descrição,
// o número do projeto e a stack. A home mostra a mesma lista sem imagem.
export default async function Projects() {
	const { t, locale } = await getT();
	const copy = t.app.projetos;
	const home = t.app.projects;

	return (
		<>
			<PageHeader intro={copy.intro} title={copy.title} />
			<ul className="flex flex-col gap-10">
				{projects.map((p) => {
					const image = projectImage(p.slug);
					const href = localePath(locale, `/projetos/${p.slug}`);
					return (
						<li
							className="group/card grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6"
							key={p.slug}
						>
							<Link
								aria-hidden="true"
								className="relative block aspect-video overflow-hidden rounded-xl border bg-card"
								href={href}
								tabIndex={-1}
							>
								{image ? (
									<Image
										alt=""
										className="size-full object-cover transition-transform duration-300 ease-out motion-safe:group-hover/card:scale-[1.03]"
										height={1080}
										sizes="(min-width: 640px) 200px, 100vw"
										src={image.src}
										width={1920}
									/>
								) : (
									<span className="grid size-full place-items-center font-mono text-muted-foreground text-sm">
										<span>
											~/{p.slug}{" "}
											<span className="text-brand-foreground">$</span>
										</span>
									</span>
								)}
							</Link>
							<div className="min-w-0">
								<h2 className="flex flex-wrap items-baseline gap-x-2">
									<Link
										className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand group-hover/card:decoration-brand"
										href={href}
									>
										{p.name}
									</Link>
									{!p.live && !p.repo && (
										<span className="font-mono text-muted-foreground text-xs">
											{copy.private}
										</span>
									)}
								</h2>
								<p className="text-muted-foreground">{home[p.key]}</p>
								<ProjectMetric>{home.metric[p.key]}</ProjectMetric>
								<StackList
									className="mt-2"
									items={p.stack}
									label={t.app.stack.project({ name: p.name })}
								/>
							</div>
						</li>
					);
				})}
			</ul>
		</>
	);
}
