// Mesma regra do GitHub (minúsculas, sem pontuação, espaço vira hífen), pra links `#secao` de README continuarem valendo.
export const slugify = (text: string) =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}\s-]/gu, "")
		.replace(/\s+/g, "-");
