"use client";

import type { CSSProperties } from "react";
import { Knob, Knobs, Line, Stage, useKnobs } from "@/components/lab/workbench";
import { Button } from "@/components/ui/button";

/** O botão cartoon do cd-ui com os três números na mão. */
export function CartoonBench({ label }: { label: string }) {
	const knobs = useKnobs({ offset: 4, "press-depth": 3, border: 2 });
	const { offset, "press-depth": depth, border } = knobs.values;
	// Afundar mais do que a sombra tem não faz sentido: o botão pararia no chão.
	const press = Math.min(depth, offset);
	return (
		<>
			<Stage>
				<Button
					className="h-11 px-6"
					style={
						{
							"--cartoon-ink": "var(--foreground)",
							"--cartoon-offset": `${offset}px`,
							"--press-depth": `${press}px`,
							"--cartoon-border": `${border}px`,
						} as CSSProperties
					}
					variant="cartoon"
				>
					{label}
				</Button>
			</Stage>
			<Knobs file="cartoon.css" state={knobs}>
				<Line>
					{"--cartoon-offset: "}
					<Knob k="offset" max={10} min={0} unit="px" />
					{";"}
				</Line>
				<Line>
					{"--press-depth: "}
					<Knob k="press-depth" max={10} min={0} unit="px" />
					{";"}
				</Line>
				<Line>
					{"--cartoon-border: "}
					<Knob k="border" max={4} min={1} unit="px" />
					{";"}
				</Line>
			</Knobs>
		</>
	);
}
