import type { ReactNode } from "react";

/** Seção: rótulo discreto em cima, conteúdo com respiro. */
export function Section({
	id,
	title,
	action,
	children,
}: {
	id: string;
	title: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section aria-labelledby={id} className="scroll-mt-8">
			<div className="mb-5 flex items-baseline justify-between gap-4">
				<h2 className="text-muted-foreground" id={id}>
					{title}
				</h2>
				{action}
			</div>
			{children}
		</section>
	);
}
