// Dados pessoais num lugar só. Os textos traduzidos ficam nos `t.ts`.
export const site = {
	name: "Cauã Diório",
	shortName: "cauã",
	github: "di0rio",
	linkedin: "cauã-diório",
	instagram: "cauadiorio",
	email: "caua.diorio29@gmail.com",
	location: { city: "Jaú", region: "SP", country: "BR" },
	company: {
		name: "Loopscape",
		product: "Loopvet",
		url: "https://github.com/loopscape",
		// O que eu uso no trabalho (CMS, importador e hub), mostrado na experiência.
		stack: [
			"Next.js",
			"React",
			"TypeScript",
			"Elysia",
			"Drizzle",
			"PostgreSQL",
			"Better Auth",
			"Tiptap",
			"S3",
			"Cloudflare Workers + KV",
		],
	},
	// Tecnologias principais, em ordem de importância. Vazio = a seção não aparece (home e /cv).
	stack: [
		"TypeScript",
		"React",
		"Next.js",
		"Tailwind CSS",
		"Node.js",
		"Bun",
		"PostgreSQL",
		"Drizzle",
	],
	// Estudando: aparece como "estudando: …" logo abaixo da stack (home e /cv).
	learning: ["Go", "Rust"],
	// Na Vercel usa o domínio de produção do projeto; local, o dev server.
	url: process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: "http://localhost:3000",
	// Repositório público com algum desses tópicos vira post no blog.
	blogTopics: ["portfolio", "blog"],
	// Repositório público de notas: cada pasta de `posts/` vira um post no blog.
	notes: "notes",
};

// Ordem das entregas na seção de experiência (home e /cv). Os textos ficam em `app/t.ts`.
export const highlights = ["cms", "security", "importer"] as const;
