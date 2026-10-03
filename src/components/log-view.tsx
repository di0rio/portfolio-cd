"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type CSSProperties, useMemo, useState } from "react";
import { type HeatDay, Heatmap } from "@/components/heatmap";
import { Section } from "@/components/section";
import type { Commit } from "@/lib/github";

const TZ = "America/Sao_Paulo";
const WEEKS = 53; // um ano, igual ao gráfico do GitHub
const DAY = 86400000;

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

export type LogLabels = {
  heat: string;
  less: string;
  more: string;
  commit: string;
  commits: string;
  clear: string;
  none: string;
  filterBy: string;
};

type Props = { commits: Commit[]; locale: string; labels: LogLabels };
type Content = Props & { dia: string | null; tag: string | null; interactive: boolean; onDia?: (day: string) => void; onTag?: (tag: string) => void; onClear?: () => void };

const dayKey = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }); // yyyy-mm-dd
const at = (date: string) => new Date(`${date}T12:00:00Z`);
const shift = (date: string, days: number) => new Date(at(date).getTime() + days * DAY).toISOString().slice(0, 10);

function LogContent({ commits, locale, labels, dia, tag, interactive, onDia, onTag, onClear }: Content) {
  // Depois da primeira ação o filtro não anima: as linhas só entram em cascata no primeiro carregamento.
  const [touched, setTouched] = useState(false);

  const rows = useMemo(
    () =>
      commits.map((c) => {
        const match = prefixed.exec(c.subject);
        return { ...c, day: dayKey.format(new Date(c.date)), tag: match?.[1] ?? null, text: match ? match[2] : c.subject };
      }),
    [commits],
  );

  const heat = useMemo<HeatDay[]>(() => {
    if (!rows.length) return [];
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.day, (counts.get(r.day) ?? 0) + 1);
    const today = dayKey.format(new Date());
    // Sempre o ano todo (colunas de domingo a sábado), mesmo com histórico curto: lê como calendário.
    const start = shift(today, -(at(today).getUTCDay() + (WEEKS - 1) * 7));
    const list: { date: string; count: number }[] = [];
    for (let d = start; d <= today; d = shift(d, 1)) list.push({ date: d, count: counts.get(d) ?? 0 });
    const max = Math.max(1, ...list.map((d) => d.count));
    return list.map((d) => ({ ...d, level: (d.count === 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4))) as HeatDay["level"] }));
  }, [rows]);

  const visible = rows.filter((r) => (!dia || r.day === dia) && (!tag || r.tag === tag));

  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const full = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short", timeZone: TZ });
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  // A API já devolve do mais novo pro mais antigo; o Map mantém essa ordem.
  const days = new Map<string, typeof visible>();
  for (const r of visible) days.set(r.day, [...(days.get(r.day) ?? []), r]);

  let n = 0; // posição global do commit, pro escalonamento da entrada

  const chip = "mr-2 rounded-md bg-accent px-1.5 py-px text-muted-foreground text-xs";

  return (
    <>
      <div className="flex flex-col gap-3">
        <Heatmap
          days={heat}
          interactive={interactive}
          label={labels.heat}
          legend={[labels.less, labels.more]}
          locale={locale}
          onSelect={(d) => {
            setTouched(true);
            onDia?.(d);
          }}
          selected={dia}
          unit={[labels.commit, labels.commits]}
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <p aria-live="polite" className="text-muted-foreground tabular-nums">
            {visible.length} {visible.length === 1 ? labels.commit : labels.commits}
          </p>
          {dia && <span className="rounded-md bg-accent px-1.5 py-px text-xs">{fmt.format(at(dia))}</span>}
          {tag && <span className="rounded-md bg-accent px-1.5 py-px text-xs">{tag}</span>}
          {(dia || tag) && interactive && (
            <button
              className="rounded-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 outline-none transition-[text-decoration-color] duration-150 hover:decoration-brand focus-visible:ring-2 focus-visible:ring-brand"
              onClick={onClear}
              type="button"
            >
              {labels.clear}
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">{labels.none}</p>
      ) : (
        // Linha do tempo: um trilho fino, um ponto por dia e os commits como linhas.
        <div className="relative flex flex-col gap-10">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[3px] w-px bg-border" />
          {[...days].map(([key, items]) => (
            <div className="relative pl-7" key={key}>
              <span aria-hidden="true" className="absolute top-[0.6rem] left-0 size-[7px] rounded-full bg-brand ring-4 ring-background" />
              <Section id={`dia-${key}`} title={fmt.format(new Date(items[0].date))}>
                <ul className="-mx-2 flex flex-col">
                  {items.map((c) => (
                    <li
                      className={`${touched ? "" : "rise "}grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-0.5 rounded-lg px-2 py-1.5 transition-colors duration-150 ease-[ease] hover:bg-accent sm:grid-cols-[auto_1fr_auto]`}
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
                        {c.tag &&
                          (interactive ? (
                            <button
                              aria-label={`${labels.filterBy} ${c.tag}`}
                              aria-pressed={c.tag === tag}
                              className={`${chip} relative cursor-pointer outline-none after:absolute after:-inset-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand aria-pressed:bg-brand aria-pressed:text-brand-contrast`}
                              onClick={() => {
                                setTouched(true);
                                onTag?.(c.tag as string);
                              }}
                              type="button"
                            >
                              {c.tag}
                            </button>
                          ) : (
                            <span className={chip}>{c.tag}</span>
                          ))}
                        {c.text}
                      </span>
                      <time className="col-start-2 whitespace-nowrap text-muted-foreground text-xs tabular-nums sm:col-start-auto" dateTime={c.date} title={full.format(new Date(c.date))}>
                        {ago(rtf, c.date)}
                      </time>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** Versão sem filtro, renderizada no servidor enquanto o cliente lê a query (a página continua estática). */
export function LogFallback(props: Props) {
  return <LogContent {...props} dia={null} interactive={false} tag={null} />;
}

/** Filtros no URL (`?dia=2026-10-03&tag=Security`): dá pra compartilhar o link já filtrado. */
export function LogView(props: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const day = params.get("dia");
  const dia = day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
  const tag = params.get("tag")?.slice(0, 40) || null;

  function go(next: { dia?: string | null; tag?: string | null }) {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    const qs = q.toString();
    // replaceState em vez de router.replace: o Next sincroniza o useSearchParams, mas sem navegação não dispara a transição de página (filtrar é frequente, não anima).
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <LogContent
      {...props}
      dia={dia}
      interactive
      onClear={() => go({ dia: null, tag: null })}
      onDia={(d) => go({ dia: d === dia ? null : d })}
      onTag={(t) => go({ tag: t === tag ? null : t })}
      tag={tag}
    />
  );
}
