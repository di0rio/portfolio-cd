export default {
  caseStudy: { pt: "estudo de caso", en: "case study" },
  back: { pt: "← projetos", en: "← projects" },
  problem: { pt: "o problema", en: "the problem" },
  decisions: { pt: "o que eu fiz", en: "what i did" },
  stack: { pt: "stack", en: "stack" },
  later: { pt: "próximos passos", en: "next steps" },
  live: { pt: "ver no ar", en: "see it live" },
  repo: { pt: "ver repositório", en: "view repository" },
  imageAlt: { pt: "captura de tela de {name}", en: "screenshot of {name}" },
  nav: { pt: "outros projetos", en: "other projects" },
  prev: { pt: "anterior", en: "previous" },
  next: { pt: "próximo", en: "next" },

  agendavet: {
    intro: {
      pt: "agenda semanal de clínica veterinária: uma tela só, feita com cuidado de produto.",
      en: "weekly agenda for a vet clinic: a single screen, built with product care.",
    },
    problem: {
      pt: "uma agenda de clínica fica aberta o dia inteiro. marcar e remarcar tem que ser rápido com mouse e com teclado, e atendimentos no mesmo horário precisam aparecer lado a lado.",
      en: "a clinic agenda stays open all day. booking and rescheduling have to be fast with mouse and keyboard, and overlapping appointments need to show side by side.",
    },
    d1: {
      pt: "arrastar é manipulação direta: o card segue o ponteiro em passos de 15 min, pode trocar de dia e não anima enquanto arrasta, então nada fica atrasado em relação ao mouse. esc cancela no meio.",
      en: "dragging is direct manipulation: the card follows the pointer in 15 min steps, can change days and doesn't animate while dragging, so nothing lags behind the mouse. esc cancels midway.",
    },
    d2: {
      pt: "teclado completo: tab até um atendimento, ↑ ↓ move 15 min, ← → troca de dia, enter edita. na página, N marca, ← → troca de semana e T volta pra hoje. os atalhos não animam, porque quem usa teclado repete isso dezenas de vezes por dia.",
      en: "full keyboard support: tab to an appointment, ↑ ↓ moves 15 min, ← → changes day, enter edits. on the page, N books, ← → changes week and T goes back to today. shortcuts don't animate, because keyboard users repeat them dozens of times a day.",
    },
    d3: {
      pt: "o formulário é o Form do cd/ui com schema do zod: mensagens em português, horário e duração validados, e os dados chegam tipados no submit.",
      en: "the form is cd/ui's Form with a zod schema: messages in portuguese, time and duration validated, and the data arrives typed on submit.",
    },
    d4: {
      pt: "sem back-end: os dados ficam no navegador (localStorage), lidos com useSyncExternalStore, e a primeira visita já traz uma semana de exemplo.",
      en: "no back-end: data lives in the browser (localStorage), read with useSyncExternalStore, and the first visit already comes with a sample week.",
    },
    stack: {
      pt: "next.js 16 · tailwind v4 · zod · cd/ui (base ui)",
      en: "next.js 16 · tailwind v4 · zod · cd/ui (base ui)",
    },
  },

  cdui: {
    intro: {
      pt: "biblioteca de componentes que pesa o mínimo e mostra quanto pesa.",
      en: "a component library that weighs as little as possible and shows how much.",
    },
    problem: {
      pt: "eu queria componentes acessíveis que virassem código meu, não uma dependência, e que o peso de cada um fosse medido em vez de chutado.",
      en: "i wanted accessible components that become my own code, not a dependency, and whose weight is measured instead of guessed.",
    },
    d1: {
      pt: "distribuída como registry do shadcn: o código vem pro seu projeto e passa a ser seu. são 17 componentes, de button a tabs, instalados com um comando.",
      en: "shipped as a shadcn registry: the code comes into your project and becomes yours. 17 components, from button to tabs, installed with one command.",
    },
    d2: {
      pt: "o tamanho é medido a cada build: cada componente é empacotado com esbuild (minificado, bibliotecas de fora, que é o que vira código seu) e medido em gzip. a média é ~540 B, e a página /docs/performance mostra tudo.",
      en: "size is measured on every build: each component is bundled with esbuild (minified, libraries left out, which is what becomes your code) and measured in gzip. the average is ~540 B, and the /docs/performance page shows it all.",
    },
    d3: {
      pt: "6 dos 17 são Server Components e não mandam JS. \"use client\" só entra quando há estado ou eventos.",
      en: "6 of the 17 are Server Components and ship no JS. \"use client\" only shows up when there's state or events.",
    },
    d4: {
      pt: "o Form usa só zod/v4/core, então aceita zod e zod/mini. passa o schema, dá name aos Field e o onSubmit recebe os dados validados e tipados.",
      en: "Form only uses zod/v4/core, so it accepts zod and zod/mini. pass the schema, give the Fields a name and onSubmit receives validated, typed data.",
    },
    d5: {
      pt: "movimento com propósito: 100 a 250 ms, curvas fortes, só transform e opacity, e prefers-reduced-motion respeitado em todos.",
      en: "motion with purpose: 100 to 250 ms, strong curves, only transform and opacity, and prefers-reduced-motion respected in all of them.",
    },
    stack: {
      pt: "react · base ui · tailwind v4 · zod · next.js (docs) · esbuild (medição)",
      en: "react · base ui · tailwind v4 · zod · next.js (docs) · esbuild (measuring)",
    },
  },

  converter: {
    intro: {
      pt: "conversores de arquivo que rodam inteiros no navegador. nada sai do seu computador.",
      en: "file converters that run entirely in the browser. nothing leaves your computer.",
    },
    problem: {
      pt: "transformar um arquivo (planilha, dump de SQL, imagem, JSON) em outro sem upload e sem servidor por trás: o navegador lê o arquivo e escreve o resultado de volta.",
      en: "turning a file (spreadsheet, SQL dump, image, JSON) into another without uploads or a server behind it: the browser reads the file and writes the result back.",
    },
    d1: {
      pt: "a privacidade é imposta pelo navegador, não só prometida: uma CSP com connect-src 'self' e form-action 'self' não deixa rota pra uma dependência mandar o arquivo pra fora.",
      en: "privacy is enforced by the browser, not just promised: a CSP with connect-src 'self' and form-action 'self' leaves no route for a dependency to send the file out.",
    },
    d2: {
      pt: "nada do arquivo é executado. o dump de SQL é lido como texto e nunca roda, e o banco SQLite é aberto só pra leitura por um motor SQLite dentro da aba.",
      en: "nothing in the file is ever executed. a SQL dump is parsed as text and never replayed, and a SQLite database is opened read-only by a SQLite engine inside the tab.",
    },
    d3: {
      pt: "monorepo com um core sem I/O e sem UI. cada dialeto de SQL é um parser atrás de uma interface, então suportar mais um motor é escrever um parser e registrar. o catálogo de ferramentas é uma fonte única que alimenta cards, títulos e metadata.",
      en: "monorepo with a core that has no I/O and no UI. each SQL dialect is a parser behind an interface, so supporting another engine means writing a parser and registering it. the tool catalog is a single source feeding cards, titles and metadata.",
    },
    d4: {
      pt: "lê formatos binários sem o motor original: arquivos .fdb do Firebird e backups do SQL Server são interpretados direto da estrutura em disco, sem restaurar nada.",
      en: "reads binary formats without the original engine: Firebird .fdb files and SQL Server backups are parsed straight from the on-disk structure, with nothing restored.",
    },
    d5: {
      pt: "o que não encaixa é recusado, não adivinhado: arquivo acima do limite é barrado antes de ler, e JSON aninhado não vira tabela porque achatar escolheria uma forma por você.",
      en: "what doesn't fit is refused, not guessed: a file over the limit is rejected before reading, and nested JSON doesn't become a table because flattening would pick a shape for you.",
    },
    stack: {
      pt: "next.js 16 · typescript · tailwind v4 · bun workspaces · sqlite no navegador (wa-sqlite)",
      en: "next.js 16 · typescript · tailwind v4 · bun workspaces · sqlite in the browser (wa-sqlite)",
    },
  },

  cdai: {
    intro: {
      pt: "agente de código que roda local, com Ollama, Tauri e Rust, sem API externa.",
      en: "a coding agent that runs locally, with Ollama, Tauri and Rust, no external API.",
    },
    problem: {
      pt: "um agente que faz o ciclo inteiro (entender, planejar, implementar, executar, validar e corrigir) no meu computador, com modelo local. sem custo de token, os limites são só operacionais e de segurança: memória, tempo, iterações e loops.",
      en: "an agent that does the whole loop (understand, plan, implement, run, validate and fix) on my own computer, with a local model. with no token cost, the limits are only operational and safety ones: memory, time, iterations and loops.",
    },
    d1: {
      pt: "o núcleo é em Rust e serve o desktop (Tauri) e uma CLI headless, a mesma que roda o eval. validação de path, permissão, sandbox e redação de secrets vivem no Rust: a webview nunca é fronteira de confiança.",
      en: "the core is in Rust and serves both the desktop app (Tauri) and a headless CLI, the same one that runs the eval. path validation, permissions, sandbox and secret redaction live in Rust: the webview is never a trust boundary.",
    },
    d2: {
      pt: "exclusivamente local na v1: sem API externa, telemetria, login ou billing. o provider de modelo é uma interface abstrata só pra não acoplar o código a um provider específico.",
      en: "strictly local in v1: no external API, telemetry, login or billing. the model provider is an abstract interface only so the code doesn't get coupled to one specific provider.",
    },
    d3: {
      pt: "a interface é Next.js em static export, porque o Tauri não tem runtime de servidor: sem SSR, API routes ou Server Actions. toda operação com privilégio passa pelo Rust via IPC.",
      en: "the interface is Next.js with static export, because Tauri has no server runtime: no SSR, API routes or Server Actions. every privileged operation goes through Rust via IPC.",
    },
    d4: {
      pt: "aprovação por padrão: no modo ASK, cada escrita e cada comando que não seja leitura pede aprovação, e sem terminal interativo a ação é negada (não existe --yes). no linux, comandos rodam em sandbox, com rede bloqueada por padrão.",
      en: "approval by default: in ASK mode, every write and every non-read command asks for approval, and with no interactive terminal the action is denied (there is no --yes). on linux, commands run in a sandbox, with network blocked by default.",
    },
    d5: {
      pt: "contexto compactado, não estendido: perto de estourar a janela (32k no qwen3-coder:30b), o histórico vira um resumo estruturado. o progresso real fica no disco, no git e nos checkpoints, não na memória do modelo.",
      en: "context is compacted, not extended: near the window limit (32k on qwen3-coder:30b), the history becomes a structured summary. real progress lives on disk, in git and in checkpoints, not in the model's memory.",
    },
    next: {
      pt: "o primeiro release só empacota .deb e AppImage (Linux x86_64). Flatpak, RPM, Windows e macOS ficam pra depois.",
      en: "the first release only packages .deb and AppImage (Linux x86_64). Flatpak, RPM, Windows and macOS come later.",
    },
    stack: {
      pt: "tauri · rust · next.js (static export) · tailwind · base ui · bun · ollama",
      en: "tauri · rust · next.js (static export) · tailwind · base ui · bun · ollama",
    },
  },
};
