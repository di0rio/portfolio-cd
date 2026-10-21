"use client";

import { RotateCcwIcon } from "lucide-react";
import Image from "next/image";
import {
	createContext,
	type ReactNode,
	type RefObject,
	use,
	useEffect,
	useRef,
	useState,
} from "react";
import { CodeCopy } from "@/components/code-copy";
import { unlock } from "@/lib/achievements";
import { cn } from "@/lib/utils";

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

type KnobValue = number | boolean;

export type KnobState = {
	values: Record<string, KnobValue>;
	defaults: Record<string, KnobValue>;
	set: (key: string, value: KnobValue) => void;
	reset: () => void;
	dirty: boolean;
};

/** Estado dos números de uma bancada: valores, padrões (pra marcar o que mudou e resetar) e um setter por chave. */
export function useKnobs<T extends Record<string, KnobValue>>(defaults: T) {
	const initial = useRef(defaults).current;
	const [values, setValues] = useState(initial);
	return {
		values,
		defaults: initial,
		set: (key: string, value: KnobValue) => {
			unlock("bancada");
			// Mesmo valor devolve o mesmo objeto: o React pula o render.
			setValues((v) => (v[key] === value ? v : { ...v, [key]: value }));
		},
		reset: () => setValues(initial),
		dirty: Object.keys(initial).some((k) => values[k] !== initial[k]),
	} satisfies KnobState;
}

type BenchCopy = { copy: string; copied: string; reset: string; hint: string };

const BenchCopyContext = createContext<BenchCopy>({
	copy: "copiar",
	copied: "copiado",
	reset: "resetar",
	hint: "",
});
const KnobsContext = createContext<KnobState | null>(null);

/** Textos do painel de código (copiar, resetar, dica), entregues uma vez pela página do lab. */
export function WorkbenchCopy({
	value,
	children,
}: {
	value: BenchCopy;
	children: ReactNode;
}) {
	return <BenchCopyContext value={value}>{children}</BenchCopyContext>;
}

function useKnobState() {
	const state = use(KnobsContext);
	if (!state)
		throw new Error("Knob e Toggle precisam estar dentro de <Knobs state>.");
	return state;
}

/** Pisca o token em amarelo quando o valor muda por fora do arrasto (setas, -/+, reset, alças do gráfico). */
function useFlash(value: KnobValue, quiet: () => boolean) {
	const ref = useRef<HTMLElement>(null);
	const prev = useRef(value);
	useEffect(() => {
		if (prev.current === value) return;
		prev.current = value;
		if (quiet() || prefersReducedMotion()) return;
		ref.current?.animate(
			[
				{
					backgroundColor: "color-mix(in srgb, var(--brand) 55%, transparent)",
				},
				{ backgroundColor: "transparent" },
			],
			{ duration: 600, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
		);
	});
	return ref;
}

/**
 * O painel da bancada é o próprio código: cada número dentro dele se arrasta, aceita setas e vira campo no duplo clique.
 * O ponto amarelo ao lado do nome do arquivo é o "não salvo" de editor: aparece quando algo saiu do padrão.
 */
export function Knobs({
	file,
	state,
	children,
}: {
	file: string;
	state?: KnobState;
	children: ReactNode;
}) {
	const copy = use(BenchCopyContext);
	const code = useRef<HTMLDivElement>(null);
	const icon = useRef<SVGSVGElement>(null);

	// Texto limpo pra copiar: as linhas sem os controles flutuantes (-/+, régua).
	const text = () =>
		Array.from(code.current?.querySelectorAll("[data-line]") ?? [], (line) => {
			const clone = line.cloneNode(true) as Element;
			for (const skip of clone.querySelectorAll("[data-copy-skip]"))
				skip.remove();
			// Número em edição: o clone do <input> não tem texto, então entra o valor digitado.
			const inputs = line.querySelectorAll("input");
			clone.querySelectorAll("input").forEach((input, i) => {
				input.replaceWith(inputs[i].value);
			});
			return clone.textContent ?? "";
		}).join("\n");

	return (
		<KnobsContext value={state ?? null}>
			<div className="border-t" data-knobs>
				<div className="flex h-10 items-center gap-2 border-b bg-muted px-4 font-mono text-[12px] text-muted-foreground">
					<span>{file}</span>
					<span
						aria-hidden="true"
						className={cn(
							"size-1.5 rounded-full bg-brand transition-[opacity,scale] duration-base ease-out",
							state?.dirty ? "scale-100 opacity-100" : "scale-50 opacity-0",
						)}
					/>
					<div className="ml-auto flex items-center gap-1">
						{state && (
							<button
								aria-label={copy.reset}
								className="grid size-7 place-items-center rounded-md outline-none transition-[color,background-color,opacity] duration-fast ease-out hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-40"
								disabled={!state.dirty}
								onClick={() => {
									state.reset();
									if (!prefersReducedMotion())
										icon.current?.animate(
											[{ rotate: "0deg" }, { rotate: "-360deg" }],
											{
												duration: 500,
												easing: "cubic-bezier(0.23, 1, 0.32, 1)",
											},
										);
								}}
								type="button"
							>
								<RotateCcwIcon
									aria-hidden="true"
									className="size-3.5"
									ref={icon}
								/>
							</button>
						)}
						<CodeCopy done={copy.copied} label={copy.copy} text={text} />
					</div>
				</div>
				<div
					className="whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-8 [counter-reset:line]"
					ref={code}
				>
					{children}
				</div>
				{state && copy.hint && (
					<p className="-mt-1 px-4 pb-3 text-[12px] text-muted-foreground">
						{copy.hint}
					</p>
				)}
			</div>
		</KnobsContext>
	);
}

/** Uma linha do painel, com o número da linha na calha (via `counter`, fica fora do texto copiado). */
export function Line({ children }: { children: ReactNode }) {
	return (
		<div
			className="text-muted-foreground [counter-increment:line] before:mr-4 before:inline-block before:w-3 before:text-right before:text-muted-foreground/50 before:content-[counter(line)]"
			data-line
		>
			{children}
		</div>
	);
}

const TICKS = 11;
const clamp = (v: number, lo: number, hi: number) =>
	Math.min(hi, Math.max(lo, v));
// Arrastar a largura disso percorre a faixa inteira; com shift, 5x mais fino.
const DRAG_SPAN = 240;

/**
 * Um número arrastável dentro do código. Arraste na horizontal (shift = fino), use as setas (shift ou PageUp/PageDown
 * pula 10 passos), Home/End, ou duplo clique / Enter pra digitar. Passar o mouse ou focar mostra uma régua com -/+.
 */
export function Knob({
	k,
	min,
	max,
	step = 1,
	unit = "",
}: {
	/** Chave em `useKnobs`; também é o nome lido pelo leitor de tela. */
	k: string;
	min: number;
	max: number;
	step?: number;
	unit?: string;
}) {
	const state = useKnobState();
	const value = state.values[k] as number;
	const changed = value !== state.defaults[k];
	const [dragging, setDragging] = useState(false);
	const [editing, setEditing] = useState(false);
	const drag = useRef<{ x: number; v: number; fine: boolean } | null>(null);
	const token = useFlash(value, () => drag.current !== null);
	const decimals = String(step).split(".")[1]?.length ?? 0;
	const pct = ((value - min) / (max - min)) * 100;

	const set = (next: number) => {
		// Sem comparar com `value`: ele é do último render, e dois moves no mesmo quadro ficariam pra trás.
		state.set(
			k,
			Number(clamp(Math.round(next / step) * step, min, max).toFixed(decimals)),
		);
	};
	// Escape cancela; o blur que vem da desmontagem do campo não pode aplicar o que foi digitado.
	const cancelled = useRef(false);
	const edit = () => {
		cancelled.current = false;
		setEditing(true);
	};
	// Só Enter e Escape devolvem o foco pro número; blur (Tab, clique em outro lugar) deixa o foco seguir.
	const close = (refocus: boolean) => {
		setEditing(false);
		if (refocus) requestAnimationFrame(() => token.current?.focus());
	};
	const commit = (raw: string, refocus: boolean) => {
		if (cancelled.current) return;
		const n = Number.parseFloat(raw.replace(",", "."));
		if (Number.isFinite(n)) set(n);
		close(refocus);
	};

	// A régua é centrada no número; perto da borda do card ela desliza pra dentro em vez de ser cortada.
	const pop = useRef<HTMLSpanElement>(null);
	const fit = () => {
		const el = pop.current;
		const box = el?.closest("[data-knobs]")?.getBoundingClientRect();
		if (!(el && box)) return;
		el.style.setProperty("--shift", "0px");
		const r = el.getBoundingClientRect();
		const shift =
			Math.max(0, box.left + 4 - r.left) -
			Math.max(0, r.right - (box.right - 4));
		el.style.setProperty("--shift", `${shift}px`);
	};

	return (
		<span className="group/knob relative inline-block">
			{editing ? (
				<input
					aria-label={k}
					className="rounded-sm bg-brand/20 px-1 text-foreground outline-none ring-2 ring-brand"
					defaultValue={value}
					inputMode="decimal"
					onBlur={(e) => commit(e.currentTarget.value, false)}
					onFocus={(e) => e.currentTarget.select()}
					onKeyDown={(e) => {
						if (e.key === "Enter") commit(e.currentTarget.value, true);
						else if (e.key === "Escape") {
							cancelled.current = true;
							close(true);
						}
					}}
					// Entra em foco ao montar (o duplo clique ou o Enter pediram pra digitar).
					ref={(el) => el?.focus()}
					style={{ width: `${String(value).length + 2}ch` }}
				/>
			) : (
				<span
					aria-label={k}
					aria-orientation="horizontal"
					aria-valuemax={max}
					aria-valuemin={min}
					aria-valuenow={value}
					aria-valuetext={`${value}${unit}`}
					className={cn(
						"cursor-ew-resize touch-pan-y select-none rounded-sm px-1 py-1 tabular-nums underline decoration-dotted underline-offset-4 outline-none transition-colors duration-fast ease-out focus-visible:ring-2 focus-visible:ring-brand",
						dragging
							? "bg-brand text-[#1c1c1c] decoration-transparent"
							: changed
								? "text-brand-foreground decoration-brand hover:bg-brand/15"
								: "text-foreground decoration-muted-foreground/60 hover:bg-accent",
					)}
					onDoubleClick={edit}
					onFocus={fit}
					onKeyDown={(e) => {
						// Atalhos do navegador (Alt+← volta a página) passam direto.
						if (e.altKey || e.ctrlKey || e.metaKey) return;
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
						else if (e.key === "Enter") edit();
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
						drag.current = { x: e.clientX, v: value, fine: e.shiftKey };
						setDragging(true);
					}}
					onPointerEnter={fit}
					onPointerMove={(e) => {
						let d = drag.current;
						if (!d) return;
						// Shift no meio do arrasto: recomeça a conta daqui, pra não pular.
						if (e.shiftKey !== d.fine) {
							d = { x: e.clientX, v: value, fine: e.shiftKey };
							drag.current = d;
						}
						set(
							d.v +
								((e.clientX - d.x) / DRAG_SPAN) *
									(max - min) *
									(d.fine ? 0.2 : 1),
						);
					}}
					ref={token}
					role="slider"
					tabIndex={0}
				>
					{value}
					{unit}
				</span>
			)}
			{!editing && (
				<span
					className={cn(
						"absolute bottom-full left-1/2 z-10 -translate-x-[calc(50%-var(--shift,0px))] pb-1 leading-none transition-[opacity,visibility,translate] duration-fast ease-out",
						dragging
							? "visible translate-y-0 opacity-100"
							: "invisible translate-y-1 opacity-0 group-focus-within/knob:visible group-focus-within/knob:translate-y-0 group-focus-within/knob:opacity-100 hover-hover:group-hover/knob:visible hover-hover:group-hover/knob:translate-y-0 hover-hover:group-hover/knob:opacity-100 motion-reduce:translate-y-0",
					)}
					data-copy-skip
					ref={pop}
				>
					<span className="flex items-center gap-1 rounded-md border bg-popover p-0.5 shadow-sm">
						<Nudge onClick={() => set(value - step)} sign="-" />
						<span
							aria-hidden="true"
							className="relative flex h-3 w-20 items-end justify-between"
						>
							{Array.from({ length: TICKS }, (_, i) => (
								<span
									className={`w-px bg-border ${i % 5 === 0 ? "h-3" : "h-1.5"}`}
									// biome-ignore lint/suspicious/noArrayIndexKey: ticks fixos, nunca reordenam
									key={i}
								/>
							))}
							<span
								className={`absolute bottom-0 h-3 w-0.5 -translate-x-1/2 rounded-full bg-brand motion-safe:transition-[left] ${dragging ? "duration-0" : "duration-fast"}`}
								style={{ left: `${pct}%` }}
							/>
						</span>
						<Nudge onClick={() => set(value + step)} sign="+" />
					</span>
				</span>
			)}
		</span>
	);
}

/** Um `true`/`false` dentro do código: clique (ou espaço) inverte. */
export function Toggle({ k }: { k: string }) {
	const state = useKnobState();
	const on = state.values[k] as boolean;
	const token = useFlash(on, () => false);
	return (
		<button
			aria-checked={on}
			aria-label={k}
			className={cn(
				"cursor-pointer rounded-sm px-1 py-1 underline decoration-dotted underline-offset-4 outline-none transition-colors duration-fast ease-out focus-visible:ring-2 focus-visible:ring-brand",
				on !== state.defaults[k]
					? "text-brand-foreground decoration-brand hover:bg-brand/15"
					: "text-foreground decoration-muted-foreground/60 hover:bg-accent",
			)}
			onClick={() => state.set(k, !on)}
			ref={token as RefObject<HTMLButtonElement>}
			role="switch"
			type="button"
		>
			{String(on)}
		</button>
	);
}

/** Só ponteiro (o teclado usa o slider): -/+ dentro da régua. */
function Nudge({ sign, onClick }: { sign: "-" | "+"; onClick: () => void }) {
	return (
		<button
			aria-hidden="true"
			className="grid size-6 place-items-center rounded-sm text-muted-foreground transition-[background-color,color,scale] duration-instant ease-out hover:bg-accent hover:text-foreground motion-safe:active:scale-90"
			onClick={onClick}
			onPointerDown={(e) => e.preventDefault()}
			tabIndex={-1}
			type="button"
		>
			{sign}
		</button>
	);
}
