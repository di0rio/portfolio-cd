# portfolio-cd

Portfólio pessoal do Cauã Diório ([@di0rio](https://github.com/di0rio)), desenvolvedor front-end. Bilíngue (pt/en), tema claro/escuro e conteúdo que se atualiza sozinho a partir do GitHub.

## Como funciona

O site é quase todo renderizado no servidor (React Server Components). Cada página busca o que precisa, monta o HTML e só as partes interativas (tema, paleta de comandos, formulário, demos do `/lab`) rodam no navegador.

O caminho de uma visita:

1. **Idioma**: o `src/proxy.ts` olha a URL. `/blog` vira `/pt/blog` por dentro (a URL não muda); `/en/blog` segue direto. Detalhes em [Idiomas e URLs](#idiomas-e-urls).
2. **Casca**: `src/app/[locale]/layout.tsx` monta o que é comum a todas as páginas: header com navegação, rodapé, tema, paleta de comandos e analytics.
3. **Dados**: a página junta três fontes:
   - **GitHub** (`src/lib/github.ts`): posts do blog, repositórios em destaque, contribuições e commits deste site. As respostas ficam em cache e são revalidadas a cada hora, então o GitHub não é chamado a cada visita.
   - **Arquivos do repositório**: a lista de projetos (`src/lib/projects.ts`), o texto dos estudos de caso (`content/projetos/`) e os prints/vídeos (`public/projects/`).
   - **Textos da interface**: os `t.ts` de cada pasta, com pt e en lado a lado.
4. **Resposta**: o HTML sai pronto do servidor. Se o GitHub falhar, as funções de `github.ts` devolvem vazio e a seção some ou mostra um aviso, sem derrubar a página.

### Páginas

| Rota | O que mostra | De onde vem |
| --- | --- | --- |
| `/` | Bio, projetos, experiência, repositórios em destaque e gráfico de contribuições | `src/app/t.ts` + GitHub |
| `/projetos`, `/projetos/<slug>` | Estudos de caso dos projetos | `src/lib/projects.ts` + `content/projetos/<slug>.<pt\|en>.md` |
| `/blog`, `/blog/<repo>` | Posts escritos como README de repositórios | GitHub (ver abaixo) |
| `/skills` | Landing das minhas skills de agente de IA (instalação, ideia, teste e níveis), com link pro repo cd-skills | `src/lib/skills.ts` + `src/app/skills/t.ts` |
| `/agora` | O que estou construindo e estudando agora, com os repositórios mexidos por último | GitHub + `src/app/agora/t.ts` |
| `/log` | Histórico de commits deste site, com heatmap e filtro | GitHub (commits do próprio repo) |
| `/lab` | Demos interativas de componentes e animações | `src/components/lab/` |
| `/cv` | Currículo pronto pra imprimir ou salvar em PDF | `src/app/cv/t.ts` |
| `/freela` | Formulário de contato que chega por e-mail | `src/app/[locale]/freela/actions.ts` (Resend) |

Todas entram no `sitemap.xml` nas duas línguas. Posts e estudos de caso geram imagem de prévia (OG) própria; o resto usa a da home.

### Projetos (estudos de caso)

Pra adicionar um projeto:

1. Inclua a entrada em `src/lib/projects.ts` (slug, nome, stack, links).
2. Escreva a descrição curta em `src/app/t.ts` e a copy do estudo de caso em `src/app/projetos/t.ts`.
3. Escreva o texto em `content/projetos/<slug>.pt.md` (e `<slug>.en.md`; sem ele, o inglês mostra o português).
4. Opcional: coloque o print `public/projects/<slug>.webp` e, se tiver, o vídeo `<slug>.mp4` + `<slug>-poster.webp`. A versão do tema claro usa o sufixo `-light`. Arquivos que não existem são ignorados no build.

### Extras do terminal

O site imita um terminal, e dá pra navegar como num:

- **Ctrl+K** (⌘K no Mac) abre a paleta de comandos com páginas, posts e ações.
- Digitar `cd blog`, `cd lab`, `cd <projeto>` ou `cd ..` em qualquer lugar da página navega; `help` ou `ls` lista os comandos. A lógica dos caminhos fica em `src/components/site-shell/shell-routes.ts`.
- Tem easter egg (Konami code) e uma mensagem no console do navegador.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) + [coss ui](https://coss.com/ui) (Base UI)
- [better-intl](https://www.npmjs.com/package/better-intl) para pt/en, [next-themes](https://github.com/pacocoursey/next-themes) para o tema
- [Vercel Analytics](https://vercel.com/docs/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights)
- [Vercel BotID](https://vercel.com/docs/botid) no formulário de contato
- [Bun](https://bun.sh) como gerenciador de pacotes

## Rodando

```bash
bun install
bun dev
```

Abre em [http://localhost:3000](http://localhost:3000). Outros scripts: `bun run build`, `bun start`, `bun run lint`, `bun run typecheck`, `bun test`.

### Variáveis de ambiente

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `GITHUB_TOKEN` | não | Sobe o limite da API do GitHub de 60 para 5.000 req/h e libera os repositórios **fixados** no perfil. Sem ele, a seção "em destaque" mostra os repositórios com mais estrelas. Um token clássico sem escopos (só leitura pública) basta. |
| `RESEND_API_KEY` | para o `/freela` | Chave do [Resend](https://resend.com), que envia o formulário de contato por e-mail. Sem ela, o formulário avisa que o envio está indisponível. |
| `CONTACT_EMAIL` | para o `/freela` | Quem recebe as mensagens. Sem domínio verificado no Resend, precisa ser o e-mail da conta Resend. |
| `CONTACT_FROM` | não | Remetente com domínio verificado. Se omitido, usa `onboarding@resend.dev`. |

Crie um `.env.local` na raiz para rodar localmente; na Vercel, configure em *Settings → Environment Variables*.

## O que vem do GitHub

- **Gráfico de contribuições**: último ano do perfil, via [github-contributions-api](https://github.com/grubersjoe/github-contributions-api).
- **Em destaque**: repositórios fixados no perfil (com token) ou os com mais estrelas (sem token).
- **Blog**: todo repositório público com o tópico `portfolio` ou `blog` vira post em `/blog/<repo>`, com o README como corpo.
  - `README.md` é a versão em português; `README.en.md`, a em inglês. Sem a versão em inglês, o post mostra o português com um aviso.
  - Imagens e links relativos do README apontam para o GitHub automaticamente.
- **Avatar**: a foto do perfil do GitHub.

Tudo é revalidado a cada hora (contribuições a cada 6 h).

O blog também sai como feed RSS: `/feed.xml` em português e `/en/feed.xml` em inglês.

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Nome, GitHub, LinkedIn, e-mail, empresa, cidade, stack, domínio | `src/lib/site.ts` |
| Currículo (`/cv`, salva em PDF pela impressão) | `src/app/[locale]/cv/page.tsx` + `src/app/cv/t.ts` |
| Páginas (home, blog, 404) | `src/app/[locale]/` |
| Textos da home (bio, projetos, experiência) | `src/app/t.ts` |
| Textos do blog | `src/app/blog/t.ts` |
| Página de skills (`/skills`: lista, links e blocos) | `src/lib/skills.ts` + `src/app/skills/t.ts` + `src/components/skills/` |
| Header (prompt e navegação), rodapé, tema, idioma | `src/components/site-shell/` |
| Cores, fontes, animações | `src/app/globals.css` |
| Imagem de prévia do link (OG) | `src/app/opengraph-image.tsx` |
| Feed RSS do blog | `src/lib/feed.ts` |
| Formulário de contato (envio, BotID, limite por IP) | `src/app/[locale]/freela/actions.ts` |

### Idiomas e URLs

Português fica na raiz (`/`, `/blog`) e inglês em `/en` (`/en`, `/en/blog`). Por dentro, todas as rotas vivem em `src/app/[locale]/`; o `src/proxy.ts` reescreve `/x` para `/pt/x` sem mudar a URL e redireciona quem digitar `/pt/...`. Cada página declara `canonical` + `hreflang` e o sitemap lista as duas versões, pro Google indexar as duas línguas. Links internos passam por `localePath(locale, path)` (`src/i18n/path.ts`).

Cada `t.ts` tem as duas línguas lado a lado (`{ pt, en }`). O `src/i18n/generated.ts` é gerado sozinho no `dev`/`build`; não edite à mão. Faltar uma língua quebra o build de propósito.

## Testes e CI

`bun test` roda os testes unitários das partes puras: `src/lib/*.test.ts` (GitHub, contato, limite por IP, tempo de leitura, slug), `src/proxy.test.ts` e `src/i18n/path.test.ts`.

A cada push ou PR na `main`, o GitHub Actions (`.github/workflows/ci.yml`) roda `lint`, `typecheck`, `test` e `build`, nessa ordem. O deploy é feito pela Vercel.

## Design

- [`PRODUCT.md`](PRODUCT.md): público, objetivo e princípios do site.
- [`DESIGN.md`](DESIGN.md): sistema visual ("O Terminal de Casa"): cores, tipografia, layout, componentes e regras.
