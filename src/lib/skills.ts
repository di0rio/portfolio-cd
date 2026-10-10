// Skills de agente de IA do repositório público. A copy fica em `src/app/skills/t.ts`.
export const skillsRepo = "https://github.com/di0rio/cd-skills";
export const skillsInstall = "npx skills add di0rio/cd-skills";

export type Skill = {
	slug: "clean-code-ai" | "portfolio-demo" | "humanizar";
	/** Slug do post do blog que conta a história da skill. */
	post: string;
};

export const skills: readonly Skill[] = [
	{ slug: "clean-code-ai", post: "skill-de-codigo-pragmatico" },
	{ slug: "portfolio-demo", post: "videos-de-demo-do-portfolio" },
	{ slug: "humanizar", post: "skill-humanizar" },
];

export const skillUrl = (slug: Skill["slug"]) =>
	`${skillsRepo}/tree/main/skills/${slug}`;

export const skillRawUrl = (slug: Skill["slug"]) =>
	`https://raw.githubusercontent.com/di0rio/cd-skills/main/skills/${slug}/SKILL.md`;

export const benchUrl = `${skillsRepo}/blob/main/bench/clean-code-ai/RESULTS.md`;
