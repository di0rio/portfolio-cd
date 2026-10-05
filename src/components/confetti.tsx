"use client";

import { useEffect, useRef } from "react";

const PIECES = 40;
// Os quatro cavaleiros de Castle Crashers (vermelho, azul, verde, laranja) e o amarelo da marca.
const COLORS = ["#E53935", "#1E88E5", "#43A047", "#FB8C00", "var(--brand)"];

/**
 * Rajada de confete: peças de DOM que sobem, caem e somem uma vez (só transform e opacity), e depois `onDone`.
 * Com movimento reduzido não desenha nada e chama `onDone` na hora.
 */
export function Confetti({ onDone }: { onDone: () => void }) {
	const root = useRef<HTMLDivElement>(null);
	const done = useRef(onDone);
	done.current = onDone;

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			done.current();
			return;
		}
		const animations = Array.from(root.current?.children ?? []).map((piece) => {
			const dx = (Math.random() - 0.5) * 2 * window.innerWidth * 0.35;
			const up = 120 + Math.random() * 200;
			const spin = (Math.random() - 0.5) * 1080;
			return piece.animate(
				[
					{ transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
					{
						transform: `translate(${dx * 0.6}px, ${-up}px) rotate(${spin * 0.5}deg)`,
						opacity: 1,
						offset: 0.35,
					},
					{
						transform: `translate(${dx}px, ${window.innerHeight * 0.4}px) rotate(${spin}deg)`,
						opacity: 0,
					},
				],
				{
					duration: 900 + Math.random() * 300,
					easing: "cubic-bezier(0.23, 1, 0.32, 1)",
					fill: "forwards",
				},
			);
		});
		let cancelled = false;
		Promise.all(animations.map((a) => a.finished)).then(
			() => !cancelled && done.current(),
			// `finished` rejeita com AbortError quando a limpeza cancela as animações: esperado, nada a fazer.
			() => {},
		);
		return () => {
			cancelled = true;
			for (const a of animations) a.cancel();
		};
	}, []);

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
			ref={root}
		>
			{Array.from({ length: PIECES }, (_, i) => (
				<span
					className="absolute top-[55%] left-1/2 h-2.5 w-1.5 rounded-[1px]"
					// biome-ignore lint/suspicious/noArrayIndexKey: peças idênticas e estáticas
					key={i}
					style={{ backgroundColor: COLORS[i % COLORS.length] }}
				/>
			))}
		</div>
	);
}
