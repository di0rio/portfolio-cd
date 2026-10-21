"use client";

import { HoldToConfirm } from "@/components/lab/hold-to-confirm";
import { Knob, Knobs, Line, Stage, useKnobs } from "@/components/lab/workbench";

/** O segurar-pra-confirmar da home, com o tempo de enchimento na mão. */
export function HoldBench({ label, done }: { label: string; done: string }) {
	const knobs = useKnobs({ duration: 1600 });
	const ms = knobs.values.duration;
	return (
		<>
			<Stage>
				<HoldToConfirm done={done} label={label} ms={ms} />
			</Stage>
			<Knobs file="hold.ts" state={knobs}>
				<Line>
					{"hold({ duration: "}
					<Knob k="duration" max={3000} min={400} step={100} unit="ms" />
					{", release: 200ms })"}
				</Line>
			</Knobs>
		</>
	);
}
