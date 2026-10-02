// Dados pessoais num lugar só. Os textos traduzidos ficam nos `t.ts`.
export const site = {
  name: "Cauã Diorio",
  shortName: "cauã",
  github: "di0rio",
  linkedin: "", // TODO: usuário do LinkedIn
  email: "", // TODO: e-mail de contato
  cv: "", // TODO: caminho do PDF em /public, ex.: "/cv.pdf"
  url: "https://portfolio-cd.vercel.app", // TODO: domínio final
  // Repositório público com algum desses tópicos vira post no blog.
  blogTopics: ["portfolio", "blog"],
} as const;
