"use client";

import { TrophyIcon } from "lucide-react";
import { useEffect, useRef } from "react";

const TOTAL = 4600;
const ease = "cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * Conquista no estilo Xbox 360, na paleta do site: o círculo do troféu salta, a pílula se abre a partir
 * dele, o texto aparece, segura uns segundos e tudo volta pro círculo. Só transform e opacity; com
 * movimento reduzido aparece parada e some no mesmo tempo. Chama `onDone` no fim.
 */
export function Achievement({
	label,
	name,
	onDone,
}: {
	label: string;
	name: string;
	onDone: () => void;
}) {
	const circle = useRef<HTMLDivElement>(null);
	const pill = useRef<HTMLDivElement>(null);
	const text = useRef<HTMLDivElement>(null);
	const done = useRef(onDone);
	done.current = onDone;

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			const id = setTimeout(() => done.current(), TOTAL);
			return () => clearTimeout(id);
		}
		// Offsets em ms dentro da mesma linha do tempo de TOTAL ms.
		const at = (ms: number) => ms / TOTAL;
		const options = {
			duration: TOTAL,
			easing: "linear",
			fill: "both",
		} as const;
		const animations = [
			circle.current?.animate(
				[
					{ transform: "scale(0)", offset: 0, easing: ease },
					{ transform: "scale(1.12)", offset: at(180), easing: ease },
					{ transform: "scale(1)", offset: at(280) },
					{ transform: "scale(1)", offset: at(4350), easing: ease },
					{ transform: "scale(0)", offset: 1 },
				],
				options,
			),
			pill.current?.animate(
				[
					{ transform: "scaleX(0)", offset: 0 },
					{ transform: "scaleX(0)", offset: at(200), easing: ease },
					{ transform: "scaleX(1)", offset: at(520) },
					{ transform: "scaleX(1)", offset: at(4050), easing: ease },
					{ transform: "scaleX(0)", offset: at(4400) },
					{ transform: "scaleX(0)", offset: 1 },
				],
				options,
			),
			text.current?.animate(
				[
					{ opacity: 0, offset: 0 },
					{ opacity: 0, offset: at(420) },
					{ opacity: 1, offset: at(600) },
					{ opacity: 1, offset: at(3950) },
					{ opacity: 0, offset: at(4100) },
					{ opacity: 0, offset: 1 },
				],
				options,
			),
		];
		let cancelled = false;
		animations[0]?.finished.then(
			() => !cancelled && done.current(),
			// `finished` rejeita com AbortError quando a limpeza cancela: esperado, nada a fazer.
			() => {},
		);
		return () => {
			cancelled = true;
			for (const a of animations) a?.cancel();
		};
	}, []);

	return (
		<div className="relative flex h-14 items-center">
			{/* A pílula abre a partir do centro do círculo (28px = metade dos 56px dele). */}
			<div
				className="absolute inset-0 origin-[28px_center] rounded-full bg-[#1c1c1c] shadow-lg ring-1 ring-white/10"
				ref={pill}
			/>
			<div
				className="relative grid size-14 shrink-0 place-items-center rounded-full bg-brand text-[#1c1c1c] ring-4 ring-[#1c1c1c]"
				ref={circle}
			>
				<TrophyIcon aria-hidden className="size-6" strokeWidth={2.25} />
			</div>
			<div className="relative whitespace-nowrap pr-7 pl-3.5" ref={text}>
				<p className="text-[#f6f4ee]/70 text-[11px] leading-tight">{label}</p>
				<p className="font-medium text-[#f6f4ee] text-sm leading-snug">
					<span className="font-mono text-brand">10G</span> - {name}
				</p>
			</div>
		</div>
	);
}
