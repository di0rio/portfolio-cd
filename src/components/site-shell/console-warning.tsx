"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/generated";

const psst: Record<Locale, string> = {
	pt: "psst: tenta ↑ ↑ ↓ ↓ ← → ← → B A em qualquer página.",
	en: "psst: try ↑ ↑ ↓ ↓ ← → ← → B A on any page.",
};

// O que eu curto fora do código: fica só aqui, pra quem abriu o DevTools.
const likes: Record<Locale, string> = {
	pt: "fora do código: Scissor Seven, Castle Crashers, Primeira Mensagem (Jotapê) e Daniel Caesar.",
	en: "outside of code: Scissor Seven, Castle Crashers, Primeira Mensagem (Jotapê) and Daniel Caesar.",
};

// Uma vez por carregamento de página: StrictMode e remontagens não repetem.
let printed = false;

// Aviso de self-XSS no console, só em produção. `compiler.removeConsole` (next.config.ts) apaga todo `console.*`
// do código do app, então a mensagem sai por um alias (`globalThis.console`), que o transform não reconhece.
export function ConsoleWarning({ locale }: { locale: Locale }) {
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" || printed) return;
		printed = true;
		const c = globalThis.console;
		c.log(
			"%cnananinão",
			"background:#1c1c1c;color:#ffd23f;font:700 48px/1.3 sans-serif;padding:8px 16px;border-radius:8px",
		);
		c.log(
			"%cesse console é pra devs. se alguém pediu pra você colar algo aqui, é golpe.",
			"font:500 14px/1.5 sans-serif",
		);
		c.log(`%c${psst[locale]}`, "color:#888;font:12px/1.5 sans-serif");
		c.log(`%c${likes[locale]}`, "color:#888;font:12px/1.5 sans-serif");
	}, [locale]);

	return null;
}
