"use client";

import Image from "next/image";
import {
	type ReactNode,
	type RefObject,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import { unlock } from "@/lib/achievements";

export const prefersReducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type SpringConfig = { stiffness: number; damping: number };

/**
 * Mola mínima (massa 1, integração semi-implícita) sobre N números. Sempre parte do valor atual e
 * mantém a velocidade, então dá pra interromper e redirecionar a qualquer momento. Só roda enquanto se mexe.
 */
function createSpring(
	size: number,
	apply: RefObject<(v: number[]) => void>,
	config: RefObject<SpringConfig>,
) {
	const value = new Array<number>(size).fill(0);
	const velocity = new Array<number>(size).fill(0);
	const target = new Array<number>(size).fill(0);
	let raf = 0;
	let last = 0;
	let onRest: (() => void) | undefined;

	const frame = (now: number) => {
		const dt = Math.min((now - last) / 1000, 1 / 30);
		last = now;
		const { stiffness, damping } = config.current;
		let rest = true;
		for (let i = 0; i < size; i++) {
			velocity[i] +=
				(-stiffness * (value[i] - target[i]) - damping * velocity[i]) * dt;
			value[i] += velocity[i] * dt;
			if (
				Math.abs(value[i] - target[i]) > 0.003 ||
				Math.abs(velocity[i]) > 0.01
			)
				rest = false;
		}
		if (rest) {
			for (let i = 0; i < size; i++) {
				value[i] = target[i];
				velocity[i] = 0;
			}
			raf = 0;
			apply.current(value);
			const done = onRest;
			onRest = undefined;
			done?.();
			return;
		}
		apply.current(value);
		raf = requestAnimationFrame(frame);
	};
	const start = () => {
		if (raf) return;
		last = performance.now();
		raf = requestAnimationFrame(frame);
	};

	return {
		value,
		to(next: number[], done?: () => void) {
			for (let i = 0; i < size; i++) target[i] = next[i];
			onRest = done;
			start();
		},
		jump(next: number[]) {
			for (let i = 0; i < size; i++) {
				value[i] = target[i] = next[i];
				velocity[i] = 0;
			}
			onRest = undefined;
			cancelAnimationFrame(raf);
			raf = 0;
			apply.current(value);
		},
		kick(i: number, v: number) {
			velocity[i] += v;
			start();
		},
		stop() {
			cancelAnimationFrame(raf);
			raf = 0;
		},
	};
}

export function useSpring(
	size: number,
	apply: (v: number[]) => void,
	config: SpringConfig,
) {
	const applyRef = useRef(apply);
	applyRef.current = apply;
	const configRef = useRef(config);
	configRef.current = config;
	const spring = useRef<ReturnType<typeof createSpring>>(null);
	if (!spring.current) spring.current = createSpring(size, applyRef, configRef);
	useEffect(() => () => spring.current?.stop(), []);
	return spring.current;
}

/** O desenho do cauã como adesivo: bloco amarelo atrás, borda preta por cima (igual à home). */
export function AvatarSticker({
	size,
	shadow,
}: {
	size: number;
	shadow: number;
}) {
	return (
		<span
			className="relative block shrink-0 select-none"
			style={{ width: size, height: size }}
		>
			<span
				aria-hidden="true"
				className="absolute inset-0 rounded-[25%] bg-brand"
				style={{ transform: `translate(${shadow}px, ${shadow}px)` }}
			/>
			<Image
				alt=""
				className="pointer-events-none relative rounded-[25%] bg-white dark:bg-[#1c1c1c]"
				draggable={false}
				height={size}
				src="/avatar-cartoon.svg"
				unoptimized
				width={size}
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 rounded-[25%] border-2 border-black"
			/>
		</span>
	);
}

export function Stage({
	children,
	className = "",
	ref,
}: {
	children: ReactNode;
	className?: string;
	ref?: RefObject<HTMLDivElement | null>;
}) {
	return (
		<div
			className={`relative flex min-h-44 items-center justify-center px-6 py-10 ${className}`}
			ref={ref}
		>
			{children}
		</div>
	);
}

/** Botões da bancada: os números aparecem como código embaixo, pra quem quiser levar. */
export function Knobs({
	code,
	children,
}: {
	code: string;
	children: ReactNode;
}) {
	return (
		<div className="border-t px-6 py-4">
			<div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{children}</div>
			<p className="mt-4 overflow-x-auto whitespace-pre font-mono text-[13px] text-muted-foreground">
				{code}
			</p>
		</div>
	);
}

const TICKS = 21;
const clamp = (v: number, lo: number, hi: number) =>
	Math.min(hi, Math.max(lo, v));

/**
 * Botão da bancada: um número que se arrasta, igual a um token no terminal (`stiffness: [220]`).
 * Arraste na horizontal, use as setas (shift ou PageUp/PageDown pula 10 passos) ou os botões -/+.
 */
export function Knob({
	name,
	value,
	min,
	max,
	step = 1,
	unit = "",
	onChange,
}: {
	name: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	unit?: string;
	onChange: (value: number) => void;
}) {
	const labelId = useId();
	const [dragging, setDragging] = useState(false);
	const drag = useRef<{ x: number; v: number; width: number } | null>(null);

	const set = (next: number) => {
		const v = clamp(Math.round(next / step) * step, min, max);
		if (v === value) return;
		unlock("bancada");
		onChange(v);
	};
	const pct = ((value - min) / (max - min)) * 100;

	return (
		<div className="flex flex-col">
			<span
				className="font-mono text-[13px] text-muted-foreground"
				id={labelId}
			>
				{name}:
			</span>
			<div className="flex items-center">
				<NudgeButton onClick={() => set(value - step)} sign="-" />
				<div
					aria-labelledby={labelId}
					aria-orientation="horizontal"
					aria-valuemax={max}
					aria-valuemin={min}
					aria-valuenow={value}
					aria-valuetext={`${value}${unit}`}
					className={`flex h-11 min-w-0 flex-1 cursor-ew-resize touch-pan-y select-none flex-col justify-center rounded-md px-2 outline-none focus-visible:ring-2 focus-visible:ring-brand ${dragging ? "bg-brand/20" : "hover:bg-accent"}`}
					onKeyDown={(e) => {
						const big = e.shiftKey ? 10 : 1;
						const moves: Record<string, number> = {
							ArrowLeft: -step * big,
							ArrowDown: -step * big,
							ArrowRight: step * big,
							ArrowUp: step * big,
							PageDown: -step * 10,
							PageUp: step * 10,
						};
						if (e.key === "Home") set(min);
						else if (e.key === "End") set(max);
						else if (e.key in moves) set(value + moves[e.key]);
						else return;
						e.preventDefault();
					}}
					onLostPointerCapture={() => {
						drag.current = null;
						setDragging(false);
					}}
					onPointerDown={(e) => {
						if (drag.current || e.button !== 0) return;
						e.currentTarget.setPointerCapture(e.pointerId);
						drag.current = {
							x: e.clientX,
							v: value,
							width: e.currentTarget.getBoundingClientRect().width,
						};
						setDragging(true);
					}}
					onPointerMove={(e) => {
						const d = drag.current;
						if (d) set(d.v + ((e.clientX - d.x) / d.width) * (max - min));
					}}
					role="slider"
					tabIndex={0}
				>
					<span className="text-center font-mono text-[15px] tabular-nums">
						<span className="text-muted-foreground">[</span>
						<span
							className={`rounded-sm px-1 ${dragging ? "bg-brand text-[#1c1c1c]" : ""}`}
						>
							{value}
							{unit}
						</span>
						<span className="text-muted-foreground">]</span>
					</span>
					<span
						aria-hidden="true"
						className="relative mx-1 mt-1 flex h-2.5 items-end justify-between"
					>
						{Array.from({ length: TICKS }, (_, i) => (
							<span
								className={`w-px bg-border ${i % 5 === 0 ? "h-2" : "h-1"}`}
								// biome-ignore lint/suspicious/noArrayIndexKey: ticks fixos, nunca reordenam
								key={i}
							/>
						))}
						<span
							className={`absolute bottom-0 h-2.5 w-0.5 -translate-x-1/2 rounded-full bg-brand motion-safe:transition-[left] ${dragging ? "duration-0" : "duration-100"}`}
							style={{ left: `${pct}%` }}
						/>
					</span>
				</div>
				<NudgeButton onClick={() => set(value + step)} sign="+" />
			</div>
		</div>
	);
}

/** Só ponteiro (o teclado usa o slider): área de 44px com um círculo menor desenhado dentro. */
function NudgeButton({
	sign,
	onClick,
}: {
	sign: "-" | "+";
	onClick: () => void;
}) {
	return (
		<button
			aria-hidden="true"
			className="group flex size-11 shrink-0 items-center justify-center outline-none"
			onClick={onClick}
			tabIndex={-1}
			type="button"
		>
			<span className="flex size-7 items-center justify-center rounded-full border font-mono text-sm transition-[background-color,transform] duration-100 ease-out group-hover:bg-accent motion-safe:group-active:scale-90">
				{sign}
			</span>
		</button>
	);
}
