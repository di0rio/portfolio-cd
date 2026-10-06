import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { PageHeader } from "@/components/page-header";
import { ProjectMedia } from "@/components/project-media";
import { PageStepper } from "@/components/site-shell/page-stepper";
import { StackList } from "@/components/stack-list";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { projectArticle, projectImage, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
	return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
	params,
}: PageProps<"/[locale]/projetos/[slug]">): Promise<Metadata> {
	const { slug } = await params;
	const project = projects.find((p) => p.slug === slug);
	if (!project) return {};
	const { t, locale } = await getT();
	const copy = t.app.projetos;
	return {
		title: `${project.name} · ${copy.caseStudy}`,
		description: copy[project.key].intro,
		alternates: alternates(locale, `/projetos/${project.slug}`),
	};
}

const link = "text-brand-foreground underline underline-offset-3";

export default async function CaseStudy({
	params,
}: PageProps<"/[locale]/projetos/[slug]">) {
	const { slug } = await params;
	const index = projects.findIndex((p) => p.slug === slug);
	if (index < 0) notFound();

	const project = projects[index];
	const { t, locale } = await getT();
	const copy = t.app.projetos;
	const c = copy[project.key];
	const article = await projectArticle(project.slug, locale);
	const image = projectImage(project.slug);
	const stepper = t.components["site-shell"].stepper;
	const step = (
		p: (typeof projects)[number] | undefined,
		label: (v: { title: string }) => string,
	) =>
		p && {
			href: localePath(locale, `/projetos/${p.slug}`),
			title: p.name,
			label: label({ title: p.name }),
		};

	return (
		<>
			<PageHeader
				back={
					<div className="flex items-center justify-between gap-3">
						<Link
							className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
							href={localePath(locale, "/projetos")}
						>
							<ArrowLeftIcon aria-hidden="true" className="size-3.5" />
							{copy.back}
						</Link>
						<PageStepper
							current={index + 1}
							label={copy.nav}
							next={step(projects[index + 1], stepper.next)}
							prev={step(projects[index - 1], stepper.prev)}
							total={projects.length}
						/>
					</div>
				}
				intro={c.intro}
				title={project.name}
			>
				<StackList
					className="mt-4"
					items={project.stack}
					label={t.app.stack.project({ name: project.name })}
				/>
				{(project.live || project.repo) && (
					<p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
						{project.live && (
							<a
								className={link}
								href={project.live}
								rel="noopener"
								target="_blank"
							>
								{copy.live}
							</a>
						)}
						{project.repo && (
							<a
								className={link}
								href={project.repo}
								rel="noopener"
								target="_blank"
							>
								{copy.repo}
							</a>
						)}
					</p>
				)}
				{image && (
					<ProjectMedia
						alt={copy.imageAlt({ name: project.name })}
						pause={copy.pause}
						play={copy.play}
						light={image.light}
						src={image.src}
						video={image.video}
					/>
				)}
			</PageHeader>

			{article && <Markdown>{article}</Markdown>}
		</>
	);
}
