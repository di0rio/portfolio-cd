"use client";

import { useRef, useState } from "react";
import {
	AvatarSticker,
	Knob,
	Knobs,
	Line,
	prefersReducedMotion,
	Stage,
	useKnobs,
	useSpring,
} from "@/components/lab/workbench";
import { cn } from "@/lib/utils";

/** Distância máxima que o elástico deixa andar, em px: o limite pra onde a resistência tende. */
const MAX = 120;
/** Empurrão do teclado, em px/s. */
const KICK = 900;

/** A fórmula do overscroll do iOS: anda quase 1:1 no começo e endurece até travar em `MAX`. */
const rubber = (d: number, c: number) =>
	Math.sign(d) * (1 - 1 / ((Math.abs(d) * c) / MAX + 1)) * MAX;
/** O inverso: quanto o dedo teria puxado pra o elástico estar em `y`. Serve pra pegar o avatar no ar sem pulo. */
const unrubber = (y: number, c: number) =>
	Math.sign(y) * (1 / (1 - Math.min(Math.abs(y) / MAX, 0.999)) - 1) * (MAX / c);

/**
 * Arraste o avatar pra longe: ele vem atrás do dedo com resistência (o círculo tracejado é onde o dedo está) e,
 * ao soltar, volta com mola, levando a velocidade do gesto. No teclado, as setas dão um empurrão.
 */
export function RubberBench({ label }: { label: string }) {
	const knobs = useKnobs({ resistance: 0.55, stiffness: 300, damping: 18 });
	const { resistance, stiffness, damping } = knobs.values;
	const [dragging, setDragging] = useState(false);
	const body = useRef<HTMLButtonElement>(null);
	const ghost = useRef<HTMLSpanElement>(null);
	const drag = useRef<{
		x: number;
		y: number;
		last: { x: number; y: number; t: number };
		v: { x: number; y: number };
	} | null>(null);

	const spring = useSpring(
		2,
		([x, y]) => {
			if (body.current)
				body.current.style.transform = `translate(${x}px, ${y}px)`;
		},
		{ stiffness, damping },
	);

	const release = () => {
		const d = drag.current;
		if (!d) return;
		drag.current = null;
		setDragging(false);
		if (prefersReducedMotion()) return spring.jump([0, 0]);
		// Parou antes de soltar: a velocidade do último movimento já não vale.
		const v = performance.now() - d.last.t > 80 ? { x: 0, y: 0 } : d.v;
		spring.to([0, 0]);
		spring.kick(0, v.x);
		spring.kick(1, v.y);
	};

	return (
		<>
			<Stage className="min-h-72">
				<span
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 left-1/2 size-60 -translate-1/2 rounded-full border border-dashed"
				/>
				<span
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute top-1/2 left-1/2 -mt-5 -ml-5 size-10 rounded-full border-2 border-brand border-dashed transition-opacity duration-fast",
						dragging ? "opacity-100" : "opacity-0",
					)}
					ref={ghost}
				/>
				<button
					aria-label={label}
					className={cn(
						"touch-none rounded-3xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-brand",
						dragging ? "cursor-grabbing" : "cursor-grab",
					)}
					onKeyDown={(e) => {
						const dirs: Record<string, [number, number]> = {
							ArrowLeft: [-1, 0],
							ArrowRight: [1, 0],
							ArrowUp: [0, -1],
							ArrowDown: [0, 1],
						};
						const dir = dirs[e.key];
						if (!dir) return;
						e.preventDefault();
						if (prefersReducedMotion()) return;
						spring.to([0, 0]);
						spring.kick(0, dir[0] * KICK);
						spring.kick(1, dir[1] * KICK);
					}}
					onLostPointerCapture={release}
					onPointerDown={(e) => {
						if (drag.current || e.button !== 0) return;
						e.currentTarget.setPointerCapture(e.pointerId);
						spring.stop();
						// Começa de onde a mola está, pra pegar no ar sem pulo.
						const [x0, y0] = spring.value;
						drag.current = {
							x: e.clientX - unrubber(x0, resistance),
							y: e.clientY - unrubber(y0, resistance),
							last: { x: x0, y: y0, t: performance.now() },
							v: { x: 0, y: 0 },
						};
						setDragging(true);
					}}
					onPointerMove={(e) => {
						const d = drag.current;
						if (!d) return;
						const rawX = e.clientX - d.x;
						const rawY = e.clientY - d.y;
						const x = rubber(rawX, resistance);
						const y = rubber(rawY, resistance);
						const now = performance.now();
						// Média com a anterior e dt mínimo de 8ms: clientX inteiro em eventos colados gera picos.
						const dt = Math.max(now - d.last.t, 8) / 1000;
						d.v = {
							x: (d.v.x + (x - d.last.x) / dt) / 2,
							y: (d.v.y + (y - d.last.y) / dt) / 2,
						};
						d.last = { x, y, t: now };
						spring.jump([x, y]);
						if (ghost.current)
							ghost.current.style.translate = `${rawX}px ${rawY}px`;
					}}
					ref={body}
					style={{ willChange: "transform" }}
					type="button"
				>
					<AvatarSticker shadow={5} size={72} />
				</button>
			</Stage>
			<Knobs file="rubber.ts" state={knobs}>
				<Line>
					{"rubber(distance, { max: 120px, resistance: "}
					<Knob k="resistance" max={1.5} min={0.1} step={0.05} />
					{" })"}
				</Line>
				<Line>
					{"spring({ stiffness: "}
					<Knob k="stiffness" max={700} min={60} step={10} />
					{", damping: "}
					<Knob k="damping" max={40} min={4} />
					{" })"}
				</Line>
				<Line>{"// (1 - 1 / (d × resistance / max + 1)) × max"}</Line>
			</Knobs>
		</>
	);
}
