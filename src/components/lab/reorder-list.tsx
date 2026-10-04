"use client";

import { ArrowDownIcon, ArrowUpIcon, ShuffleIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

type Copy = {
	items: string[];
	up: string;
	down: string;
	shuffle: string;
	label: string;
};

/**
 * Reordenar com FLIP: mede onde cada item estava (First), deixa o React mover (Last),
 * calcula a diferença (Invert) e anima só o transform de volta a zero (Play), via WAAPI.
 * Nada de animar top/height: o layout muda de uma vez e o transform disfarça.
 */
export function ReorderList({ copy }: { copy: Copy }) {
	const [order, setOrder] = useState(copy.items);
	const nodes = useRef(new Map<string, HTMLLIElement>());
	const before = useRef(new Map<string, number>());

	const snapshot = () => {
		before.current = new Map(
			[...nodes.current].map(([k, el]) => [k, el.getBoundingClientRect().top]),
		);
	};

	// Sem deps: roda a cada render, mas só anima quando há um snapshot pendente (limpo no fim).
	useLayoutEffect(() => {
		const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
		for (const [key, el] of nodes.current) {
			const prev = before.current.get(key);
			if (prev === undefined) continue;
			const delta = prev - el.getBoundingClientRect().top;
			if (!delta || reduce) continue;
			el.animate(
				[
					{ transform: `translateY(${delta}px)` },
					{ transform: "translateY(0)" },
				],
				{
					duration: 250,
					easing: "cubic-bezier(0.77, 0, 0.175, 1)", // movimento na tela: ease-in-out forte
				},
			);
		}
		before.current.clear();
	});

	const move = (index: number, dir: -1 | 1) => {
		const to = index + dir;
		if (to < 0 || to >= order.length) return;
		snapshot();
		const next = [...order];
		[next[index], next[to]] = [next[to], next[index]];
		setOrder(next);
	};

	const shuffle = () => {
		snapshot();
		setOrder((o) => [...o].sort(() => Math.random() - 0.5));
	};

	return (
		<div className="flex w-full max-w-xs flex-col gap-3">
			<ol aria-label={copy.label} className="flex flex-col gap-1.5">
				{order.map((item, i) => (
					<li
						className="flex items-center gap-2 rounded-lg border bg-background py-1.5 pr-1.5 pl-3 text-sm"
						key={item}
						ref={(el) => {
							if (el) nodes.current.set(item, el);
							else nodes.current.delete(item);
						}}
					>
						<span className="w-4 text-muted-foreground tabular-nums">
							{i + 1}
						</span>
						<span className="flex-1">{item}</span>
						<button
							aria-label={`${copy.up}: ${item}`}
							className="grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-30"
							disabled={i === 0}
							onClick={() => move(i, -1)}
							type="button"
						>
							<ArrowUpIcon aria-hidden="true" className="size-3.5" />
						</button>
						<button
							aria-label={`${copy.down}: ${item}`}
							className="grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-30"
							disabled={i === order.length - 1}
							onClick={() => move(i, 1)}
							type="button"
						>
							<ArrowDownIcon aria-hidden="true" className="size-3.5" />
						</button>
					</li>
				))}
			</ol>
			<button
				className="inline-flex h-8 items-center justify-center gap-2 self-center rounded-lg border bg-card px-3 text-sm outline-none transition-transform duration-100 ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]"
				onClick={shuffle}
				type="button"
			>
				<ShuffleIcon aria-hidden="true" className="size-3.5" /> {copy.shuffle}
			</button>
		</div>
	);
}
