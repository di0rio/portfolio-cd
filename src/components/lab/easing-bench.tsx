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
import { cn } from "@/lib/utils";

/** Lado do quadrado 0..1 do gráfico, em unidades do SVG. */
const S = 160;
const BALL = 20;

const PRESETS = {
	"ease-out": [0.23, 1, 0.32, 1],
	"ease-in-out": [0.77, 0, 0.175, 1],
	spring: [0.34, 1.56, 0.64, 1],
	"ease-in": [0.55, 0, 1, 0.45],
} as const;

const clamp = (v: number, lo: number, hi: number) =>
	Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v * 100) / 100;

/**
 * Editor de cubic-bezier: arraste as duas alças do gráfico (ou os números do código) e a bolinha de cima corre com a
 * sua curva, ao lado de uma linear pra comparar. Cada mudança roda de novo, indo e voltando.
 */
export function EasingBench({ play }: { play: string }) {
	const knobs = useKnobs({
		duration: 700,
		x1: 0.23,
		y1: 1,
		x2: 0.32,
		y2: 1,
	});
	const { duration, x1, y1, x2, y2 } = knobs.values;
	const easing = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

	const svg = useRef<SVGSVGElement>(null);
	const handle = useRef<1 | 2 | null>(null);
	const track = useRef<HTMLDivElement>(null);
	const curved = useRef<HTMLSpanElement>(null);
	const linear = useRef<HTMLSpanElement>(null);
	const atEnd = useRef(false);

	const run = () => {
		const width = track.current?.clientWidth ?? 0;
		const from = atEnd.current ? width - BALL : 0;
		const to = atEnd.current ? 0 : width - BALL;
		atEnd.current = !atEnd.current;
		for (const [ball, curve] of [
			[curved.current, easing],
			[linear.current, "linear"],
		] as const) {
			if (!ball) continue;
			for (const a of ball.getAnimations()) a.cancel();
			ball.animate(
				[
					{ transform: `translateX(${from}px)` },
					{ transform: `translateX(${to}px)` },
				],
				{
					duration: prefersReducedMotion() ? 0 : duration,
					easing: curve,
					fill: "forwards",
				},
			);
		}
	};

	// Roda de novo um pouco depois da última mudança, pra não disparar a cada pixel de arrasto. Na montagem, fica parada.
	const mounted = useRef(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: `run` lê os valores atuais; o gatilho são os números
	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			return;
		}
		const timer = setTimeout(run, 250);
		return () => clearTimeout(timer);
	}, [duration, x1, y1, x2, y2]);

	const toSvg = (e: React.PointerEvent) => {
		const m = svg.current?.getScreenCTM()?.inverse();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
		return {
			x: round(clamp(p.x / S, 0, 1)),
			y: round(clamp(1 - p.y / S, -0.5, 1.5)),
		};
	};
	const sx = (x: number) => x * S;
	const sy = (y: number) => (1 - y) * S;

	return (
		<>
			<Stage className="min-h-72 flex-col gap-8 sm:flex-row sm:gap-12">
				<svg
					aria-hidden="true"
					className="h-auto w-44 shrink-0 touch-none overflow-visible"
					onLostPointerCapture={() => {
						handle.current = null;
					}}
					onPointerMove={(e) => {
						const p = handle.current && toSvg(e);
						if (!p) return;
						knobs.set(`x${handle.current}`, p.x);
						knobs.set(`y${handle.current}`, p.y);
					}}
					ref={svg}
					viewBox={`-12 ${-S * 0.3} ${S + 24} ${S * 1.6}`}
				>
					<rect
						className="fill-none stroke-border"
						height={S}
						strokeDasharray="3 3"
						width={S}
					/>
					<line className="stroke-border" x1={0} x2={S} y1={S} y2={0} />
					<line
						className="stroke-muted-foreground/60"
						x1={0}
						x2={sx(x1)}
						y1={S}
						y2={sy(y1)}
					/>
					<line
						className="stroke-muted-foreground/60"
						x1={S}
						x2={sx(x2)}
						y1={0}
						y2={sy(y2)}
					/>
					<path
						className="fill-none stroke-foreground stroke-[2.5]"
						d={`M0 ${S} C${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${S} 0`}
						strokeLinecap="round"
					/>
					{([1, 2] as const).map((n) => (
						<circle
							className="cursor-grab fill-brand stroke-[2] stroke-[#1c1c1c] active:cursor-grabbing"
							cx={sx(n === 1 ? x1 : x2)}
							cy={sy(n === 1 ? y1 : y2)}
							key={n}
							onPointerDown={(e) => {
								if (e.button !== 0) return;
								svg.current?.setPointerCapture(e.pointerId);
								handle.current = n;
							}}
							r={8}
						/>
					))}
				</svg>

				<div className="flex w-full max-w-72 flex-col gap-4">
					<div className="flex flex-col gap-3" ref={track}>
						{(
							[
								[curved, "cubic-bezier", "bg-brand"],
								[linear, "linear", "bg-muted-foreground/40"],
							] as const
						).map(([ref, name, color]) => (
							<div className="flex flex-col gap-1" key={name}>
								<span className="font-mono text-[12px] text-muted-foreground">
									{name}
								</span>
								<div className="relative h-5 rounded-full bg-muted">
									<span
										className={cn(
											"absolute top-0 left-0 block rounded-full border-2 border-[#1c1c1c]",
											color,
										)}
										ref={ref}
										style={{ width: BALL, height: BALL }}
									/>
								</div>
							</div>
						))}
					</div>
					<div className="flex flex-wrap gap-1.5">
						{Object.entries(PRESETS).map(([name, [a, b, c, d]]) => {
							const active = a === x1 && b === y1 && c === x2 && d === y2;
							return (
								<button
									aria-pressed={active}
									className={cn(
										"rounded-md border px-2 py-1 font-mono text-[12px] outline-none transition-[background-color,color,scale] duration-fast ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97]",
										active
											? "border-transparent bg-brand text-[#1c1c1c]"
											: "text-muted-foreground hover:bg-accent hover:text-foreground",
									)}
									key={name}
									onClick={() => {
										knobs.set("x1", a);
										knobs.set("y1", b);
										knobs.set("x2", c);
										knobs.set("y2", d);
									}}
									type="button"
								>
									{name}
								</button>
							);
						})}
						<button
							className="rounded-md px-2 py-1 font-mono text-[12px] text-muted-foreground outline-none transition-[background-color,color,scale] duration-fast ease-out hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97]"
							onClick={run}
							type="button"
						>
							{play} ↻
						</button>
					</div>
				</div>
			</Stage>
			<Knobs file="easing.css" state={knobs}>
				<Line>
					{"transition: transform "}
					<Knob k="duration" max={2000} min={100} step={50} unit="ms" />
				</Line>
				<Line>
					{"  cubic-bezier("}
					<Knob k="x1" max={1} min={0} step={0.01} />
					{", "}
					<Knob k="y1" max={1.5} min={-0.5} step={0.01} />
					{", "}
					<Knob k="x2" max={1} min={0} step={0.01} />
					{", "}
					<Knob k="y2" max={1.5} min={-0.5} step={0.01} />
					{");"}
				</Line>
			</Knobs>
		</>
	);
}
