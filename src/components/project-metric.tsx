/** Um número que resume o projeto, tirado do estudo de caso. Vem logo abaixo da descrição curta. */
export function ProjectMetric({ children }: { children: string }) {
	return (
		<p className="mt-1 flex gap-1.5 font-mono text-[13px] text-foreground/80 tabular-nums">
			<span aria-hidden="true" className="text-brand-foreground">
				↳
			</span>
			{children}
		</p>
	);
}
