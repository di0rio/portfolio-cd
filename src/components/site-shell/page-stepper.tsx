"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";

type Step = { href: string; title: string; label: string };

type Props = {
	label: string;
	/** Posição atual, de 1 a `total`. */
	current: number;
	total: number;
	prev?: Step;
	next?: Step;
};

const pad = (n: number) => String(n).padStart(2, "0");

function StepButton({
	step,
	children,
}: {
	step?: Step;
	children: React.ReactNode;
}) {
	if (!step)
		return (
			<Button disabled size="icon-sm" type="button" variant="ghost">
				{children}
			</Button>
		);
	return (
		<Tooltip>
			{/* aria no Trigger; o `render` só troca a tag por um <Link> de verdade (o href e a navegação são dele). */}
			<TooltipTrigger
				aria-label={step.label}
				render={
					<Link
						className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
						href={step.href}
					/>
				}
			>
				{children}
			</TooltipTrigger>
			<TooltipPopup>{step.title}</TooltipPopup>
		</Tooltip>
	);
}

/**
 * Passo anterior/próximo no topo da página, com contador e atalho ←/→ (fora de campos de texto,
 * sem modificadores e sem diálogo modal aberto, como a paleta). Nas pontas o botão fica desabilitado
 * pra o layout não pular.
 */
export function PageStepper({ label, current, total, prev, next }: Props) {
	const router = useRouter();

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
			if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
			if (e.defaultPrevented) return;
			if (
				e.target instanceof Element &&
				e.target.closest("input, textarea, select, [contenteditable]")
			)
				return;
			if (document.querySelector('[role="dialog"]:not([data-terminal])'))
				return;
			const step = e.key === "ArrowLeft" ? prev : next;
			if (step) router.push(step.href);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [prev, next, router]);

	return (
		<nav aria-label={label} className="flex shrink-0 items-center gap-1">
			<StepButton step={prev}>
				<ChevronLeftIcon aria-hidden="true" />
			</StepButton>
			<span className="font-mono text-muted-foreground text-xs tabular-nums">
				{pad(current)} / {pad(total)}
			</span>
			<StepButton step={next}>
				<ChevronRightIcon aria-hidden="true" />
			</StepButton>
		</nav>
	);
}
