import type { Metadata } from "next";
import { locale as localeParam } from "next/root-params";
import { type Locale, translations } from "./generated";
import { localePath } from "./path";

export const locales = Object.keys(translations) as Locale[];

/**
 * Traduções do idioma da URL (`/` = pt, `/en` = en), pra usar em qualquer Server Component.
 * O `[locale]` é o segmento raiz, então dá pra ler sem passar `params` adiante.
 */
export async function getT() {
	const value = await localeParam();
	const locale: Locale = locales.includes(value as Locale)
		? (value as Locale)
		: "pt";
	return {
		locale,
		t: translations[locale],
		dateLocale: locale === "pt" ? "pt-BR" : "en-US",
	};
}

/** Canonical + hreflang de uma página, pro Google ligar as duas versões. */
export function alternates(
	locale: Locale,
	path: string,
): Metadata["alternates"] {
	return {
		canonical: localePath(locale, path),
		languages: {
			"pt-BR": localePath("pt", path),
			en: localePath("en", path),
			"x-default": localePath("pt", path),
		},
	};
}
