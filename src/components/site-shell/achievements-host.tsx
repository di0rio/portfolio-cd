"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Achievement } from "@/components/achievement";
import { stripLocale } from "@/i18n/path";
import {
	type AchievementId,
	onUnlock,
	unlock,
	visit,
} from "@/lib/achievements";

/**
 * Único lugar que mostra o aviso de conquista: qualquer componente chama `unlock(id)` e, só na
 * primeira vez, o aviso aparece aqui. Se duas saem juntas, entram em fila. Também detecta as
 * conquistas que dependem só da rota (lab, todas as páginas).
 */
export function AchievementsHost({
	label,
	names,
}: {
	label: string;
	names: Record<string, string>;
}) {
	const [queue, setQueue] = useState<AchievementId[]>([]);
	const pathname = usePathname();

	useEffect(() => onUnlock((id) => setQueue((q) => [...q, id])), []);

	useEffect(() => {
		const section = stripLocale(pathname).split("/")[1];
		if (section === "lab") unlock("cobaia");
		visit(section);
	}, [pathname]);

	const current = queue[0];
	return (
		<div
			className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 print:hidden"
			role="status"
		>
			{current && (
				<Achievement
					key={`${current}-${queue.length}`}
					label={label}
					name={names[current] ?? current}
					onDone={() => setQueue((q) => q.slice(1))}
				/>
			)}
		</div>
	);
}
