"use client";

import * as React from "react";

export type ConfettiShape = "square" | "circle" | "strip" | "star";

export type ConfettiOptions = {
	/** De onde sai a rajada: um elemento (o centro dele) ou pixels da viewport. Padrão: o meio da tela. */
	origin?: Element | { x: number; y: number };
	/** Quantidade de peças (máx. 200). */
	count?: number;
	/** Abertura do cone em graus. 360 espalha pra todo lado. */
	spread?: number;
	/** Direção do centro do cone em graus: 0 é direita, 90 é baixo, 270 (padrão) é cima. */
	angle?: number;
	/** Qualquer cor CSS, inclusive `var(--brand)`. */
	colors?: string[];
	shapes?: ConfettiShape[];
	/** Velocidade de lançamento em px/s. */
	power?: number;
};

const COLORS = ["var(--brand)", "#E53935", "#1E88E5", "#43A047", "#FB8C00"];
const SHAPES: ConfettiShape[] = ["square", "circle", "strip"];
const GRAVITY = 1500; // px/s²
const STEPS = 12; // amostras da curva física; o WAAPI interpola entre elas
const STAR =
	"polygon(50% 0, 62% 36%, 100% 38%, 70% 60%, 80% 100%, 50% 76%, 20% 100%, 30% 60%, 0 38%, 38% 36%)";

const reducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resolveOrigin(origin: ConfettiOptions["origin"]) {
	if (origin && "getBoundingClientRect" in origin) {
		const r = origin.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	}
	return origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function shapeStyle(piece: HTMLElement, shape: ConfettiShape) {
	const size = 6 + Math.random() * 6;
	piece.style.width = `${shape === "strip" ? size * 0.5 : size}px`;
	piece.style.height = `${shape === "strip" ? size * 1.8 : size}px`;
	if (shape === "circle") piece.style.borderRadius = "50%";
	if (shape === "star") piece.style.clipPath = STAR;
}

/**
 * Dispara uma rajada de confete. Peças de DOM animadas com WAAPI (só transform e opacity), sem canvas, sem dependências.
 * Devolve uma função que cancela. Não faz nada no servidor nem com movimento reduzido.
 */
export function confetti({
	origin,
	count = 60,
	spread = 70,
	angle = 270,
	colors = COLORS,
	shapes = SHAPES,
	power = 900,
}: ConfettiOptions = {}): () => void {
	if (typeof document === "undefined" || reducedMotion()) return () => {};
	const from = resolveOrigin(origin);
	const layer = document.createElement("div");
	layer.setAttribute("aria-hidden", "true");
	layer.style.cssText =
		"position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden";

	const animations = Array.from(
		{ length: Math.min(Math.max(count, 0), 200) },
		(_, i) => {
			const piece = document.createElement("span");
			piece.style.cssText =
				"position:absolute;left:0;top:0;will-change:transform,opacity";
			piece.style.backgroundColor = colors[i % colors.length];
			shapeStyle(piece, shapes[i % shapes.length]);
			layer.append(piece);

			const dir = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
			const speed = power * (0.45 + Math.random() * 0.55);
			const vx = Math.cos(dir) * speed;
			const vy = Math.sin(dir) * speed;
			const spin = (Math.random() - 0.5) * 1080;
			const duration = 1100 + Math.random() * 500;
			const frames = Array.from({ length: STEPS + 1 }, (_, s) => {
				const t = (s / STEPS) * (duration / 1000);
				return {
					transform: `translate(${from.x + vx * t}px, ${from.y + vy * t + 0.5 * GRAVITY * t * t}px) rotate(${(spin * s) / STEPS}deg)`,
					opacity: s / STEPS > 0.7 ? 1 - (s / STEPS - 0.7) / 0.3 : 1,
				};
			});
			return piece.animate(frames, {
				duration,
				easing: "linear",
				fill: "forwards",
			});
		},
	);

	document.body.append(layer);
	const stop = () => layer.remove();
	Promise.all(animations.map((a) => a.finished)).then(stop, () => {
		// `finished` rejeita com AbortError quando a rajada é cancelada: esperado.
	});
	return () => {
		for (const a of animations) a.cancel();
		stop();
	};
}

type Child = React.ReactElement<
	Partial<
		Record<
			"onClick" | "onPointerDown" | "onPointerEnter",
			(event: React.SyntheticEvent<HTMLElement>) => void
		>
	>
>;

const handlers = {
	click: "onClick",
	pointerdown: "onPointerDown",
	pointerenter: "onPointerEnter",
} as const;

export type ConfettiProps = Omit<ConfettiOptions, "origin"> & {
	/** Exatamente um elemento. Ele precisa repassar o handler pro DOM, como o Button faz. */
	children: Child;
	/** O evento do filho que dispara a rajada. */
	on?: keyof typeof handlers;
	disabled?: boolean;
};

/**
 * Envolve um elemento e dispara uma rajada do centro dele num evento (clique por padrão).
 * Não adiciona markup: o filho mantém as próprias props, handlers e ref.
 * Com movimento reduzido, a rajada vira um pulso rápido de opacidade no filho.
 */
export function Confetti({
	children,
	on = "click",
	disabled = false,
	...options
}: ConfettiProps): React.ReactElement {
	const key = handlers[on];
	const child = React.Children.only(children);

	return React.cloneElement(child, {
		[key]: (event: React.SyntheticEvent<HTMLElement>) => {
			child.props[key]?.(event);
			if (disabled || event.defaultPrevented) return;
			if (reducedMotion()) {
				event.currentTarget.animate(
					{ opacity: [1, 0.6, 1] },
					{ duration: 200, easing: "ease-out" },
				);
				return;
			}
			confetti({ ...options, origin: event.currentTarget });
		},
	});
}
