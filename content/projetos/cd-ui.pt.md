## tl;dr

O cd/ui reúne 27 componentes React e 15 blocos (telas prontas), tudo em Base UI + Tailwind v4, num **registry do shadcn**. Você instala o código direto no projeto e pode adaptar como quiser. O build mede o tamanho de cada componente em gzip; a média atual fica em cerca de 600 B.

[docs](https://cd-ui.vercel.app/docs) · [blocos](https://cd-ui.vercel.app/blocks) · [performance](https://cd-ui.vercel.app/docs/performance) · [código](https://github.com/di0rio/cd-ui)

## o problema

biblioteca de componentes costuma ser uma dependência: você instala, importa e torce pra ela continuar fazendo o que você precisa. quando precisa mudar um detalhe, é brigar com a API ou com o CSS.

e quase toda biblioteca diz que é "leve". raramente diz **quanto**.

eu queria o contrário:

- componentes acessíveis que virassem **código meu**, não uma dependência;
- o peso de cada um **medido**, não chutado;
- o mínimo de JavaScript no navegador.

## a ideia

três apostas simples:

1. **registry em vez de pacote.** o cd/ui não vai pro `node_modules`. um comando copia o arquivo do componente pro seu projeto, e dali em diante o código é seu.
2. **medir no build.** o tamanho vem do esbuild, não de estimativa, e aparece em cada página de docs.
3. **servidor primeiro.** componente sem estado é Server Component e não manda JS. `"use client"` só entra quando tem estado ou evento.

## como fica

instalar é o fluxo normal do shadcn:

```bash
npx shadcn@latest init
npx shadcn@latest add https://cd-ui.vercel.app/r/theme.json
npx shadcn@latest add https://cd-ui.vercel.app/r/button.json https://cd-ui.vercel.app/r/form.json
```

ou registre o namespace uma vez no `components.json` e use nomes curtos:

```json
{ "registries": { "@cd": "https://cd-ui.vercel.app/r/{name}.json" } }
```

```bash
npx shadcn@latest add @cd/button @cd/dialog
```

as dependências (Base UI, Zod quando precisa) e os outros componentes necessários vêm juntos. e a home já mostra a ideia do projeto.

![home do cd/ui: o prompt mostra a rota atual, Ctrl K abre a busca e a média de 600 B em gzip é medida no build](/projects/cd-ui-home.webp)

cada componente tem uma página própria, com preview, código, API, teclas e notas de acessibilidade. o selo de tamanho e o selo client/server saem da medição do build.

![página do Button nas docs: selos com o tamanho em gzip e onde roda, abas de preview e código e o marcador rsc na barra lateral](/projects/cd-ui-docs.webp)

além dos componentes, o cd/ui tem 15 blocos: telas inteiras prontas (5 de autenticação, 7 de marketing e 3 de app, como login, hero, preços, FAQ e configurações), montadas só com os componentes da biblioteca. um bloco instala com um comando e leva junto os componentes que usa:

```bash
npx shadcn@latest add https://cd-ui.vercel.app/r/login-01.json
```

a página de cada bloco mostra o preview em desktop, tablet e celular, o código e abre em tela cheia. as docs e os blocos existem em português e em inglês.

![página do bloco login-01: o comando de instalação, as abas de preview e código com os tamanhos desktop, tablet e celular e o link pra abrir em tela cheia](/projects/cd-ui-blocks.webp)

## como funciona por trás

o repositório tem duas fontes de verdade: os arquivos em `src/registry/cd/ui/*.tsx` (o que é distribuído) e o `src/docs/catalog.json` (nome, título, categoria e descrição de cada componente). os blocos seguem o mesmo esquema, em `src/registry/cd/blocks` e `src/blocks/catalog.json`. o build lê tudo isso e gera o que o site e a CLI precisam.

```text
src/registry/cd/ui/*.tsx ─┬─► build-registry.mjs ─► registry.json ─► shadcn build ─► public/r/*.json
                          │
                          └─► metrics.mjs ─► esbuild + gzip ─► src/docs/metrics.json ─► docs
```

`bun run build` roda `registry:build` (os dois scripts e o `shadcn build`) e só depois o `next build`.

### o registry nunca é escrito à mão

o `scripts/build-registry.mjs` descobre as dependências lendo os imports do próprio arquivo:

```js
function importsOf(file) {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(/^import\s+(?:type\s+)?[^"']*["']([^"']+)["']/gm)]
    .filter((m) => !/^import\s+type\s/.test(m[0]))
    .map((m) => m[1]);
}
```

o que não é `@/` nem `react` vira dependência npm. o que é `@/registry/cd/ui/outro` vira dependência de registry (a URL do outro componente). o item `theme` copia os tokens do `globals.css`, os blocos `:root` e `.dark`.

resultado: se o componente passa a importar outra coisa, o registry já sabe. não tem como esquecer de atualizar uma lista. o mesmo vale pros blocos: os componentes que eles importam viram dependências de registry, então instalar um bloco instala tudo o que ele usa.

### o que aprendi instalando num projeto de verdade

depois de instalar o cd/ui num projeto de fora, apareceram três problemas que o meu próprio site não mostrava:

- **o `cn` era o do shadcn.** sem uma URL pro `utils`, o shadcn cai no item embutido dele, que instala `export { cn } from "cn"`. agora o cd/ui entrega o próprio item `utils` (clsx + tailwind-merge) e todo componente depende dele.
- **Server Component não chamava `buttonVariants`.** ele morava no `button.tsx`, que é `"use client"`, e uma função exportada de um módulo client não roda no servidor. mudou pra `button-variants.ts`, sem `"use client"`, e o `button.tsx` só reexporta. no registry, arquivos irmãos que o componente importa e que não estão no catálogo viajam no mesmo item.
- **os blocos importam do caminho do registry.** eles usam `@/registry/cd/ui/button` e a CLI reescreve esse caminho pro alias do `components.json` do projeto de quem instala.

### o peso é medido, não chutado

o `scripts/metrics.mjs` empacota cada componente com esbuild e mede em gzip:

```js
const result = await build({
  entryPoints: [file],
  bundle: true,
  minify: true,
  write: false,
  format: "esm",
  // bibliotecas ficam de fora; o código do cd/ui entra
  external: ["react", "react/*", "react-dom", "@base-ui/react", "@base-ui/react/*", /* … */ "zod", "zod/*"],
});
const code = result.outputFiles[0].contents;
metrics[name] = { gzip: gzipSync(code, { level: 9 }).length, /* … */ };
```

as bibliotecas ficam de fora **de propósito**: o Base UI e o Zod já existem no seu projeto ou são compartilhados. o número é o código que entra no seu projeto *além* delas, que é a parte que o cd/ui controla.

o mesmo script marca cada componente como client ou servidor, só olhando se o arquivo começa com `"use client"`:

```js
client: /^["']use client["']/.test(source),
```

da medição saem os números do site. os 27 componentes, do menor ao maior:

| componente | gzip | roda onde |
| --- | --- | --- |
| skeleton | 234 B | servidor |
| kbd | 282 B | servidor |
| separator | 284 B | servidor |
| card | 377 B | servidor |
| avatar | 383 B | client |
| spinner | 398 B | servidor |
| textarea | 445 B | client |
| field | 451 B | client |
| badge | 453 B | servidor |
| switch | 474 B | client |
| progress | 475 B | client |
| tooltip | 482 B | client |
| input | 516 B | client |
| alert | 530 B | servidor |
| radio-group | 535 B | client |
| form | 553 B | client |
| table | 586 B | servidor |
| popover | 588 B | client |
| tabs | 628 B | client |
| slider | 668 B | client |
| checkbox | 702 B | client |
| accordion | 721 B | client |
| dialog | 945 B | client |
| select | 990 B | client |
| button | 1,1 kB | client |
| dropdown-menu | 1,1 kB | client |
| toast | 1,3 kB | client |

média de cerca de 600 B. 8 dos 27 (alert, badge, card, kbd, separator, skeleton, spinner e table) não mandam JS.

### formulário com Zod sem carregar o Zod inteiro

o `Form` importa só o núcleo do Zod, `zod/v4/core`:

```tsx
import { type $ZodObject, flattenError, type output, safeParse } from "zod/v4/core";
```

com isso ele aceita schemas de `zod` e de `zod/mini`. você passa o schema, dá `name` aos `Field`, e cada campo valida a própria chave quando você sai dele:

```tsx
const validateField = (name: string, value: unknown) => {
  const field = schema._zod.def.shape[name];
  if (!field) return null;
  const result = safeParse(field, value);
  return result.success ? null : result.error.issues.map((issue) => issue.message);
};
```

no envio, o schema inteiro roda. se falhar, os erros vão pro `FieldError` de cada campo. se passar, o `onSubmit` recebe os dados já convertidos e com o tipo do schema:

```tsx
const schema = z.object({
  email: z.email("e-mail inválido"),
  idade: z.coerce.number().min(18, "precisa ter 18+"),
})

<Form schema={schema} onSubmit={(values) => {
  values.idade // number, não string
}}>
  <Field name="email">…</Field>
  <Field name="idade">…</Field>
</Form>
```

## decisões

**copiar em vez de depender.** um componente é um arquivo seu. se o botão precisa de outra variante, você edita o arquivo. o custo é que atualizar depois fica por sua conta.

**Base UI por baixo.** foco, teclado e aria vêm do Base UI. o cd/ui coloca o visual e as variantes por cima, e cada página de componente lista as teclas e as notas de acessibilidade.

**importar só o que usa.** cada componente importa a parte do Base UI que usa (`@base-ui/react/dialog`), nunca o pacote inteiro. animação, crescimento do textarea e spinner são CSS.

**movimento com propósito.** o botão afunda 2% em 100 ms ao clicar. de modo geral são 100 a 250 ms, curvas fortes, só `transform` e `opacity`, e `prefers-reduced-motion` respeitado em todos. a busca (⌘K) abre e fecha sem animação nenhuma: quem usa o atalho abre centenas de vezes por dia.

**o prompt como logo.** o cabeçalho das docs mostra `cd/ui ~/docs/button $` com um cursor piscando: o texto é a logo e ainda diz em que página você está.

**o nome do componente é validado.** o nome vira caminho de arquivo e URL, então o build só aceita letras minúsculas, números e hífen (`/^[a-z][a-z0-9-]*$/`).

## status e próximos passos

o cd/ui está na v0.2, com 27 componentes, 15 blocos, tema claro e escuro e o site de docs no ar, em português e inglês. é open source: licença MIT, guia de contribuição e CI que roda lint, tipos e build em todo pull request. um detalhe pra ser honesto sobre a medição: ela conta o código do cd/ui, não o Base UI nem o Zod que vêm junto.

pra adicionar um componente o caminho é curto: o arquivo em `src/registry/cd/ui`, a entrada no catálogo, os exemplos e a documentação, e `bun run registry:build` gera o resto.
