import { getT } from "@/i18n/server";
import { type ContributionDay, getContributions } from "@/lib/github";
import { site } from "@/lib/site";

const levelClass = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"] as const;

// Sem dados (API fora), mostra a grade vazia do último ano.
function emptyYear(): ContributionDay[] {
  const today = Date.now();
  return Array.from({ length: 365 }, (_, i) => ({
    date: new Date(today - (364 - i) * 864e5).toISOString().slice(0, 10),
    count: 0,
    level: 0,
  }));
}

export async function Contributions() {
  const { t, dateLocale } = await getT();
  const data = await getContributions();
  const days = data?.days.length ? data.days : emptyYear();
  const copy = t.app.contributions;
  const fmt = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short" });
  // A grade começa no domingo: completa a primeira semana com células invisíveis.
  const offset = new Date(`${days[0].date}T00:00`).getDay();
  const weeks = Math.ceil((offset + days.length) / 7);

  return (
    <section aria-labelledby="contrib-title">
      <p className="mb-3.5" id="contrib-title">
        {data ? copy.count({ count: data.total.toLocaleString(dateLocale) }) : copy.fallback}{" "}
        <a
          className="text-brand-foreground underline underline-offset-3"
          href={`https://github.com/${site.github}`}
          rel="noopener"
          target="_blank"
        >
          github.com/{site.github}
        </a>
      </p>
      {/* No desktop a grade ocupa a coluna inteira; no celular rola, começando pela semana atual. */}
      <div className="scrollbar-thin overflow-x-auto pb-1.5 [direction:rtl]">
        <div
          className="grid min-w-[480px] animate-reveal-x grid-flow-col grid-rows-7 gap-[3px] [direction:ltr]"
          style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: offset }, (_, i) => (
            <span aria-hidden="true" key={`pad-${i}`} />
          ))}
          {days.map((d) => (
            <span
              className={`aspect-square rounded-[2px] ${levelClass[d.level]}`}
              key={d.date}
              title={copy.day({ count: String(d.count), date: fmt.format(new Date(`${d.date}T00:00`)) })}
            />
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="mt-2 flex items-center justify-end gap-1 text-muted-foreground text-xs">
        {copy.less}
        {levelClass.map((c) => (
          <span className={`size-2.5 rounded-[2.5px] ${c}`} key={c} />
        ))}
        {copy.more}
      </div>
    </section>
  );
}
