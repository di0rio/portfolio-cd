"use client";

import { useEffect, useRef } from "react";
import {
	Knob,
	Knobs,
	Line,
	prefersReducedMotion,
	Stage,
	useKnobs,
} from "@/components/lab/workbench";

// As próprias peças do lab, como se viessem de um `ls`.
const FILES = [
	"avatar-toy.tsx",
	"combine.tsx",
	"hold-bench.tsx",
	"confetti-bench.tsx",
	"easing-bench.tsx",
	"rubber-bench.tsx",
];

/**
 * Lista que entra em cascata: cada linha sobe e aparece `delay` depois da anterior. O comentário do código faz a conta
 * do tempo total, que é o que pesa: cascata longa demais parece lentidão, não charme.
 */
export function StaggerBench({ play }: { play: string }) {
	const knobs = useKnobs({ delay: 40, duration: 300, y: 12 });
	const { delay, duration, y } = knobs.values;
	const rows = useRef<HTMLOListElement>(null);
	const total = (FILES.length - 1) * delay + duration;

	const run = () => {
		const reduced = prefersReducedMotion();
		for (const [i, row] of Array.from(rows.current?.children ?? []).entries()) {
			for (const a of row.getAnimations()) a.cancel();
			row.animate(
				[
					{
						opacity: 0,
						transform: reduced ? "none" : `translateY(${y}px)`,
					},
					{ opacity: 1, transform: "none" },
				],
				{
					duration,
					delay: i * delay,
					easing: "cubic-bezier(0.23, 1, 0.32, 1)",
					fill: "backwards",
				},
			);
		}
	};

	// Toca de novo logo depois da última mudança; na montagem a lista já aparece pronta.
	const mounted = useRef(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: `run` lê os valores atuais; o gatilho são os números
	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			return;
		}
		const timer = setTimeout(run, 200);
		return () => clearTimeout(timer);
	}, [delay, duration, y]);

	return (
		<>
			<Stage className="min-h-72 flex-col items-stretch gap-4 sm:px-10">
				<div className="flex items-center justify-between font-mono text-[13px]">
					<span className="text-muted-foreground">$ ls ~/lab</span>
					<button
						className="rounded-md px-2 py-1 text-muted-foreground outline-none transition-[background-color,color,scale] duration-fast ease-out hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97]"
						onClick={run}
						type="button"
					>
						{play} ↻
					</button>
				</div>
				<ol className="flex flex-col gap-1.5" ref={rows}>
					{FILES.map((file, i) => (
						<li
							className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 font-mono text-[13px]"
							key={file}
						>
							<span className="text-muted-foreground tabular-nums">
								{String(i * delay).padStart(3, " ")}ms
							</span>
							{file}
						</li>
					))}
				</ol>
			</Stage>
			<Knobs file="stagger.ts" state={knobs}>
				<Line>
					{"stagger({ delay: "}
					<Knob k="delay" max={200} min={0} step={5} unit="ms" />
					{", duration: "}
					<Knob k="duration" max={1200} min={100} step={50} unit="ms" />
					{", y: "}
					<Knob k="y" max={48} min={0} unit="px" />
					{" })"}
				</Line>
				<Line>
					{`// total: (${FILES.length} - 1) × ${delay}ms + ${duration}ms = `}
					<span
						className={
							total > 700 ? "text-destructive-foreground" : "text-foreground"
						}
					>
						{total}ms
					</span>
				</Line>
			</Knobs>
		</>
	);
}
