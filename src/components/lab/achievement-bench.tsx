"use client";

import { useState } from "react";
import { Achievement } from "@/components/achievement";
import { Knobs, Line, Stage } from "@/components/lab/workbench";

/** A conquista do easter egg, fora da fila: toque de novo quando quiser rever a linha do tempo. */
export function AchievementBench({
	play,
	name,
	label,
	replay,
}: {
	play: string;
	name: string;
	label: string;
	replay: string;
}) {
	const [run, setRun] = useState(0);
	const [on, setOn] = useState(false);
	return (
		<>
			<Stage className="min-h-36 flex-col gap-6">
				<div className="flex h-14 items-center">
					{on && (
						<Achievement
							key={run}
							label={label}
							name={name}
							onDone={() => setOn(false)}
						/>
					)}
				</div>
				<button
					className="rounded-md border px-3 py-1.5 text-sm outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97]"
					onClick={() => {
						setRun((n) => n + 1);
						setOn(true);
					}}
					type="button"
				>
					{on ? replay : play}
				</button>
			</Stage>
			<Knobs file="achievement.ts">
				<Line>{"circle: pop 280ms -> hold -> collapse"}</Line>
				<Line>{"pill: open 200-520ms, close 4050-4400ms"}</Line>
				<Line>{"text: fade 420-600ms, out 3950-4100ms"}</Line>
			</Knobs>
		</>
	);
}
