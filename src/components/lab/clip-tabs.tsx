"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Raio do recorte, igual ao da aba.
const CLIP_RADIUS = "6px";

/**
 * Abas com recorte: a lista é desenhada duas vezes. A de cima tem cor invertida e um `clip-path`
 * que só mostra a aba ativa; trocar de aba anima o recorte, então a cor muda sem piscar.
 */
export function ClipTabs({ items, label }: { items: string[]; label: string }) {
	const [active, setActive] = useState(0);
	const [clip, setClip] = useState(`inset(0 100% 0 0 round ${CLIP_RADIUS})`);
	const list = useRef<HTMLDivElement>(null);
	const tabs = useRef<(HTMLButtonElement | null)[]>([]);

	useLayoutEffect(() => {
		const measure = () => {
			const tab = tabs.current[active];
			const box = list.current;
			if (!tab || !box) return;
			// Recorta exatamente a aba (com o mesmo raio dela), não a altura toda da lista: senão o
			// destaque encosta na borda e some o respiro do padding.
			const right = box.clientWidth - tab.offsetLeft - tab.offsetWidth;
			const bottom = box.clientHeight - tab.offsetTop - tab.offsetHeight;
			setClip(
				`inset(${tab.offsetTop}px ${right}px ${bottom}px ${tab.offsetLeft}px round ${CLIP_RADIUS})`,
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		if (list.current) observer.observe(list.current);
		return () => observer.disconnect();
	}, [active]);

	const row = "flex gap-1 rounded-lg p-1";
	const item = "h-8 rounded-md px-3.5 font-medium text-sm";

	return (
		<div className="relative rounded-lg border bg-background" ref={list}>
			<fieldset className={`${row} min-w-0`}>
				<legend className="sr-only">{label}</legend>
				{items.map((name, i) => (
					<button
						aria-pressed={i === active}
						className={`${item} text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand`}
						key={name}
						onClick={() => setActive(i)}
						ref={(el) => {
							tabs.current[i] = el;
						}}
						type="button"
					>
						{name}
					</button>
				))}
			</fieldset>
			{/* Cópia invertida, só visual: os cliques passam pra lista de baixo. */}
			<div
				aria-hidden="true"
				className={`${row} pointer-events-none absolute inset-0 bg-foreground transition-[clip-path] duration-250 ease-in-out motion-reduce:transition-none`}
				style={{ clipPath: clip }}
			>
				{items.map((name) => (
					<span
						className={`${item} flex items-center text-background`}
						key={name}
					>
						{name}
					</span>
				))}
			</div>
		</div>
	);
}
