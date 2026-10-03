// Dados pessoais num lugar só. Os textos traduzidos ficam nos `t.ts`.
export const site = {
  name: "Cauã Diorio",
  shortName: "cauã",
  github: "di0rio",
  linkedin: "cauã-diório",
  email: "", // TODO: e-mail de contato
  location: { city: "Jaú", region: "SP", country: "BR" },
  company: { name: "Loopscape", url: "https://github.com/loopscape" },
  // Tecnologias principais, em ordem de importância. Vazio = a seção não aparece (home e /cv).
  stack: [] as string[], // TODO: ex.: ["TypeScript", "React", "Next.js", "Tailwind CSS"]
  // Na Vercel usa o domínio de produção do projeto; local, o dev server. TODO: domínio final
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000",
  // Repositório público com algum desses tópicos vira post no blog.
  blogTopics: ["portfolio", "blog"],
  // Repositório público de notas: cada pasta de `posts/` vira um post no blog.
  notes: "notes",
};
