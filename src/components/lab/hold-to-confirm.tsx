"use client";

import { useEffect, useRef, useState } from "react";
import { unlock } from "@/lib/achievements";

type State = "idle" | "holding" | "done";

/**
 * Segurar pra confirmar: uma camada amarela é revelada com `clip-path` em `ms` (1,6 s por padrão) linear enquanto segura
 * e volta em 200 ms ao soltar. Lento onde a pessoa decide, rápido onde o sistema responde.
 */
export function HoldToConfirm({
	label,
	done,
	ms = 1600,
	onConfirm = () => unlock("firme"),
}: {
	label: string;
	done: string;
	ms?: number;
	/** Chamado quando o segurar completa. Sem ele, o gesto vale a conquista "firme" (a demo da home e do lab). */
	onConfirm?: () => void;
}) {
	const [state, setState] = useState<State>("idle");
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	// O timer é a fonte da verdade; o CSS só desenha o mesmo intervalo.
	const press = () => {
		if (state !== "idle") return;
		setState("holding");
		timer.current = setTimeout(() => {
			setState("done");
			onConfirm();
			timer.current = setTimeout(() => setState("idle"), 1600);
		}, ms);
	};
	const release = () => {
		if (state !== "holding") return;
		clearTimeout(timer.current);
		setState("idle");
	};

	return (
		<button
			aria-live="polite"
			className="group relative h-10 select-none overflow-hidden rounded-lg border bg-background px-5 font-medium text-sm outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]"
			data-state={state}
			onContextMenu={(e) => e.preventDefault()}
			onKeyDown={(e) => {
				if ((e.key === " " || e.key === "Enter") && !e.repeat) {
					e.preventDefault();
					press();
				}
			}}
			onKeyUp={(e) => (e.key === " " || e.key === "Enter") && release()}
			onPointerCancel={release}
			onPointerDown={press}
			onPointerLeave={release}
			onPointerUp={release}
			type="button"
		>
			<span>{label}</span>
			<span
				aria-hidden={state !== "done"}
				className="absolute inset-0 flex items-center justify-center bg-brand text-brand-contrast transition-[clip-path] duration-200 ease-out [clip-path:inset(0_100%_0_0)] group-data-[state=done]:[clip-path:inset(0)] group-data-[state=holding]:ease-linear group-data-[state=holding]:[clip-path:inset(0)]"
				style={
					state === "holding" ? { transitionDuration: `${ms}ms` } : undefined
				}
			>
				{state === "done" ? done : label}
			</span>
		</button>
	);
}
