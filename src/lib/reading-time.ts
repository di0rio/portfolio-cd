/** Minutos de leitura (~200 palavras/min), no mínimo 1, formatado como "5 min" no idioma da página. */
export function readingTime(markdown: string, locale: string) {
	const words = markdown.trim().split(/\s+/).length;
	return new Intl.NumberFormat(locale, {
		style: "unit",
		unit: "minute",
		unitDisplay: "short",
	}).format(Math.max(1, Math.ceil(words / 200)));
}
