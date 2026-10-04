"use client";

import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import type { Props } from "./command-palette-dialog";

// O diálogo (base-ui Dialog + Autocomplete, ~50 KB gzip) só baixa na primeira abertura.
const loadDialog = () =>
	import("./command-palette-dialog").then((m) => m.CommandPaletteDialog);
const CommandPaletteDialog = dynamic(loadDialog, { ssr: false });

const noop = () => () => {};

/** Só no cliente dá pra saber a plataforma; no servidor e na hidratação vale Ctrl. */
export function useIsMac() {
	return useSyncExternalStore(
		noop,
		() => /Mac|iPhone|iPad/.test(navigator.platform),
		() => false,
	);
}

/**
 * Paleta de comandos global (⌘K / Ctrl+K): páginas, posts e ações num campo só. O gatilho fica no
 * header; o atalho vale na página inteira. O campo é um `input`, então o easter egg do `cd ..` ignora o que se digita aqui.
 * Aqui só ficam o botão e os atalhos; o diálogo carrega na primeira abertura (ou ao passar o mouse/foco no botão).
 */
export function CommandPalette(props: Props) {
	const [open, setOpen] = useState(false);
	const [loaded, setLoaded] = useState(false); // depois da 1ª abertura o diálogo fica montado (animação de saída)
	const mac = useIsMac();
	if (open && !loaded) setLoaded(true); // ajuste de estado na renderização (padrão do React), sem efeito

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (
				e.key.toLowerCase() !== "k" ||
				!(e.metaKey || e.ctrlKey) ||
				e.altKey ||
				e.shiftKey
			)
				return;
			e.preventDefault(); // o Ctrl+K do navegador foca a barra de busca
			if (!e.repeat) setOpen((o) => !o);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	// Paleta e terminal (Ctrl+J) nunca ficam abertos juntos: quem abre avisa o outro.
	useEffect(() => {
		const close = () => setOpen(false);
		window.addEventListener("cd:terminal-open", close);
		return () => window.removeEventListener("cd:terminal-open", close);
	}, []);
	useEffect(() => {
		if (open) window.dispatchEvent(new Event("cd:palette-open"));
	}, [open]);

	return (
		<>
			<Tooltip>
				{/* Handlers no Trigger, não no Button do `render`: no build de produção o onClick do elemento
				    de `render` não disparava (Base UI 1.8). */}
				<TooltipTrigger
					aria-haspopup="dialog"
					aria-keyshortcuts="Control+K Meta+K"
					aria-label={props.copy.open}
					onClick={() => setOpen(true)}
					onFocus={loadDialog}
					onPointerEnter={loadDialog}
					render={
						<Button
							className="max-sm:size-8 max-sm:p-0 sm:gap-2 sm:pr-2 sm:pl-2.5"
							size="sm"
							type="button"
							variant="outline"
						/>
					}
				>
					<SearchIcon aria-hidden="true" />
					<Kbd aria-hidden="true" className="max-sm:hidden">
						{mac ? "⌘K" : "Ctrl K"}
					</Kbd>
				</TooltipTrigger>
				<TooltipPopup className="flex items-center gap-2">
					{props.copy.open}
					<Kbd aria-hidden="true">{mac ? "⌘K" : "Ctrl K"}</Kbd>
				</TooltipPopup>
			</Tooltip>
			{loaded && (
				<CommandPaletteDialog {...props} onOpenChange={setOpen} open={open} />
			)}
		</>
	);
}
