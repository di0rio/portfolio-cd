import type { Metadata } from "next";
import { Section } from "@/components/section";
import { alternates, getT } from "@/i18n/server";
import { getSiteCommits } from "@/lib/github";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getT();
  return { title: t.app.log.title, description: t.app.log.description, alternates: alternates(locale, "/log") };
}

const link = "underline decoration-muted-foreground/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-brand";
const TZ = "America/Sao_Paulo";

export default async function Log() {
  const { t, dateLocale } = await getT();
  const copy = t.app.log;
  const commits = await getSiteCommits();
  const fmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const dayKey = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }); // yyyy-mm-dd

  // A API já devolve do mais novo pro mais antigo; o Map mantém essa ordem.
  const days = new Map<string, typeof commits>();
  for (const c of commits) {
    const key = dayKey.format(new Date(c.date));
    days.set(key, [...(days.get(key) ?? []), c]);
  }

  return (
    <>
      <header>
        <h1 className="mb-1.5 font-bold font-heading text-[22px] leading-tight">{copy.title}</h1>
        <p className="max-w-[520px] text-pretty text-muted-foreground">{copy.intro}</p>
      </header>

      {commits.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        [...days].map(([key, items]) => (
          <Section id={`dia-${key}`} key={key} title={fmt.format(new Date(items[0].date))}>
            <ul className="flex flex-col gap-2.5">
              {items.map((c) => (
                <li className="flex items-baseline gap-3" key={c.sha}>
                  <a
                    className={`${link} shrink-0 font-mono text-muted-foreground text-sm`}
                    href={c.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {c.sha.slice(0, 7)}
                  </a>
                  <span className="min-w-0 text-pretty">{c.subject}</span>
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}

      <p className="text-muted-foreground text-sm">
        <a className={link} href={`https://github.com/${site.github}/portfolio-cd/commits`} rel="noopener noreferrer" target="_blank">
          {copy.all}
        </a>
      </p>
    </>
  );
}
