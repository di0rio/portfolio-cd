"use client";

import { XIcon } from "lucide-react";
import {
	useEffect,
	useEffectEvent,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { cn } from "@/lib/utils";

const HEIGHT = 56; // px: altura fixa, então o recuo de cada toast é só conta
const GAP = 8;
const PEEK = 10; // quanto cada toast de trás aparece acima do da frente, com a pilha fechada
const SCALE = 0.05; // cada nível de profundidade encolhe 5%
const VISIBLE = 3; // toasts visíveis com a pilha fechada
const MAX = 4;
const DURATION = 4000;
const DISTANCE = 96; // px: arrastou mais que isso, dispensa
const VELOCITY = 0.11; // px/ms: um "peteleco" dispensa mesmo com pouca distância
const EXIT = 220;
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

type Message = { title: string; desc: string };
type Copy = {
	add: string;
	clear: string;
	region: string;
	dismiss: string;
	messages: Message[];
};
type Toast = Message & { id: number; leaving?: -1 | 0 | 1 };

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
	const mq = window.matchMedia(reducedQuery);
	mq.addEventListener("change", cb);
	return () => mq.removeEventListener("change", cb);
}

/**
 * Pilha de toasts à la Sonner. Com a pilha fechada os avisos se empilham (escala + deslocamento); com mouse
 * ou foco ela abre e os timers pausam. Arrastar de lado dispensa por distância ou velocidade.
 * O container é uma região `aria-live`, então leitores de tela anunciam cada aviso novo.
 */
export function ToastStack({ copy }: { copy: Copy }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [hover, setHover] = useState(false);
	const [focus, setFocus] = useState(false);
	const [dragging, setDragging] = useState(false);
	const next = useRef(0);
	const reduced = useSyncExternalStore(
		subscribeReduced,
		() => window.matchMedia(reducedQuery).matches,
		() => false,
	);

	const count = toasts.length;
	const expanded = count > 0 && (hover || focus);
	const paused = expanded || dragging;

	// Marca como "saindo" (a animação roda) e só depois tira da lista.
	const dismiss = (id: number, dir: -1 | 0 | 1 = 0) => {
		setToasts((all) =>
			all.map((t) =>
				t.id === id && t.leaving === undefined ? { ...t, leaving: dir } : t,
			),
		);
		setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), EXIT);
	};

	function add() {
		if (!count) {
			// A região some do mapa quando vazia; hover e foco antigos não valem mais.
			setHover(false);
			setFocus(false);
		}
		const id = next.current++;
		const msg = copy.messages[id % copy.messages.length];
		setToasts((all) =>
			[{ ...msg, id }, ...all.filter((t) => t.leaving === undefined)].slice(
				0,
				MAX,
			),
		);
	}

	const height = expanded
		? count * (HEIGHT + GAP) - GAP
		: HEIGHT + (Math.min(count, VISIBLE) - 1) * PEEK;

	return (
		<div className="relative h-80 w-full max-w-sm overflow-hidden rounded-xl border bg-background">
			<div className="flex items-center justify-center gap-2 pt-6">
				<button
					className="h-9 rounded-lg border bg-card px-4 font-medium text-sm outline-none transition-transform duration-100 ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]"
					onClick={add}
					type="button"
				>
					{copy.add}
				</button>
				<button
					className="h-9 rounded-lg px-3 text-muted-foreground text-sm outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50"
					disabled={!toasts.length}
					onClick={() => {
						for (const t of toasts) dismiss(t.id);
					}}
					type="button"
				>
					{copy.clear}
				</button>
			</div>

			<section
				aria-label={copy.region}
				className={cn(
					"absolute inset-x-3 bottom-3",
					!count && "pointer-events-none",
				)}
				onBlur={(e) =>
					!e.currentTarget.contains(e.relatedTarget) && setFocus(false)
				}
				onFocus={() => setFocus(true)}
				onPointerEnter={(e) => e.pointerType !== "touch" && setHover(true)}
				onPointerLeave={() => setHover(false)}
				style={{
					height: count ? height : 0,
					transition: reduced ? "none" : `height 300ms ${EASE}`,
				}}
			>
				<ol
					aria-atomic="false"
					aria-live="polite"
					aria-relevant="additions"
					className="contents"
				>
					{toasts.map((t, i) => (
						<ToastItem
							copy={copy}
							depth={i}
							expanded={expanded}
							key={t.id}
							onDismiss={(dir) => dismiss(t.id, dir)}
							onDrag={setDragging}
							paused={paused}
							reduced={reduced}
							toast={t}
						/>
					))}
				</ol>
			</section>
		</div>
	);
}

function ToastItem({
	toast,
	depth,
	expanded,
	reduced,
	paused,
	copy,
	onDismiss,
	onDrag,
}: {
	toast: Toast;
	depth: number;
	expanded: boolean;
	reduced: boolean;
	paused: boolean;
	copy: Copy;
	onDismiss: (dir: -1 | 0 | 1) => void;
	onDrag: (dragging: boolean) => void;
}) {
	const [shown, setShown] = useState(false);
	const [dx, setDx] = useState<number | null>(null); // arrastando: deslocamento em px
	const drag = useRef<{ x: number; last: number; t: number; v: number } | null>(
		null,
	);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setShown(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	const leaving = toast.leaving !== undefined;

	// Cada toast gasta o próprio tempo; pausado, guarda o que sobrou e retoma de onde parou.
	const remaining = useRef(DURATION);
	const expire = useEffectEvent(() => onDismiss(0));
	useEffect(() => {
		if (paused || leaving) return;
		const start = performance.now();
		const timer = setTimeout(expire, remaining.current);
		return () => {
			clearTimeout(timer);
			remaining.current -= performance.now() - start;
		};
	}, [paused, leaving]);
	const hidden = !expanded && depth >= VISIBLE;
	const lift = expanded ? depth * (HEIGHT + GAP) : depth * PEEK;
	const scale = expanded ? 1 : 1 - depth * SCALE;

	// Posição na pilha (wrapper) e arraste horizontal (interno) em camadas separadas, pra um transform não brigar com o outro.
	const stack = reduced
		? { transition: "opacity 150ms ease-out" }
		: {
				transform: `translateY(${shown ? -lift : 24 - lift}px) scale(${scale})`,
				transition: `transform 300ms ${EASE}, opacity 200ms ease-out`,
			};
	// Dispensado por swipe: sai pro lado em que foi jogado. Sem swipe (timer ou botão), só esmaece.
	const x =
		dx !== null
			? `${dx}px`
			: toast.leaving
				? `${toast.leaving * 110}%`
				: undefined;

	function release(e: React.PointerEvent) {
		const d = drag.current;
		if (!d) return;
		drag.current = null;
		onDrag(false);
		const dist = e.clientX - d.x;
		setDx(null);
		if (
			Math.abs(dist) > DISTANCE ||
			(Math.abs(d.v) > VELOCITY && Math.sign(d.v) === Math.sign(dist))
		)
			onDismiss(dist < 0 ? -1 : 1);
	}

	return (
		<li
			className="absolute inset-x-0 bottom-0 origin-bottom list-none"
			inert={hidden || leaving}
			style={{
				height: HEIGHT,
				zIndex: 100 - depth,
				opacity: shown && !hidden ? 1 : 0,
				pointerEvents: hidden ? "none" : undefined,
				...stack,
			}}
		>
			<div
				className="flex h-full touch-pan-y select-none items-center gap-3 rounded-xl border bg-card px-3.5 shadow-md"
				onPointerCancel={() => {
					drag.current = null;
					onDrag(false);
					setDx(null);
				}}
				onPointerDown={(e) => {
					if (
						drag.current ||
						e.button !== 0 ||
						(e.target as Element).closest("button")
					)
						return;
					e.currentTarget.setPointerCapture(e.pointerId);
					drag.current = {
						x: e.clientX,
						last: e.clientX,
						t: performance.now(),
						v: 0,
					};
					onDrag(true);
					setDx(0);
				}}
				onPointerMove={(e) => {
					const d = drag.current;
					if (!d) return;
					const now = performance.now();
					// Velocidade suavizada entre os últimos movimentos (px/ms).
					d.v =
						0.6 * ((e.clientX - d.last) / Math.max(now - d.t, 1)) + 0.4 * d.v;
					d.last = e.clientX;
					d.t = now;
					setDx(e.clientX - d.x);
				}}
				onPointerUp={release}
				style={{
					transform: x ? `translateX(${x})` : undefined,
					opacity: leaving
						? 0
						: dx
							? 1 - Math.min(Math.abs(dx) / 240, 1) * 0.5
							: 1,
					transition:
						dx !== null
							? "none"
							: reduced
								? "opacity 150ms ease-out"
								: `transform ${EXIT}ms ${EASE}, opacity ${EXIT}ms ease-out`,
				}}
			>
				<span
					aria-hidden="true"
					className="size-1.5 shrink-0 rounded-[2px] bg-brand"
				/>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm leading-5">
						{toast.title}
					</p>
					<p className="truncate text-muted-foreground text-xs leading-4">
						{toast.desc}
					</p>
				</div>
				<button
					aria-label={copy.dismiss}
					className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
					onClick={() => onDismiss(0)}
					type="button"
				>
					<XIcon aria-hidden="true" className="size-3.5" />
				</button>
			</div>
		</li>
	);
}
