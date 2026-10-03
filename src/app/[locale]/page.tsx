import { ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ContactLinks } from "@/components/contact-links";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { getBlogRepos, getContributions } from "@/lib/github";
import { site } from "@/lib/site";

// Lista curada: o trabalho que eu quero mostrar, com descrição escrita por mim (não a do GitHub).
const projects = [
  { name: "loopvet", key: "loopvet" },
  { name: "domus", key: "domus" },
  { name: "cd/ui", key: "cdui", href: "https://cd-ui.vercel.app" },
  { name: "converter-hub", key: "converter", href: "https://convert-hub-web.vercel.app" },
  { name: "cd-ai", key: "cdai", href: "https://github.com/di0rio/cd-ai" },
] as const;

const atWork = new Set(["loopvet", "domus"]);

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getT();
  return { alternates: alternates(locale, "/") };
}

export default async function Home() {
  const { t, locale, dateLocale } = await getT();
  const copy = t.app;
  const nav = t.components["site-shell"].nav;
  const [posts, contributions] = await Promise.all([getBlogRepos().then((r) => r.slice(0, 3)), getContributions()]);
  const fmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short" });
  const place = `${site.location.city}, ${site.location.region}`.toLowerCase();

  return (
    <>
      {/* Quem é: o cartoon como adesivo + nome e cargo, pequeno e direto. */}
      <section className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Image
            alt=""
            className="size-16 -rotate-3 rounded-2xl border-2 border-black shadow-[4px_4px_0_var(--brand)] transition-transform duration-200 ease-out motion-safe:hover:rotate-0"
            height={64}
            priority
            src={`https://github.com/${site.github}.png?size=128`}
            width={64}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-[calc(100%-4px)] left-[62%] origin-bottom-left animate-bubble whitespace-nowrap rounded-lg border-2 border-black bg-white px-1.5 font-heading font-medium text-brand-contrast text-xs leading-5 after:absolute after:top-full after:left-2 after:-mt-1 after:size-2 after:rotate-45 after:border-black after:border-r-2 after:border-b-2 after:bg-white"
          >
            {copy.bubble}
          </span>
        </div>
        <div>
          <h1 className="font-heading font-medium">{site.name}</h1>
          <p className="text-muted-foreground">
            {copy.role} · <span className="whitespace-nowrap">{place}</span>
          </p>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd(locale, copy.role, `${copy.bio} ${copy.ai}`)).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      </section>

      <Section id="hoje" title={copy.today}>
        <div className="flex flex-col gap-3">
          <p className="text-pretty">{copy.bio}</p>
          <p className="text-pretty">{copy.ai}</p>
        </div>
        <div className="mt-6">
          <ContactLinks labels={nav} locale={locale} />
        </div>
      </Section>

      <Section
        action={
          <a
            className="group/all inline-flex items-center gap-0.5 text-muted-foreground text-sm transition-colors duration-150 hover:text-foreground"
            href={`https://github.com/${site.github}?tab=repositories`}
            rel="noopener"
            target="_blank"
          >
            {copy.projects.all}
            <ArrowUpRightIcon aria-hidden="true" className="size-3.5 transition-transform duration-200 ease-out motion-safe:group-hover/all:translate-x-0.5 motion-safe:group-hover/all:-translate-y-0.5" />
          </a>
        }
        id="projetos"
        title={copy.projects.title}
      >
        <ul className="flex flex-col gap-6">
          {projects.map((p) => (
            // Só o "ver ↗" é clicável; passar o mouse no item acende o link e a seta sobe.
            <li className="group/item" key={p.key}>
              <p className="flex items-baseline justify-between gap-4">
                <span>{p.name}</span>
                {"href" in p ? (
                  <a
                    aria-label={copy.repos.openLabel({ name: p.name })}
                    className="inline-flex shrink-0 items-center gap-0.5 rounded-md text-muted-foreground text-sm outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand group-hover/item:text-foreground"
                    href={p.href}
                    rel="noopener"
                    target="_blank"
                  >
                    {copy.repos.open}
                    <ArrowUpRightIcon
                      aria-hidden="true"
                      className="size-3.5 transition-[translate,color] duration-200 ease-out group-hover/item:text-brand-foreground motion-safe:group-hover/item:translate-x-0.5 motion-safe:group-hover/item:-translate-y-0.5"
                    />
                  </a>
                ) : (
                  <span className="shrink-0 text-muted-foreground text-sm">
                    {atWork.has(p.key) ? copy.projects.atWork : copy.projects.soon}
                  </span>
                )}
              </p>
              <p className="text-muted-foreground">{copy.projects[p.key]}</p>
            </li>
          ))}
        </ul>
        {contributions && (
          <p className="mt-8 text-muted-foreground text-sm tabular-nums">
            {copy.projects.contributions({ count: contributions.total.toLocaleString(dateLocale) })} ·{" "}
            <a className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand" href={`https://github.com/${site.github}`} rel="noopener" target="_blank">
              github.com/{site.github}
            </a>
          </p>
        )}
      </Section>

      {site.stack.length > 0 && (
        <Section id="stack" title={copy.stack.title}>
          <p className="text-muted-foreground">{site.stack.join(" · ")}</p>
        </Section>
      )}

      {posts.length > 0 && (
        <Section
          action={
            <Link className="text-muted-foreground text-sm transition-colors duration-150 hover:text-foreground" href={localePath(locale, "/blog")}>
              {copy.writing.all}
            </Link>
          }
          id="escrita"
          title={copy.writing.title}
        >
          <ul className="flex flex-col gap-6">
            {posts.map((post) => (
              <li key={post.name}>
                <Link
                  className="underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand"
                  href={localePath(locale, `/blog/${post.name}`)}
                >
                  {post.name}
                </Link>
                <p className="text-muted-foreground">
                  {post.description}{" "}
                  <time className="text-sm tabular-nums" dateTime={post.created_at}>
                    · {fmt.format(new Date(post.created_at))}
                  </time>
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

/** Seção: rótulo discreto em cima, conteúdo com respiro. */
function Section({ id, title, action, children }: { id: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-8">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-muted-foreground" id={id}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Dados estruturados (schema.org) pro Google entender quem é a pessoa do site.
function personJsonLd(locale: string, role: string, bio: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: role,
    description: bio,
    url: site.url + localePath(locale === "en" ? "en" : "pt", "/"),
    image: `https://github.com/${site.github}.png`,
    worksFor: { "@type": "Organization", name: site.company.name, url: site.company.url },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: site.location.country,
    },
    sameAs: [`https://github.com/${site.github}`, site.linkedin && `https://www.linkedin.com/in/${site.linkedin}`].filter(Boolean),
  };
}
