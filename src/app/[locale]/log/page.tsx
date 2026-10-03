import type { Metadata } from "next";
import type { CSSProperties } from "react";
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

// "Security: ..." ou "feat(scope): ...": o prefixo vira um chip e o resto, o texto.
const prefixed = /^([A-Za-z][\w-]{0,19}(?:\([^)\s]{1,24}\))?!?):\s+(.+)$/;

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

function ago(rtf: Intl.RelativeTimeFormat, iso: string) {
  const seconds = (Date.parse(iso) - Date.now()) / 1000;
  const [unit, size] = UNITS.find(([, s]) => Math.abs(seconds) >= s) ?? ["minute", 60];
  return rtf.format(Math.trunc(seconds / size), unit);
}

export default async function Log() {
  const { t, dateLocale } = await getT();
  const copy = t.app.log;
  const commits = await getSiteCommits();
  const fmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const full = new Intl.DateTimeFormat(dateLocale, { dateStyle: "full", timeStyle: "short", timeZone: TZ });
  const dayKey = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }); // yyyy-mm-dd
  const rtf = new Intl.RelativeTimeFormat(dateLocale, { numeric: "auto" });

  // A API já devolve do mais novo pro mais antigo; o Map mantém essa ordem.
  const days = new Map<string, typeof commits>();
  for (const c of commits) {
    const key = dayKey.format(new Date(c.date));
    days.set(key, [...(days.get(key) ?? []), c]);
  }

  let n = 0; // posição global do commit, pro escalonamento da entrada

  return (
    <>
      <header>
        <h1 className="mb-1.5 font-bold font-heading text-[22px] leading-tight">{copy.title}</h1>
        <p className="max-w-[520px] text-pretty text-muted-foreground">{copy.intro}</p>
      </header>

      {commits.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        // Linha do tempo: um trilho fino, um ponto por dia e os commits como linhas.
        <div className="relative flex flex-col gap-10">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[3px] w-px bg-border" />
          {[...days].map(([key, items]) => (
            <div className="relative pl-7" key={key}>
              <span aria-hidden="true" className="absolute top-[0.6rem] left-0 size-[7px] rounded-full bg-brand ring-4 ring-background" />
              <Section id={`dia-${key}`} title={fmt.format(new Date(items[0].date))}>
                <ul className="-mx-2 flex flex-col">
                  {items.map((c) => {
                    const match = prefixed.exec(c.subject);
                    return (
                      <li
                        className="rise grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-0.5 rounded-lg px-2 py-1.5 transition-colors duration-150 ease-[ease] hover:bg-accent sm:grid-cols-[auto_1fr_auto]"
                        key={c.sha}
                        style={{ "--i": Math.min(n++, 8) } as CSSProperties}
                      >
                        <a
                          className="rounded-md border px-1.5 font-mono text-muted-foreground text-xs outline-none transition-colors duration-150 ease-[ease] hover:border-brand hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
                          href={c.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {c.sha.slice(0, 7)}
                        </a>
                        <span className="min-w-0 text-pretty [overflow-wrap:anywhere]">
                          {match && <span className="mr-2 rounded-md bg-accent px-1.5 py-px text-muted-foreground text-xs">{match[1]}</span>}
                          {match ? match[2] : c.subject}
                        </span>
                        <time className="col-start-2 whitespace-nowrap text-muted-foreground text-xs tabular-nums sm:col-start-auto" dateTime={c.date} title={full.format(new Date(c.date))}>
                          {ago(rtf, c.date)}
                        </time>
                      </li>
                    );
                  })}
                </ul>
              </Section>
            </div>
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        <a className={link} href={`https://github.com/${site.github}/portfolio-cd/commits`} rel="noopener noreferrer" target="_blank">
          {copy.all}
        </a>
      </p>
    </>
  );
}
