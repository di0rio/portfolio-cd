"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/generated";
import type { TerminalProject } from "./terminal-panel";

// O painel (e as traduções que ele carrega) só baixa na primeira abertura.
const TerminalPanel = dynamic(
	() => import("./terminal-panel").then((m) => m.TerminalPanel),
	{ ssr: false },
);

type Props = {
	locale: Locale;
	projects: TerminalProject[];
	posts: { slug: string }[];
};

// Trocar de idioma remonta o layout: o módulo guarda se o painel estava aberto/carregado.
const remembered = { open: false, loaded: false };

/** Ctrl+` / Ctrl+J (⌘J no Mac). O `code` cobre teclados em que `key` não vem como "`" (ABNT2). */
function isShortcut(e: KeyboardEvent) {
	if (e.altKey || e.shiftKey || e.isComposing) return false;
	if (e.ctrlKey && !e.metaKey && (e.code === "Backquote" || e.key === "`"))
		return true;
	return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j";
}

/**
 * Só o ouvinte de teclado vai no carregamento inicial. Ao abrir pela primeira vez, carrega o painel.
 * Terminal e paleta (Ctrl+K) nunca ficam abertos juntos: cada um avisa o outro por evento na `window`.
 */
export function TerminalHost(props: Props) {
	const [open, setOpen] = useState(remembered.open);
	const [loaded, setLoaded] = useState(remembered.loaded);
	// Atalho de teclado (repetido o dia todo) abre/fecha na hora; ponteiro (paleta, botão) usa a gaveta animada.
	const [instant, setInstant] = useState(false);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (!isShortcut(e)) return;
			e.preventDefault(); // Ctrl+J abre os downloads no navegador
			if (e.repeat) return;
			setInstant(true);
			setOpen((o) => !o);
		}
		const toggle = () => {
			setInstant(false);
			setOpen((o) => !o);
		};
		const close = () => {
			setInstant(false);
			setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("cd:terminal-toggle", toggle);
		window.addEventListener("cd:palette-open", close);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("cd:terminal-toggle", toggle);
			window.removeEventListener("cd:palette-open", close);
		};
	}, []);

	useEffect(() => {
		remembered.open = open;
		if (!open) return;
		remembered.loaded = true;
		window.dispatchEvent(new Event("cd:terminal-open"));
	}, [open]);

	if (open && !loaded) setLoaded(true); // primeira abertura: baixa o painel
	if (!loaded) return null;
	return (
		<TerminalPanel
			{...props}
			instant={instant}
			onClose={(now = false) => {
				setInstant(now);
				setOpen(false);
			}}
			open={open}
		/>
	);
}
