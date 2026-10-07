"use client";

import { useEffect } from "react";

const FRAMES = 120; // 3° por quadro: a troca acompanha o refresh da tela (60/120/144Hz)
const PERIOD = 900; // ms por volta

// Cursor de CSS não anima SVG (o navegador mostra só o 1º quadro). Enquanto o mouse está sobre algo
// com cursor wait/progress, troca --cursor-wait/--cursor-progress no <html> por quadros com o arco
// girado (data URI), no ritmo do requestAnimationFrame. Fora disso não faz nada. Com reduced motion, fica parado.
export function CursorSpin() {
	useEffect(() => {
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const root = document.documentElement;
		const cache = new Map<string, string[] | null>(); // url do SVG -> quadros
		let x = -1;
		let y = -1;
		let active: string | null = null;
		let shown = -1;
		let raf = 0;
		let base: RegExpMatchArray | null = null;

		const onMove = (e: PointerEvent) => {
			x = e.clientX;
			y = e.clientY;
		};

		const load = (url: string) => {
			if (!cache.has(url)) {
				cache.set(url, null);
				fetch(url)
					.then((r) => r.text())
					.then((svg) => {
						cache.set(
							url,
							Array.from({ length: FRAMES }, (_, i) => {
								const turned = svg.replace(
									/<g id="spin" data-c="([\d. ]+)">/,
									(_m, c) =>
										`<g transform="rotate(${(i * 360) / FRAMES} ${c})">`,
								);
								return `url("data:image/svg+xml,${encodeURIComponent(turned)}")`;
							}),
						);
					})
					.catch(() => {});
			}
			return cache.get(url);
		};

		const stop = () => {
			cancelAnimationFrame(raf);
			if (active) root.style.removeProperty(`--cursor-${active}`);
			active = null;
			shown = -1;
		};

		// Ângulo vem do relógio, não de contagem: gira na mesma velocidade em qualquer taxa de quadros.
		const draw = (t: number) => {
			raf = requestAnimationFrame(draw);
			const list = base && load(base[2]);
			if (!active || !base || !list) return;
			const f = Math.floor(((t % PERIOD) / PERIOD) * FRAMES);
			if (f === shown) return;
			shown = f;
			root.style.setProperty(`--cursor-${active}`, `${list[f]} ${base[3]}`);
		};

		// Checa o que está sob o mouse; a animação em si roda no draw().
		const check = () => {
			const el =
				x < 0 || document.hidden ? null : document.elementFromPoint(x, y);
			const kind =
				el && getComputedStyle(el).cursor.match(/,\s*(wait|progress)\s*$/)?.[1];
			if (!kind) return stop();
			if (kind !== active) {
				stop();
				// valor do tema atual, ex.: url(/cursor/dark/wait.svg) 12 12, wait
				base = getComputedStyle(root)
					.getPropertyValue(`--cursor-${kind}`)
					.trim()
					.match(/^url\((["']?)(.+?)\1\)\s*(.*)$/);
				active = kind;
				raf = requestAnimationFrame(draw);
			}
		};

		addEventListener("pointermove", onMove, { passive: true });
		const id = setInterval(check, 100);
		return () => {
			clearInterval(id);
			removeEventListener("pointermove", onMove);
			stop();
		};
	}, []);

	return null;
}
