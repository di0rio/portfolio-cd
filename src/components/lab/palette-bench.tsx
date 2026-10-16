"use client";

import { useEffect, useRef, useState } from "react";
import { Knob, Knobs, Stage } from "@/components/lab/workbench";

type Phase = "closed" | "loading" | "open";

/**
 * A paleta de comandos com a rede na mão: o diálogo é um pedaço de código que baixa na primeira abertura.
 * Sem pré-carga o 1º Ctrl+K espera a rede; com ela (o que o site faz em ociosidade) abre no mesmo quadro.
 * É uma simulação, pra não mexer na paleta de verdade nem na sua rede.
 */
export function PaletteBench({
	copy,
}: {
	copy: {
		preload: string;
		cold: string;
		open: string;
		close: string;
		search: string;
		rows: string[];
		took: string;
		idle: string;
	};
}) {
	const [preload, setPreload] = useState(false);
	const [network, setNetwork] = useState(450);
	const [phase, setPhase] = useState<Phase>("closed");
	const [took, setTook] = useState<number | null>(null);
	const t0 = useRef(0);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	// Mede até o quadro em que a lista aparece de fato, não até o setState.
	const show = () => {
		setPhase("open");
		requestAnimationFrame(() =>
			requestAnimationFrame(() =>
				setTook(Math.round(performance.now() - t0.current)),
			),
		);
	};
	const open = () => {
		clearTimeout(timer.current);
		t0.current = performance.now();
		setTook(null);
		if (preload) return show();
		setPhase("loading");
		timer.current = setTimeout(show, network);
	};
	const close = () => {
		clearTimeout(timer.current);
		setPhase("closed");
		setTook(null);
	};

	return (
		<>
			<Stage className="min-h-60 flex-col gap-4">
				<div
					aria-hidden="true"
					className="h-[132px] w-full max-w-xs overflow-hidden rounded-lg border bg-background text-sm shadow-[3px_3px_0_0_var(--foreground)]"
				>
					<div className="flex h-9 items-center gap-2 border-b px-3 font-mono text-[13px]">
						<span className="text-muted-foreground">&gt;</span>
						<span className={phase === "open" ? "" : "text-muted-foreground"}>
							{phase === "closed" ? "" : copy.search}
						</span>
						{phase !== "closed" && (
							<span className="h-4 w-0.5 bg-brand motion-safe:animate-pulse" />
						)}
					</div>
					{phase === "closed" && <div className="h-24" />}
					{phase === "loading" && (
						<div className="flex flex-col gap-2.5 p-3">
							{[72, 56, 64].map((w) => (
								<span
									className="h-4 rounded-sm bg-foreground/10 motion-safe:animate-pulse"
									key={w}
									style={{ width: `${w}%` }}
								/>
							))}
						</div>
					)}
					{phase === "open" && (
						<ul className="flex flex-col p-1.5">
							{copy.rows.map((row, i) => (
								<li
									className={`rounded-md px-2 py-1 ${i === 0 ? "bg-brand text-[#1c1c1c]" : ""}`}
									key={row}
								>
									{row}
								</li>
							))}
						</ul>
					)}
				</div>
				<p
					aria-live="polite"
					className="h-5 font-mono text-[13px] tabular-nums"
				>
					{phase === "loading" && "..."}
					{phase === "open" && took !== null && (
						<span
							className={took < 50 ? "font-medium" : "text-muted-foreground"}
						>
							{`${copy.took} ${took} ms`}
						</span>
					)}
					{phase === "closed" && (
						<span className="text-muted-foreground">{copy.idle}</span>
					)}
				</p>
				<div className="flex flex-wrap items-center justify-center gap-2">
					<button
						className="h-11 rounded-md border bg-card px-4 font-medium text-sm outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97]"
						onClick={phase === "closed" ? open : close}
						type="button"
					>
						{phase === "closed" ? copy.open : copy.close}
					</button>
					<button
						aria-pressed={preload}
						className={`h-11 rounded-md border px-4 font-mono text-[13px] outline-none transition-[background-color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97] ${preload ? "bg-brand text-[#1c1c1c]" : "bg-card text-muted-foreground hover:bg-accent"}`}
						onClick={() => {
							setPreload((p) => !p);
							close();
						}}
						type="button"
					>
						{preload ? copy.preload : copy.cold}
					</button>
				</div>
			</Stage>
			<Knobs code={`open({ preload: ${preload}, network: ${network}ms })`}>
				<Knob
					max={1500}
					min={50}
					name="network"
					onChange={setNetwork}
					step={50}
					unit="ms"
					value={network}
				/>
			</Knobs>
		</>
	);
}
