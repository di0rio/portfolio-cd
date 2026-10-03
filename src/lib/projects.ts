import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Locale } from "@/i18n/generated";

export type Project = {
  slug: string;
  name: string;
  /** Chave da descrição curta da home (`t.app.projects`) e do estudo de caso (`t.app.projetos`). */
  key: "cdui" | "converter" | "cdai" | "sentinel";
  live?: string;
  repo?: string;
};

// Projetos com estudo de caso em /projetos/[slug]. A copy fica em `src/app/projetos/t.ts`.
export const projects: readonly Project[] = [
  { slug: "cd-ui", name: "cd/ui", key: "cdui", live: "https://cd-ui.vercel.app", repo: "https://github.com/di0rio/cd-ui" },
  { slug: "converter-hub", name: "converter-hub", key: "converter", live: "https://convert-hub-web.vercel.app", repo: "https://github.com/di0rio/Converter-Hub" },
  { slug: "cd-ai", name: "cd-ai", key: "cdai", repo: "https://github.com/di0rio/cd-ai" },
  { slug: "sentinel-forge", name: "sentinel-forge", key: "sentinel", repo: "https://github.com/di0rio/sentinel-forge" },
];

const has = (file: string) => existsSync(join(process.cwd(), "public", "projects", file));

/** Mídia opcional (checada no build): print `<slug>.webp` em 2x e, se houver, vídeo `<slug>.mp4`. */
export function projectImage(slug: string) {
  if (!has(`${slug}.webp`)) return undefined;
  return { src: `/projects/${slug}.webp`, video: has(`${slug}.mp4`) ? `/projects/${slug}.mp4` : undefined };
}

/** Corpo do estudo de caso em `content/projetos/<slug>.<locale>.md`; sem a versão do idioma, cai pro português. */
export async function projectArticle(slug: string, locale: Locale) {
  for (const l of [locale, "pt"]) {
    try {
      return await readFile(join(process.cwd(), "content", "projetos", `${slug}.${l}.md`), "utf8");
    } catch {}
  }
  return undefined;
}
