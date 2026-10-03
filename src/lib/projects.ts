import { existsSync } from "node:fs";
import { join } from "node:path";

export type Project = {
  slug: string;
  name: string;
  /** Chave da descrição curta da home (`t.app.projects`) e do estudo de caso (`t.app.projetos`). */
  key: "agendavet" | "cdui" | "converter" | "cdai";
  live?: string;
  repo?: string;
};

// Projetos com estudo de caso em /projetos/[slug]. A copy fica em `src/app/projetos/t.ts`.
export const projects: readonly Project[] = [
  { slug: "agenda-vet", name: "agenda-vet", key: "agendavet" }, // TODO: repo e deploy
  { slug: "cd-ui", name: "cd/ui", key: "cdui", live: "https://cd-ui.vercel.app", repo: "https://github.com/di0rio/cd-ui" },
  { slug: "converter-hub", name: "converter-hub", key: "converter", live: "https://convert-hub-web.vercel.app", repo: "https://github.com/di0rio/Converter-Hub" },
  { slug: "cd-ai", name: "cd-ai", key: "cdai", repo: "https://github.com/di0rio/cd-ai" },
];

/** Captura de tela opcional: só existe se `public/projects/<slug>.png` estiver no disco (checado no build). */
export function projectImage(slug: string) {
  return existsSync(join(process.cwd(), "public", "projects", `${slug}.png`)) ? `/projects/${slug}.png` : undefined;
}
