"use client";

import { useState } from "react";
import { HoldToConfirm } from "@/components/lab/hold-to-confirm";
import { Knob, Knobs, Stage } from "@/components/lab/workbench";

/** O segurar-pra-confirmar da home, com o tempo de enchimento na mão. */
export function HoldBench({ label, done }: { label: string; done: string }) {
	const [ms, setMs] = useState(1600);
	return (
		<>
			<Stage>
				<HoldToConfirm done={done} label={label} ms={ms} />
			</Stage>
			<Knobs code={`hold({ duration: ${ms}ms, release: 200ms })`}>
				<Knob
					max={3000}
					min={400}
					name="duration"
					onChange={setMs}
					step={100}
					unit="ms"
					value={ms}
				/>
			</Knobs>
		</>
	);
}
