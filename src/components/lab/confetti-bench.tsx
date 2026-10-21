"use client";

import { Knob, Knobs, Line, Stage, useKnobs } from "@/components/lab/workbench";
import { Button } from "@/components/ui/button";
import { Confetti, confetti } from "@/components/ui/confetti";

/** Raio do cone desenhado no palco, por px/s de força: só pra dar a ideia de alcance. */
const REACH = 1 / 16;

/**
 * O confete do cd-ui com os quatro números na mão. O cone atrás do botão mostra pra onde e quão aberto ele sai;
 * clicar em qualquer lugar do palco solta uma rajada dali.
 */
export function ConfettiBench({
	label,
	hint,
}: {
	label: string;
	hint: string;
}) {
	const knobs = useKnobs({ count: 60, spread: 70, angle: 270, power: 900 });
	const { count, spread, angle, power } = knobs.values;
	const options = { count, spread, angle, power };

	const r = power * REACH;
	const rad = (deg: number) => (deg * Math.PI) / 180;
	const a0 = rad(angle - spread / 2);
	const a1 = rad(angle + spread / 2);
	const cone =
		spread >= 360
			? null
			: `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 ${spread > 180 ? 1 : 0} 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;

	return (
		<>
			<Stage className="min-h-60">
				{/* O palco inteiro é gatilho de ponteiro; o teclado usa o botão. */}
				<div
					aria-hidden="true"
					className="absolute inset-0 cursor-crosshair"
					onPointerDown={(e) =>
						confetti({ ...options, origin: { x: e.clientX, y: e.clientY } })
					}
				/>
				<svg
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 left-1/2 overflow-visible"
					height="1"
					width="1"
				>
					{cone ? (
						<path
							className="fill-brand/15 stroke-brand stroke-[1.5] [stroke-dasharray:4_4]"
							d={cone}
						/>
					) : (
						<circle
							className="fill-brand/15 stroke-brand stroke-[1.5] [stroke-dasharray:4_4]"
							r={r}
						/>
					)}
				</svg>
				<Confetti {...options}>
					<Button className="relative h-11 px-6" variant="cartoon">
						{label}
					</Button>
				</Confetti>
				<p className="pointer-events-none absolute bottom-3 left-4 text-[12px] text-muted-foreground">
					{hint}
				</p>
			</Stage>
			<Knobs file="confetti.ts" state={knobs}>
				<Line>
					{"confetti({ count: "}
					<Knob k="count" max={200} min={5} step={5} />
					{", spread: "}
					<Knob k="spread" max={360} min={10} step={5} />
					{","}
				</Line>
				<Line>
					{"  angle: "}
					<Knob k="angle" max={360} min={0} step={5} />
					{", power: "}
					<Knob k="power" max={1800} min={300} step={50} />
					{" })"}
				</Line>
			</Knobs>
		</>
	);
}
