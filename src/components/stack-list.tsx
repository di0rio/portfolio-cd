import { cn } from "@/lib/utils";

/** Tecnologias de um projeto ou emprego, como chips. No /cv a stack sai em texto corrido. */
export function StackList({
	items,
	label,
	className,
}: {
	items: readonly string[];
	label: string;
	className?: string;
}) {
	return (
		<ul aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
			{items.map((item) => (
				<li
					className="rounded-full border px-2 py-0.5 font-mono text-[11px] text-muted-foreground leading-4"
					key={item}
				>
					{item}
				</li>
			))}
		</ul>
	);
}
