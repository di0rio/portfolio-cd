import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Locale } from "@/i18n/generated";

export type Project = {
	slug: string;
	name: string;
	/** Chave da descrição curta da home (`t.app.projects`) e do estudo de caso (`t.app.projetos`). */
	key: "cdui" | "converter" | "cdai" | "sentinel" | "hub" | "fin";
	/** Tecnologias principais: chips na home e no estudo de caso, texto corrido no /cv. */
	stack: readonly string[];
	live?: string;
	repo?: string;
};

// Projetos com estudo de caso em /projetos/[slug]. A copy fica em `src/app/projetos/t.ts`.
export const projects: readonly Project[] = [
	{
		slug: "cd-ui",
		name: "cd/ui",
		key: "cdui",
		stack: [
			"React",
			"TypeScript",
			"Base UI",
			"Tailwind v4",
			"shadcn registry",
			"Zod",
		],
		live: "https://cd-ui.vercel.app",
		repo: "https://github.com/di0rio/cd-ui",
	},
	{
		slug: "converter-hub",
		name: "converter-hub",
		key: "converter",
		stack: ["TypeScript", "SQLite (WebAssembly)", "Vitest"],
		live: "https://convert-hub-web.vercel.app",
		repo: "https://github.com/di0rio/Converter-Hub",
	},
	{
		slug: "cd-ai",
		name: "cd-ai",
		key: "cdai",
		stack: ["Rust", "Tauri", "Ollama", "Next.js"],
		repo: "https://github.com/di0rio/cd-ai",
	},
	{
		slug: "sentinel-forge",
		name: "sentinel-forge",
		key: "sentinel",
		stack: ["Go", "YAML"],
		repo: "https://github.com/di0rio/sentinel-forge",
	},
	// Repositórios privados: sem live nem repo. O hub é projeto pessoal em cima da API da Loopvet.
	{
		slug: "loopvet-hub",
		name: "loopvet hub",
		key: "hub",
		stack: ["Bun", "Next.js", "TypeScript", "Base UI", "Playwright"],
	},
	{
		slug: "fin",
		name: "fin",
		key: "fin",
		stack: [
			"Next.js",
			"TypeScript",
			"Open Finance (Pluggy)",
			"Vercel Cron",
			"Discord",
		],
	},
];

const has = (file: string) =>
	existsSync(join(process.cwd(), "public", "projects", file));

/**
 * Mídia opcional (checada no build): print `<slug>.webp` em 2x e, se houver, vídeo `<slug>.mp4`.
 * Com vídeo, o print vira `<slug>-poster.webp` (1º frame do vídeo, com a mesma moldura), pra troca
 * do print pelo vídeo não dar salto de enquadramento nem de cor.
 * As gravações são no tema escuro; a versão do tema claro é a mesma coisa com `-light` no nome
 * (`<slug>-light.webp`, `<slug>-light.mp4`, `<slug>-light-poster.webp`) e entra quando existir.
 */
function media(name: string) {
	if (!has(`${name}.webp`)) return undefined;
	const video = has(`${name}.mp4`) ? `/projects/${name}.mp4` : undefined;
	const poster = video && has(`${name}-poster.webp`);
	return {
		src: `/projects/${name}${poster ? "-poster" : ""}.webp`,
		video,
	};
}

export function projectImage(slug: string) {
	const dark = media(slug);
	return dark && { ...dark, light: media(`${slug}-light`) };
}

/** Corpo do estudo de caso em `content/projetos/<slug>.<locale>.md`; sem a versão do idioma, cai pro português. */
export async function projectArticle(slug: string, locale: Locale) {
	for (const l of [locale, "pt"]) {
		try {
			return await readFile(
				join(process.cwd(), "content", "projetos", `${slug}.${l}.md`),
				"utf8",
			);
		} catch {}
	}
	return undefined;
}
