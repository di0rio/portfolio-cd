"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/** Copia o e-mail: muita gente não tem cliente de e-mail configurado e o `mailto:` não abre nada. */
export function CopyEmail({
	email,
	label,
	done,
	className,
}: {
	email: string;
	label: string;
	done: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	return (
		<>
			<Button
				aria-label={copied ? done : label}
				className={className}
				data-track="email_copy"
				onClick={async () => {
					try {
						await navigator.clipboard.writeText(email);
					} catch {
						return; // sem permissão de área de transferência: não finge que copiou
					}
					setCopied(true);
					clearTimeout(timer.current);
					timer.current = setTimeout(() => setCopied(false), 1500);
				}}
				size="icon-sm"
				title={label}
				variant="outline"
			>
				{copied ? (
					<CheckIcon aria-hidden="true" className="text-brand-foreground" />
				) : (
					<CopyIcon aria-hidden="true" />
				)}
			</Button>
			<span aria-live="polite" className="sr-only">
				{copied ? done : ""}
			</span>
		</>
	);
}
