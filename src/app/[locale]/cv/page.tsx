import type { Metadata } from "next";
import { PrintButton } from "@/components/print-button";
import { alternates, getT } from "@/i18n/server";
import { localePath } from "@/i18n/path";
import { getFeaturedRepos } from "@/lib/github";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getT();
  return { title: t.app.cv.title, description: t.app.cv.description, alternates: alternates(locale, "/cv") };
}

// Currículo em texto puro e uma coluna (lê bem em ATS). "Salvar em PDF" usa a impressão do navegador.
export default async function Cv() {
  const { t, locale } = await getT();
  const copy = t.app;
  // Repositório que já aparece em "projetos" não se repete em "open source".
  const shown = new Set(projects.map((p) => p.repo?.toLowerCase()));
  const repos = (await getFeaturedRepos()).filter((r) => !shown.has(r.url.toLowerCase()));
  const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");
  const local = site.url.includes("localhost");
  const contacts = [
    site.email && { href: `mailto:${site.email}`, text: site.email },
    site.linkedin && { href: `https://www.linkedin.com/in/${site.linkedin}`, text: `linkedin.com/in/${site.linkedin}` },
    { href: `https://github.com/${site.github}`, text: `github.com/${site.github}` },
    !local && { href: site.url, text: strip(site.url) },
  ].filter((c) => !!c);
  // Fora da Vercel o site.url é localhost: link relativo e sem o domínio no texto.
  const projectUrl = (slug: string) => (local ? "" : site.url) + localePath(locale, `/projetos/${slug}`);

  return (
    <article className="flex flex-col gap-9 print:gap-6 print:text-[13px]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-bold font-heading text-[22px] leading-tight">{site.name}</h1>
          <p className="mt-1.5 text-muted-foreground">
            {copy.role} · {site.location.city}, {site.location.region}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {contacts.map((c) => (
              <li key={c.href}>
                <a className="underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-brand" href={c.href}>
                  {c.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <PrintButton label={copy.cv.print} />
      </header>

      <Section title={copy.cv.summary}>
        <p className="text-pretty">
          {copy.bio} {copy.ai}
        </p>
      </Section>

      {/* Só cargo, empresa e período: o que eu faço lá dentro não é público. */}
      <Section title={copy.experience.title}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <p className="font-medium">
            Loopvet / {site.company.name} · {copy.experience.role}
          </p>
          <p className="text-muted-foreground text-sm">{copy.experience.current}</p>
        </div>
        <p className="mt-1 text-pretty text-muted-foreground">{copy.experience.path}</p>
      </Section>

      <Section title={copy.projects.title}>
        <ul className="flex flex-col gap-3">
          {projects.map((p) => (
            <li className="break-inside-avoid" key={p.slug}>
              <p className="font-medium">{p.name}</p>
              <p className="text-pretty text-muted-foreground">{copy.projects[p.key]}</p>
              <a className="text-sm underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-brand" href={projectUrl(p.slug)}>
                {strip(projectUrl(p.slug))}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {site.stack.length > 0 && (
        <Section title={copy.stack.title}>
          <p>{site.stack.join(" · ")}</p>
        </Section>
      )}

      {repos.length > 0 && (
        <Section title={copy.cv.openSource}>
          <ul className="flex flex-col gap-3">
            {repos.map((r) => (
              <li className="break-inside-avoid" key={r.name}>
                <p>
                  <span className="font-medium">{r.name}</span>
                  {r.language && <span className="text-muted-foreground"> · {r.language}</span>}
                </p>
                {r.description && <p className="text-pretty text-muted-foreground">{r.description}</p>}
                <a className="text-sm underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-brand" href={r.homepage ?? r.url}>
                  {strip(r.homepage ?? r.url)}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-3 border-b pb-1.5 font-medium text-[17px]">{title}</h2>
      {children}
    </section>
  );
}
