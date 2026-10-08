import type { ReactNode } from "react";
import { CodeCopy } from "@/components/code-copy";
import { cn } from "@/lib/utils";

/** Texto entre crases vira código mono; o resto passa direto. Mantém a copy num string só por idioma. */
export function Rich({ text }: { text: string }) {
	return text.split("`").map((part, i) =>
		i % 2 ? (
			<code
				className="rounded-md bg-accent px-1.5 font-mono text-foreground text-sm"
				key={part}
			>
				{part}
			</code>
		) : (
			part
		),
	);
}

/** Fragmento de terminal: `~ $ comando` por linha, com um botão que copia tudo sem os prompts. */
export function CodeBlock({
	lines,
	copy,
}: {
	lines: readonly string[];
	copy: { label: string; done: string };
}) {
	return (
		<div className="flex items-start gap-2 rounded-xl border bg-card py-1 pr-1 pl-4">
			<pre className="min-w-0 flex-1 overflow-x-auto py-1 font-mono text-sm leading-relaxed">
				<code className="block w-max min-w-full">
					{lines.map((line) => (
						<span className="block" key={line}>
							<span aria-hidden="true" className="select-none">
								<span className="text-brand-foreground">~</span>{" "}
								<span className="text-muted-foreground">$</span>{" "}
							</span>
							{line}
						</span>
					))}
				</code>
			</pre>
			<CodeCopy done={copy.done} label={copy.label} text={lines.join("\n")} />
		</div>
	);
}

/** Lista numerada de passos curtos; os números são só decoração (a `<ol>` já conta). */
export function Steps({ items }: { items: readonly string[] }) {
	return (
		<ol className="flex flex-col gap-3">
			{items.map((item, i) => (
				<li className="flex gap-4" key={item}>
					<span
						aria-hidden="true"
						className="w-5 shrink-0 text-muted-foreground tabular-nums"
					>
						{String(i + 1).padStart(2, "0")}
					</span>
					<span className="text-pretty">{item}</span>
				</li>
			))}
		</ol>
	);
}

/** Números grandes (até o tamanho de título) com o rótulo embaixo; `strong` põe o destaque em Ink. */
export function Stats({
	items,
}: {
	items: readonly { value: string; label: string; strong?: boolean }[];
}) {
	return (
		<ul className="grid grid-cols-3 gap-4">
			{items.map(({ value, label, strong }) => (
				<li key={label}>
					<span
						className={cn(
							"block font-bold font-heading text-[22px] leading-tight tabular-nums",
							!strong && "text-muted-foreground",
						)}
					>
						{value}
					</span>
					<span className="text-muted-foreground text-sm">{label}</span>
				</li>
			))}
		</ul>
	);
}

/** Termo (mono) e descrição lado a lado. Sem cartão, só duas colunas. */
export function Definitions({
	items,
}: {
	items: readonly { term: string; description: ReactNode }[];
}) {
	return (
		<dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 items-baseline">
			{items.map(({ term, description }) => (
				<div className="contents" key={term}>
					<dt className="font-mono text-sm">{term}</dt>
					<dd className="text-pretty text-muted-foreground">{description}</dd>
				</div>
			))}
		</dl>
	);
}
