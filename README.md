# portfolio-cd

Portfólio pessoal do Cauã Diorio ([@di0rio](https://github.com/di0rio)), desenvolvedor front-end. Bilíngue (pt/en), tema claro/escuro e conteúdo que se atualiza sozinho a partir do GitHub.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) + [coss ui](https://coss.com/ui) (Base UI)
- [better-intl](https://www.npmjs.com/package/better-intl) para pt/en, [next-themes](https://github.com/pacocoursey/next-themes) para o tema
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Bun](https://bun.sh) como gerenciador de pacotes

## Rodando

```bash
bun install
bun dev
```

Abre em [http://localhost:3000](http://localhost:3000). Outros scripts: `bun run build`, `bun start`, `bun run lint`.

### Variáveis de ambiente

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `GITHUB_TOKEN` | não | Sobe o limite da API do GitHub de 60 para 5.000 req/h e libera os repositórios **fixados** no perfil. Sem ele, a seção "em destaque" mostra os repositórios com mais estrelas. Um token clássico sem escopos (só leitura pública) basta. |

Crie um `.env.local` na raiz para rodar localmente; na Vercel, configure em *Settings → Environment Variables*.

## O que vem do GitHub

- **Gráfico de contribuições**: último ano do perfil, via [github-contributions-api](https://github.com/grubersjoe/github-contributions-api).
- **Em destaque**: repositórios fixados no perfil (com token) ou os com mais estrelas (sem token).
- **Blog**: todo repositório público com o tópico `portfolio` ou `blog` vira post em `/blog/<repo>`, com o README como corpo.
  - `README.md` é a versão em português; `README.en.md`, a em inglês. Sem a versão em inglês, o post mostra o português com um aviso.
  - Imagens e links relativos do README apontam para o GitHub automaticamente.
- **Avatar**: a foto do perfil do GitHub.

Tudo é revalidado a cada hora (contribuições a cada 6 h).

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Nome, GitHub, LinkedIn, e-mail, CV, domínio | `src/lib/site.ts` |
| Textos da home (bio, projetos, experiência) | `src/app/t.ts` |
| Textos do blog | `src/app/blog/t.ts` |
| Header, sidebar, rodapé, tema, idioma | `src/components/site-shell/` |
| Cores, fontes, animações | `src/app/globals.css` |
| Imagem de prévia do link (OG) | `src/app/opengraph-image.tsx` |

Cada `t.ts` tem as duas línguas lado a lado (`{ pt, en }`). O `src/i18n/generated.ts` é gerado sozinho no `dev`/`build`; não edite à mão. Faltar uma língua quebra o build de propósito.

## Design

- [`PRODUCT.md`](PRODUCT.md): público, objetivo e princípios do site.
- [`DESIGN.md`](DESIGN.md): sistema visual ("O Terminal de Casa"): cores, tipografia, layout, componentes e regras.

## Easter egg

Digita `cd ..` (ou `cd ~`) em qualquer página pra voltar pro começo, ou `cd blog` pra abrir o blog.
