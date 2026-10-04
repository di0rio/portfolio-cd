"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const icon =
	"absolute inset-0 m-auto size-3.5 transition-[opacity,filter] duration-200 ease-out motion-reduce:transition-opacity";
const shown = "opacity-100 blur-0";
const hidden = "opacity-0 blur-[2px]";

/** Botão de copiar do bloco de código: os dois ícones trocam por opacidade e um desfoque curto. */
export function CodeCopy({
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
		<>
			<button
				aria-label={copied ? done : label}
				className="relative size-7 shrink-0 rounded-md text-muted-foreground outline-none transition-[color,background-color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97] motion-safe:active:duration-[160ms]"
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
		</>
	);
}
