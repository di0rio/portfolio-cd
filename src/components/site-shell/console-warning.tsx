"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/generated";

const psst: Record<Locale, string> = {
	pt: "psst: tenta ↑ ↑ ↓ ↓ ← → ← → B A em qualquer página.",
	en: "psst: try ↑ ↑ ↓ ↓ ← → ← → B A on any page.",
};

// O "cd/" do header em letras de bloco, pra quem abriu o DevTools.
const logo = [
	" ██████╗██████╗     ██╗",
	"██╔════╝██╔══██╗   ██╔╝",
	"██║     ██║  ██║  ██╔╝ ",
	"██║     ██║  ██║ ██╔╝  ",
	"╚██████╗██████╔╝██╔╝   ",
	" ╚═════╝╚═════╝ ╚═╝    ",
].join("\n");

// Uma vez por carregamento de página: StrictMode e remontagens não repetem.
let printed = false;

// Aviso de self-XSS no console, só em produção. `compiler.removeConsole` (next.config.ts) apaga todo `console.*`
// do código do app, então a mensagem sai por um alias (`globalThis.console`), que o transform não reconhece.
export function ConsoleWarning({ locale }: { locale: Locale }) {
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" || printed) return;
		printed = true;
		const c = globalThis.console;
		// Logo e aviso na mesma fonte e cor, como saída de terminal; a dica fica apagada embaixo.
		const mono = "font:12px/1.15 ui-monospace,Menlo,Consolas,monospace";
		c.log(`%c${logo}`, `color:#ffd23f;${mono}`);
		c.log(
			"%c> esse console é pra devs. se alguém pediu pra você colar algo aqui, é golpe.",
			`color:#ffd23f;${mono}`,
		);
		// A dica fica minúscula e apagada de propósito: é pra achar, não pra ler de cara.
		c.log(
			`%c${psst[locale]}`,
			"color:#666;font:5px/1 ui-monospace,Menlo,Consolas,monospace",
		);
	}, [locale]);

	return null;
}
