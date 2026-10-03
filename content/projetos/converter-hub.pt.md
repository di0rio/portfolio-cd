## tl;dr

o converter-hub é um conjunto de ferramentas que transformam um arquivo em outro **inteiramente no navegador**: planilha, dump de SQL, banco SQLite, CSV/JSON/YAML, markdown, imagem. não tem upload nem servidor por trás. e a privacidade não é só promessa: uma CSP faz o navegador **impedir** que o arquivo saia da aba.

[ver no ar](https://convert-hub-web.vercel.app) · [código](https://github.com/di0rio/Converter-Hub)

## o problema

converter um arquivo costuma significar subir ele num site qualquer. se o arquivo é uma planilha de clientes ou um dump de banco, isso é um problema: o dado vai pra um servidor que você não conhece.

o que eu queria:

- converter **sem upload** e sem servidor pra manter;
- aceitar formatos chatos de verdade (dump de 24 motores de SQL, banco SQLite com WAL, arquivo do Firebird, backup do SQL Server);
- falhar de forma clara quando o arquivo não encaixa, em vez de entregar um resultado torto.

## a ideia

o navegador lê o arquivo, converte e escreve o resultado de volta. três regras seguram o projeto:

1. **nada sai do computador.** o arquivo é lido com `file.text()` ou `file.arrayBuffer()`, e nenhuma requisição é feita pra processar dados.
2. **nada do arquivo é executado.** um dump de SQL é lido como texto e nunca roda. um banco SQLite é aberto só pra leitura.
3. **o que não encaixa é recusado, não adivinhado.** arquivo grande demais, formato desconhecido ou JSON aninhado que não vira tabela: o app diz o motivo.

## como fica

a home é um catálogo de ferramentas. você também pode soltar um arquivo na home: o hub escolhe a ferramenta pela extensão, guarda o arquivo em memória e navega até ela.

![home do converter-hub: o catálogo de ferramentas, cada uma com os formatos que lê e os que escreve](/projects/converter-hub-home.webp)

são seis ferramentas, cada uma com a sua rota:

| ferramenta | rota | lê | escreve |
| --- | --- | --- | --- |
| planilhas | `/spreadsheet` | XLSX, XLSM, XLS, XLSB, ODS, CSV, TSV | XLSX, CSV, JSON, Markdown, SQL |
| SQL | `/sql` | dumps de 24 motores, banco SQLite (com WAL), arquivos do Firebird 2.x a 5 e backups gbak, backups do SQL Server | SQL, CSV, XLSX, JSON, JSON Lines, Markdown |
| dados | `/data` | CSV, TSV, JSON, JSON Lines, YAML, XML | CSV, TSV, JSON, JSON Lines, YAML, Markdown, SQL, XLSX |
| markdown | `/markdown` | Markdown, HTML | HTML, Markdown |
| JSON pra TypeScript | `/json-to-typescript` | JSON | TypeScript |
| imagens | `/image` | SVG, PNG, JPEG, WebP, AVIF | PNG, JPEG, WebP |

na ferramenta de dados, depois de carregar um CSV, o resultado aparece pronto pra escolher o formato e baixar:

![ferramenta de dados com um CSV carregado: o arquivo é lido localmente e nada é enviado, escolhe-se o formato de saída e depois converter e baixar](/projects/converter-hub-data.webp)

## como funciona por trás

o repositório é um monorepo com duas partes que não se misturam: `packages/core` (parsing e escrita, **sem I/O e sem UI**) e `apps/web` (a interface em Next.js). existe também uma CLI, só pra ferramenta de SQL.

```text
arquivo no disco
   │  file.text() / file.arrayBuffer()        (na aba, sem rede)
   ▼
detecta pelo conteúdo ─► parser ─► modelo normalizado ─► escritor ─► Blob ─► download
                         └──────── packages/core: sem I/O, sem UI ────────┘
```

o app web só liga as pontas: pega o `File`, chama o core e entrega o resultado como download (um `Blob` com `URL.createObjectURL`).

### o catálogo é uma fonte única

`apps/web/lib/tools.ts` descreve cada ferramenta uma vez:

```ts
{
  id: 'spreadsheet',
  name: 'Spreadsheets',
  tagline: 'Split a multi-sheet workbook into one file per sheet.',
  href: '/spreadsheet',
  source: ['XLSX', 'XLSM', 'XLS', 'XLSB', 'ODS', 'CSV', 'TSV'],
  output: ['XLSX', 'CSV', 'JSON', 'Markdown', 'SQL'],
  // …
}
```

dessa lista saem os cards da home, os títulos, o breadcrumb e a metadata das rotas. só entra ali ferramenta que já tem rota: o hub nunca anuncia o que ainda não existe. acrescentar uma ferramenta é uma entrada no catálogo e uma rota.

### a ferramenta de dados: ler pra um valor, escrever de um valor

o jeito mais simples de converter qualquer formato em qualquer outro é passar por um meio-termo. em `apps/web/lib/data-convert.ts`, tudo vira um valor JavaScript simples e depois é escrito no formato de saída:

```ts
const content = await writeData(
  await readData(text, input),
  output,
  name,
  options,
)
```

o `readData` tem um `case` por formato de entrada (`csv`, `tsv`, `json`, `jsonl`, `xml`, `yaml`), e o `writeData` um por formato de saída. alguns detalhes que mostram o cuidado:

- JSON, JSON Lines e YAML aceitam qualquer formato de dado. CSV, TSV, Markdown, SQL e XLSX precisam de **uma lista de registros planos**. um documento aninhado é recusado, porque achatar escolheria uma forma por você.
- o delimitador do CSV é detectado pelo cabeçalho, e os valores continuam texto (`007` continua `007`).
- o YAML é lido com a biblioteca `yaml`, cujo limite padrão de aliases recusa um documento que explode em um grafo gigante a partir de poucos bytes.
- o XML é lido pelo `DOMParser` do navegador, que não executa nada nem busca entidade externa, e vira uma forma fixa (`@atributo`, `#text`, lista pra elemento repetido).

### a ferramenta de SQL: um parser por dialeto

um dump de SQL é lido **como texto**. cada motor de banco é um parser atrás de uma interface pequena em `packages/core/src/parser/shared/format-parser.ts`:

```ts
export interface FormatParser {
  format: DatabaseFormat
  parse(sql: string): SqlDump
  readColumns(createStatement: string): string[]
  readDataBlock(statement: string): DataBlock
  countDataRows(statement: string): number
}
```

o SQL específico de cada dialeto mora só em `parser/<formato>/`. todo o resto (o extrator, os geradores e a UI) trabalha em cima do **modelo normalizado**. então suportar mais um motor é escrever um parser e registrar, sem mexer em mais nada.

a detecção é conservadora. primeiro acha a *família* por marcadores que o grupo todo compartilha, depois o *membro* por marcadores que só aquele produto escreve. marcadores de duas famílias que não são claramente diferentes não dão resposta, em vez de um chute. e um formato só é anunciado como suportado depois de ter parser, fixture sintética e testes: um teste de matriz passa todos eles por detecção, parsing e as três exportações.

### banco SQLite sem executar nada do arquivo

um banco SQLite é binário, então é aberto por um motor SQLite (wa-sqlite, em WebAssembly) rodando na aba. o arquivo vai pra um sistema de arquivos em memória e abre **só leitura**:

```ts
const db = await sqlite3.open_v2('db', SQLite.SQLITE_OPEN_READONLY, 'memory')
// impede que views e triggers do próprio arquivo chamem funções com efeito colateral
await sqlite3.exec(db, 'PRAGMA trusted_schema=OFF')
```

a ferramenta distingue dump de banco **pelo conteúdo, não pelo nome**: arquivo que começa com o cabeçalho do SQLite (ou que vem com um `-wal`) é banco, e qualquer outro é lido como dump. um texto renomeado pra `.db` continua sendo texto.

se você seleciona o `-wal` junto, as linhas recentes entram, e a ferramenta avisa. não existe parser de WAL escrito à mão: um SQLite de verdade aplica o log. um `-wal` com checksum inválido é recusado, porque o SQLite sozinho trataria como vazio e exportaria o banco sem as linhas mais novas, sem avisar.

### formatos binários sem o motor original

arquivos `.fdb` do Firebird e backups `.fbk` do gbak são interpretados direto da estrutura em disco, seguindo o código-fonte do próprio Firebird, sem Firebird nenhum. o backup do SQL Server é um container Microsoft Tape Format em volta das páginas de 8 KB do banco: o core acha a primeira página, varre o arquivo atrás das páginas de dados e lê o catálogo a partir delas, sem restaurar nada. o que o core não sabe ler (tabela com ARRAY no Firebird, backup criptografado) aparece como ilegível ou é recusado com o motivo, nunca adivinhado.

### a privacidade é imposta pelo navegador

o app manda uma Content Security Policy em `apps/web/next.config.ts`:

```ts
"default-src 'self'",
`script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`,
"connect-src 'self'",
"object-src 'none'",
"base-uri 'self'",
"form-action 'self'",
"frame-ancestors 'none'",
```

o `connect-src 'self'` e o `form-action 'self'` não deixam rota pra uma dependência mandar o arquivo pra fora, e o `wasm-unsafe-eval` existe pro motor SQLite. o `'unsafe-inline'` no script é uma troca assumida: sem ele só dá com nonce, que obriga toda página a renderizar dinamicamente e abre mão do prerender estático. como não tem HTML do usuário renderizado, nada lido da URL e nenhum servidor, o ataque que isso defenderia não tem por onde entrar.

## decisões

**core sem I/O e sem UI.** o parsing e a escrita são código puro, testável sem navegador. a CLI e a web importam o mesmo core.

**recusar em vez de adivinhar.** o limite é checado **pelo tamanho, antes de ler um byte**: dump acima de 250 MB e planilha acima de 100 MB são barrados com uma mensagem, em vez de estourar a memória no meio. formato lossy avisa o que se perde **antes** de exportar. e formato com ressalva mas sem perda não avisa, pra não ensinar ninguém a ignorar o aviso que importa.

**nada de adivinhar tipo.** o SQLite não tem tipo de data, então um inteiro que parece timestamp continua inteiro. CSV vem do mesmo escritor das outras ferramentas, que neutraliza `=`, `+`, `-` e `@` no começo da célula.

**sem biblioteca onde o navegador resolve.** a ferramenta de imagem não usa nenhuma: o navegador decodifica pela `Image`, desenha num canvas e codifica com `canvas.toBlob`. um SVG é carregado por `<img>` a partir de uma URL de Blob, onde o navegador não roda script nem busca recurso externo. o JPEG é pintado sobre branco, porque não tem transparência, e o AVIF é só lido, não oferecido como saída.

**nome de arquivo é entrada não confiável.** o nome de uma aba da planilha vira nome de entrada num ZIP, então separador de caminho, ponto no começo e caractere de controle são tratados.

## status e próximos passos

as seis ferramentas da home funcionam e têm testes (Vitest). o fluxo de qualidade do repositório exige tipos, lint, formatação, testes e build passando. outras quatro ferramentas de texto (Base64/hex/URL, estilos de identificador, timestamps e cores) estão prontas e testadas no core, mas ficam fora da home, em `apps/web/app/_parked`, até ganharem lugar.

limites assumidos:

- a leitura não é streaming: um dump vira uma string só, então o pico de memória é um múltiplo do arquivo (por isso o teto de 250 MB);
- cada parser entende o que a ferramenta de dump do motor escreve, não é um parser de SQL universal;
- a ferramenta de planilhas divide por aba: valores e fórmulas sobrevivem no XLSX, mas cor, borda e largura de coluna, não. ela não é um editor de planilha;
- o markdown arbitrário em HTML não converte perfeitamente.
