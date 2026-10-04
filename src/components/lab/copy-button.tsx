"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const icon =
	"absolute inset-0 m-auto size-4 transition-[opacity,transform,filter] duration-200 ease-out motion-reduce:transition-opacity";
const shown = "scale-100 opacity-100 blur-0";
const hidden = "scale-50 opacity-0 blur-[2px]";

/** Copia o texto e troca o ícone com um desfoque curto, que esconde a sobreposição dos dois ícones. */
export function CopyButton({
	text,
	label,
	done,
}: {
	text: string;
	label: string;
	done: string;
}) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	return (
		<div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-background py-1.5 pr-1.5 pl-3">
			<code className="min-w-0 flex-1 truncate font-mono text-sm">{text}</code>
			<button
				aria-label={copied ? done : label}
				className="relative size-8 shrink-0 rounded-md text-muted-foreground outline-none transition-[color,background-color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.96]"
				onClick={async () => {
					try {
						await navigator.clipboard.writeText(text);
					} catch {
						return; // sem permissão de área de transferência: não finge que copiou
					}
					setCopied(true);
					clearTimeout(timer.current);
					timer.current = setTimeout(() => setCopied(false), 1500);
				}}
				type="button"
			>
				<CopyIcon
					aria-hidden="true"
					className={`${icon} ${copied ? hidden : shown}`}
				/>
				<CheckIcon
					aria-hidden="true"
					className={`${icon} text-brand-foreground ${copied ? shown : hidden}`}
				/>
			</button>
			<span aria-live="polite" className="sr-only">
				{copied ? done : ""}
			</span>
		</div>
	);
}
