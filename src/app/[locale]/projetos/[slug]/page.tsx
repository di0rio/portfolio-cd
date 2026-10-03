import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { projectImage, projects } from "@/lib/projects";

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
  const decisions = [c.d1, c.d2, c.d3, c.d4, ...("d5" in c ? [c.d5] : [])];
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
        {image && (
          <div className="mt-8 overflow-hidden rounded-xl border">
            {/* Vídeo curto do projeto em uso; com movimento reduzido fica só o print. */}
            {image.video && (
              <video aria-label={copy.imageAlt({ name: project.name })} autoPlay className="block h-auto w-full motion-reduce:hidden" loop muted playsInline poster={image.src} preload="metadata" src={image.video} />
            )}
            <Image
              alt={copy.imageAlt({ name: project.name })}
              className={`block h-auto w-full ${image.video ? "hidden motion-reduce:block" : ""}`}
              height={1600}
              quality={90}
              sizes="(min-width: 640px) 608px, 100vw"
              src={image.src}
              width={2560}
            />
          </div>
        )}
      </header>

      <Section id="problema" title={copy.problem}>
        <p className="text-pretty">{c.problem}</p>
      </Section>

      <Section id="decisoes" title={copy.decisions}>
        <ul className="flex flex-col gap-4">
          {decisions.map((d) => (
            <li className="text-pretty" key={d}>
              {d}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="stack" title={copy.stack}>
        <p className="text-muted-foreground">{c.stack}</p>
      </Section>

      {"next" in c && (
        <Section id="proximos" title={copy.later}>
          <p className="text-pretty">{c.next}</p>
        </Section>
      )}

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
