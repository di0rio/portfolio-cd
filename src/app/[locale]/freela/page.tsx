import type { Metadata } from "next";
import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { localePath } from "@/i18n/path";
import { alternates, getT } from "@/i18n/server";
import { projects } from "@/lib/projects";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getT();
  return { title: t.app.freela.title, description: t.app.freela.description, alternates: alternates(locale, "/freela") };
}

const link = "underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand";
// Os estudos de caso que mais falam com quem contrata freela.
const examples = ["cd-ui", "converter-hub", "sentinel-forge"];

export default async function Freela() {
  const { t, locale } = await getT();
  const copy = t.app.freela;
  const nav = t.components["site-shell"].nav;
  const what = [copy.what1, copy.what2, copy.what3, copy.what4];
  const how = [copy.how1, copy.how2, copy.how3, copy.how4];
  const cdui = projects.find((p) => p.slug === "cd-ui");

  return (
    <>
      <PageHeader intro={copy.pitch} title={copy.title} />

      <Section id="o-que-eu-faco" title={copy.whatTitle}>
        <ul className="flex flex-col gap-3">
          {what.map((item, i) => (
            <li className="text-pretty" key={item}>
              {item}
              {i === 2 && cdui && (
                <>
                  {" "}
                  <Link className={link} href={localePath(locale, `/projetos/${cdui.slug}`)}>
                    {cdui.name}
                  </Link>
                  .
                </>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="como-funciona" title={copy.howTitle}>
        <ol className="flex list-decimal flex-col gap-3 pl-5 marker:text-muted-foreground">
          {how.map((step) => (
            <li className="text-pretty" key={step}>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="exemplos" title={copy.examplesTitle}>
        <ul className="flex flex-col gap-6">
          {projects
            .filter((p) => examples.includes(p.slug))
            .map((p) => (
              <li key={p.slug}>
                <Link className={link} href={localePath(locale, `/projetos/${p.slug}`)}>
                  {p.name}
                </Link>
                <p className="text-muted-foreground">{t.app.projects[p.key]}</p>
              </li>
            ))}
        </ul>
        <p className="mt-6 text-muted-foreground text-sm">{copy.examplesHint}</p>
      </Section>

      <Section id="contato" title={copy.ctaTitle}>
        <p className="mb-5 text-pretty">{copy.cta}</p>
        <ContactLinks cv={false} labels={nav} locale={locale} />
      </Section>
    </>
  );
}
