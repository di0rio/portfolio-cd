import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { ProjectMedia } from "@/components/project-media";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { projectArticle, projectImage, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projetos/[slug]">): Promise<Metadata> {
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

export default async function CaseStudy({ params }: PageProps<"/[locale]/projetos/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();

  const project = projects[index];
  const { t, locale } = await getT();
  const copy = t.app.projetos;
  const c = copy[project.key];
  const article = await projectArticle(project.slug, locale);
  const image = projectImage(project.slug);
  const siblings = [projects[index - 1], projects[index + 1]];

  return (
    <>
      <header>
        <Link className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground" href={localePath(locale, "/#projetos")}>
          <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
          {copy.back}
        </Link>
        <h1 className="mt-6 mb-1.5 font-bold font-heading text-[22px] leading-tight">{project.name}</h1>
        <p className="max-w-[520px] text-pretty text-muted-foreground">{c.intro}</p>
        {(project.live || project.repo) && (
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {project.live && (
              <a className={link} href={project.live} rel="noopener" target="_blank">
                {copy.live}
              </a>
            )}
            {project.repo && (
              <a className={link} href={project.repo} rel="noopener" target="_blank">
                {copy.repo}
              </a>
            )}
          </p>
        )}
        {/* Vídeos desligados por enquanto (ainda têm bugs). Pra religar: devolver `video={image.video}`
            e os .mp4 de `.videos/` pra `public/projects/`. */}
        {image && <ProjectMedia alt={copy.imageAlt({ name: project.name })} play={copy.play} src={image.src} /* video={image.video} */ />}
      </header>

      {article && <Markdown>{article}</Markdown>}

      <nav aria-label={copy.nav} className="flex justify-between gap-4 border-t pt-6">
        {siblings.map((p, i) =>
          p ? (
            <Link
              className={`group/nav flex flex-col gap-0.5 ${i === 1 ? "ml-auto text-right" : ""}`}
              href={localePath(locale, `/projetos/${p.slug}`)}
              key={p.slug}
            >
              <span className={`inline-flex items-center gap-1 text-muted-foreground text-sm ${i === 1 ? "justify-end" : ""}`}>
                {i === 0 && <ArrowLeftIcon aria-hidden="true" className="size-3.5" />}
                {i === 0 ? copy.prev : copy.next}
                {i === 1 && <ArrowRightIcon aria-hidden="true" className="size-3.5" />}
              </span>
              <span className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 group-hover/nav:decoration-brand">
                {p.name}
              </span>
            </Link>
          ) : null,
        )}
      </nav>
    </>
  );
}
