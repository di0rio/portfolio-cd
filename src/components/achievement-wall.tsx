"use client";

import { CheckIcon, LockIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { HoldToConfirm } from "@/components/lab/hold-to-confirm";
import {
	getServerSnapshot,
	getSnapshot,
	reset,
	subscribe,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";

type Item = {
	id: string;
	secret: boolean;
	name: string;
	desc: string;
	hint: string;
};

type Props = {
	items: Item[];
	locale: string;
	copy: {
		of: string;
		list: string;
		locked: string;
		secret: string;
		resetTitle: string;
		resetNote: string;
		resetLabel: string;
		resetDone: string;
	};
};

/** O mural: lê as conquistas do navegador (localStorage) e lista todas, desbloqueadas em cor cheia e as outras apagadas com a dica. */
export function AchievementWall({ items, locale, copy }: Props) {
	const unlocked = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);
	const fmt = new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
	const done = Object.keys(unlocked).length;

	return (
		<>
			<div className="flex flex-col gap-3">
				<p
					aria-live="polite"
					className="font-mono text-muted-foreground text-sm tabular-nums"
				>
					{done} {copy.of} {items.length}
				</p>
				<ul aria-label={copy.list} className="flex flex-col divide-y">
					{items.map((item) => {
						const date = unlocked[item.id as keyof typeof unlocked];
						const hidden = item.secret && !date;
						return (
							<li
								className={cn(
									"flex items-start gap-3 py-3 transition-opacity duration-200",
									!date && "opacity-55",
								)}
								key={item.id}
							>
								{date ? (
									<CheckIcon
										aria-hidden="true"
										className="mt-1 size-4 shrink-0 text-brand-foreground"
									/>
								) : (
									<LockIcon
										aria-hidden="true"
										className="mt-1 size-4 shrink-0 text-muted-foreground"
									/>
								)}
								<div className="min-w-0 flex-1">
									<p className="font-medium">
										{hidden ? copy.secret : item.name}
										{!date && <span className="sr-only"> ({copy.locked})</span>}
									</p>
									<p className="text-muted-foreground text-sm">
										{date ? item.desc : item.hint}
									</p>
								</div>
								{date && (
									<time
										className="shrink-0 pt-0.5 font-mono text-muted-foreground text-xs tabular-nums"
										dateTime={date}
									>
										{fmt.format(new Date(date))}
									</time>
								)}
							</li>
						);
					})}
				</ul>
			</div>
			<section aria-labelledby="zerar" className="flex flex-col gap-3">
				<h2 className="text-muted-foreground" id="zerar">
					{copy.resetTitle}
				</h2>
				<p className="max-w-[520px] text-muted-foreground text-sm">
					{copy.resetNote}
				</p>
				<div>
					<HoldToConfirm
						done={copy.resetDone}
						label={copy.resetLabel}
						onConfirm={reset}
					/>
				</div>
			</section>
		</>
	);
}
