// Dados pessoais num lugar só. Os textos traduzidos ficam nos `t.ts`.
export const site = {
	name: "Cauã Diório",
	shortName: "cauã",
	github: "di0rio",
	linkedin: "cauã-diório",
	email: "caua.diorio29@gmail.com",
	location: { city: "Jaú", region: "SP", country: "BR" },
	company: {
		name: "Loopscape",
		product: "Loopvet",
		url: "https://github.com/loopscape",
	},
	// Tecnologias principais, em ordem de importância. Vazio = a seção não aparece (home e /cv).
	stack: ["Node.js", "TypeScript", "JavaScript", "Vite", "Next.js"],
	// Na Vercel usa o domínio de produção do projeto; local, o dev server.
	url: process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: "http://localhost:3000",
	// Repositório público com algum desses tópicos vira post no blog.
	blogTopics: ["portfolio", "blog"],
	// Repositório público de notas: cada pasta de `posts/` vira um post no blog.
	notes: "notes",
};
