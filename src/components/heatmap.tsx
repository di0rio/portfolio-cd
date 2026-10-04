"use client";

import { type KeyboardEvent, useMemo, useRef, useState } from "react";

export type HeatDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

type Props = {
	/** Dias contíguos, do mais antigo pro mais novo (`yyyy-mm-dd`). */
	days: HeatDay[];
	locale: string;
	/** Nome do gráfico, pra leitor de tela. */
	label: string;
	/** Unidade no singular e no plural ("commit"/"commits"), usada no rótulo de cada dia. */
	unit: [one: string, many: string];
	legend: [less: string, more: string];
	/** Interativo: dias com contagem viram botões. Estático: só `title` (data + contagem), nada focável. */
	interactive?: boolean;
	selected?: string | null;
	onSelect?: (date: string) => void;
};

const BG = [
	"bg-heat-0",
	"bg-heat-1",
	"bg-heat-2",
	"bg-heat-3",
	"bg-heat-4",
] as const;
// Células fluidas: as colunas dividem a largura e cada célula é quadrada, então o mapa inteiro cabe sem rolar.
const cell = "aspect-square w-full rounded-[2px] sm:rounded-[3px]";
const swatch = "size-[11px] rounded-[3px]";

// A data é só um dia do calendário: lê em UTC pra não escorregar de dia pelo fuso do navegador.
const at = (date: string) => new Date(`${date}T12:00:00Z`);

/** Gráfico de calor estilo GitHub: semanas em colunas, dias da semana em linhas (domingo em cima). */
export function Heatmap({
	days,
	locale,
	label,
	unit,
	legend,
	interactive = false,
	selected = null,
	onSelect,
}: Props) {
	const grid = useRef<HTMLDivElement>(null);
	const [focusKey, setFocusKey] = useState<string | null>(null);

	const { offset, weeks, months, cells, active } = useMemo(() => {
		const dayFmt = new Intl.DateTimeFormat(locale, {
			day: "numeric",
			month: "short",
			year: "numeric",
			timeZone: "UTC",
		});
		const monthFmt = new Intl.DateTimeFormat(locale, {
			month: "short",
			timeZone: "UTC",
		});
		const offset = days.length ? at(days[0].date).getUTCDay() : 0;
		const weeks = Math.ceil((offset + days.length) / 7);
		const cells = days.map((d, i) => ({
			...d,
			col: Math.floor((offset + i) / 7),
			row: (offset + i) % 7,
			text: `${dayFmt.format(at(d.date))}, ${d.count} ${d.count === 1 ? unit[0] : unit[1]}`,
		}));
		// Rótulo de mês na primeira coluna em que ele aparece; pula se ficaria colado no anterior.
		const months: { col: number; name: string }[] = [];
		for (const c of cells) {
			if (c.date.slice(8) !== "01" && c.col !== 0) continue;
			if (months.at(-1)?.col === c.col) continue;
			if (months.length && c.col - months[months.length - 1].col < 4) continue;
			months.push({ col: c.col, name: monthFmt.format(at(c.date)) });
		}
		return {
			offset,
			weeks,
			months,
			cells,
			active: cells.filter((c) => c.count > 0),
		};
	}, [days, locale, unit]);

	// Roving tabindex: um único dia no tab order (o último focado, o selecionado ou o mais recente).
	const tabbable =
		active.find((c) => c.date === focusKey)?.date ??
		active.find((c) => c.date === selected)?.date ??
		active.at(-1)?.date;

	function onKeyDown(
		e: KeyboardEvent<HTMLElement>,
		from: (typeof cells)[number],
	) {
		const near = (a: number, b: number) => Math.abs(a - b);
		let next: (typeof cells)[number] | undefined;
		if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
			const dir = e.key === "ArrowLeft" ? -1 : 1;
			const side = active.filter((c) => (c.col - from.col) * dir > 0);
			const col = side.length
				? (dir < 0 ? Math.max : Math.min)(...side.map((c) => c.col))
				: -1;
			next = side
				.filter((c) => c.col === col)
				.sort((a, b) => near(a.row, from.row) - near(b.row, from.row))[0];
		} else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			const dir = e.key === "ArrowUp" ? -1 : 1;
			next = active
				.filter((c) => c.col === from.col && (c.row - from.row) * dir > 0)
				.sort((a, b) => near(a.row, from.row) - near(b.row, from.row))[0];
		} else if (e.key === "Home") next = active[0];
		else if (e.key === "End") next = active.at(-1);
		else return;
		e.preventDefault();
		if (next)
			grid.current
				?.querySelector<HTMLElement>(`[data-date="${next.date}"]`)
				?.focus();
	}

	const chart = (
		<div>
			<div
				aria-hidden="true"
				className="mb-1.5 grid h-4 gap-x-0.5 text-muted-foreground text-xs leading-4 sm:gap-x-[3px]"
				style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
			>
				{months.map((m) => (
					// Mês nas últimas colunas encosta na direita pra não vazar da borda.
					<span
						className={`whitespace-nowrap ${m.col >= weeks - 3 ? "text-right" : ""}`}
						key={m.col}
						style={{
							gridColumn: m.col >= weeks - 3 ? `${m.col + 1} / -1` : m.col + 1,
						}}
					>
						{m.name}
					</span>
				))}
			</div>
			<div
				className="grid grid-flow-col gap-0.5 sm:gap-[3px]"
				ref={grid}
				style={{
					gridTemplateRows: "repeat(7, auto)",
					gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
				}}
			>
				{cells.map((c, i) => {
					const style = i === 0 ? { gridRowStart: offset + 1 } : undefined;
					if (interactive && c.count > 0) {
						const on = c.date === selected;
						return (
							<button
								aria-label={c.text}
								aria-pressed={on}
								className={`${cell} ${BG[c.level]} relative cursor-pointer outline-2 outline-transparent hover:outline-foreground/50 focus-visible:z-10 focus-visible:outline-brand focus-visible:outline-offset-2 aria-pressed:z-10 aria-pressed:ring-2 aria-pressed:ring-foreground`}
								data-date={c.date}
								key={c.date}
								onClick={() => onSelect?.(c.date)}
								onFocus={() => setFocusKey(c.date)}
								onKeyDown={(e) => onKeyDown(e, c)}
								style={style}
								tabIndex={c.date === tabbable ? 0 : -1}
								title={c.text}
								type="button"
							/>
						);
					}
					return (
						<div
							aria-hidden="true"
							className={`${cell} ${BG[c.level]}`}
							key={c.date}
							style={style}
							title={c.text}
						/>
					);
				})}
			</div>
		</div>
	);

	// Interativo: grupo de botões (fieldset + legend); senão, uma imagem só com o resumo no rótulo.
	return (
		<div>
			{interactive ? (
				<fieldset className="min-w-0 pb-2">
					<legend className="sr-only">{label}</legend>
					{chart}
				</fieldset>
			) : (
				<div aria-label={label} className="pb-2" role="img">
					{chart}
				</div>
			)}
			<div
				aria-hidden="true"
				className="flex items-center justify-end gap-1.5 text-muted-foreground text-xs"
			>
				{legend[0]}
				{BG.map((bg) => (
					<span className={`${swatch} ${bg}`} key={bg} />
				))}
				{legend[1]}
			</div>
		</div>
	);
}
