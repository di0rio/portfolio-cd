"use client";

import { type CSSProperties, useState } from "react";
import { Knob, Knobs, Stage } from "@/components/lab/workbench";
import { Button } from "@/components/ui/button";

/** O botão cartoon do cd-ui com os três números na mão. */
export function CartoonBench({ label }: { label: string }) {
	const [offset, setOffset] = useState(4);
	const [depth, setDepth] = useState(3);
	const [border, setBorder] = useState(2);
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
			<Knobs
				code={`--cartoon-offset: ${offset}px;\n--press-depth: ${press}px;\n--cartoon-border: ${border}px;`}
			>
				<Knob
					max={10}
					min={0}
					name="offset"
					onChange={setOffset}
					unit="px"
					value={offset}
				/>
				<Knob
					max={10}
					min={0}
					name="press-depth"
					onChange={setDepth}
					unit="px"
					value={depth}
				/>
				<Knob
					max={4}
					min={1}
					name="border"
					onChange={setBorder}
					unit="px"
					value={border}
				/>
			</Knobs>
		</>
	);
}
