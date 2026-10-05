## tl;dr

O loopvet hub é a bancada que eu uso pra migrar clínicas veterinárias de outros sistemas pro Loopvet. Ele reúne três ferramentas: um **auditor** que prevê o que a importação faria com os arquivos, **sem escrever nada**; um **importador** que envia a fila de arquivos pelo painel de verdade; e uma ferramenta de **débitos**, que traz o que cada cliente devia no sistema antigo. O hub só abre e fecha cada uma, e cada uma roda no próprio processo, com as próprias travas. É uma **ferramenta interna**: o código é privado e aqui não aparece nenhum dado de clínica.

## o problema

migrar uma clínica é trazer anos de cadastro: clientes, pacientes, pesos, vacinas, atendimentos, exames, agenda. os dados chegam em planilha, já convertidos, e precisam entrar no Loopvet sem estragar nada.

antes do hub, cada etapa era um passo manual diferente:

- subir arquivo por arquivo no painel e torcer pra dar certo;
- descobrir só **depois** da importação que um arquivo de clientes foi recusado e levou junto todos os pacientes daquele cliente;
- ver `Labrador` e `Labradro` virarem duas raças diferentes, num cadastro que a clínica usa todo dia;
- lançar os débitos de cada cliente com um script colado no console do navegador.

e o pior detalhe: a importação em produção **não tem desfazer**.

## a ideia

separar o que **lê** do que **escreve**, e deixar essa separação na arquitetura, não na boa vontade.

```text
            hub (lança e encerra, não sabe de clínica nenhuma)
              │
   ┌──────────┼──────────────────┐
   ▼          ▼                  ▼
auditor    importador          débitos
só leitura  dirige o painel     API de ordens
   │          │
   └── entidades (pacote comum: o que existe e em que ordem sobe)
```

- **auditor:** responde, arquivo por arquivo, "se isto subisse agora, o que aconteceria?". mostra recusas, partes, descartes, clientes que viram fantasma e dado mestre que vai duplicar. ele só lê: não tem como escrever nada, e se recusa a rodar fora do ambiente de testes.
- **importador:** em vez de falar direto com a API, opera o painel de verdade, do jeito que uma pessoa faria. tem fila, parada de emergência e retomada.
- **débitos:** abre o débito de cada cliente como uma ordem em aberto, pela API de ordens, sem script no console.
- **hub:** um servidor Bun cru, que sobe a ferramenta que você abriu, espera ela responder e derruba quando você sai.

## decisões

**processos isolados, não um app único.** auditor e importador têm garantias opostas: um nunca escreve, o outro escreve em produção. num servidor só, essa garantia viraria convenção de código. separados, o auditor nem tem instalada a biblioteca que dirige o navegador.

**o hub não é Next.** o hub fica de pé o dia inteiro, então o custo dele importa. medi na máquina: um servidor Next ocioso usava **382 MB**; o hub em Bun puro, já servindo, usa **22 MB**.

**medir antes de empacotar.** o pedido inicial era empacotar tudo num app desktop pra "não pesar". a medição mostrou que o peso estava no editor e no navegador (mais de 8 GB juntos), não na ferramenta. o atalho de desktop resolveu o "clicar e abrir" sem o custo de um empacotador.

**abrir rápido.** trocar `next dev` por `next start` nas ferramentas derrubou o tempo do clique até a tela de **2283 ms** pra cerca de **580 ms**.

**segurança que falha fechada.** em produção, sem senha, nenhuma rota responde. abrir sem senha só funciona na própria máquina e por dentro do hub, as duas coisas juntas. uma só não basta: sozinha, ela viraria um interruptor que desliga a segurança.

**nunca matar uma importação no meio.** fechar o hub derruba as ferramentas, menos a que declara trabalho em andamento. o importador com fila rodando fica de pé e avisa, porque um arquivo cortado no meio do envio fica num estado que ninguém sabe qual é.

**a confirmação do cliente é declarada, nunca adivinhada.** a migração só vai pra produção depois que a clínica confere tudo no ambiente de testes e confirma. esse aceite chega numa conversa entre pessoas, então ele é um campo que alguém marca. nada no fluxo pode inferir um "ok" por silêncio ou por tempo passado, antes de escrever onde não existe desfazer.

**uma verdade só.** as onze entidades de importação existiam copiadas em dois repositórios, com 179 linhas idênticas byte a byte. juntei tudo num monorepo, **preservando o histórico dos dois**, e as entidades viraram um pacote que as duas ferramentas usam.

## como eu trabalho nele

cada mudança começa como uma tarefa escrita: por que importa, risco, do que depende e quando parar e avisar. as decisões maiores viram ADR. a IA participa em papéis separados:

- um modelo **executa** as edições da tarefa, sem acesso ao terminal;
- outro, com terminal, **verifica**: roda testes, typecheck, lint, confere se o código derivou do planejado e sobe o processo pra testar de verdade;
- eu **decido** o que entra.

o portão é o mesmo da CI: `bun test`, typecheck e lint em todo push.

## em números

- migração pro ambiente de testes: antes **uma por dia**, tomando o dia inteiro; hoje **até dez no mesmo dia**, duas em paralelo, junto com outros projetos. o teto depende do volume de dados de cada clínica;
- **3** ferramentas e **11** entidades de importação;
- **7** ADRs e **21** tarefas documentadas;
- **43** arquivos de teste e CI em todo push e PR;
- hub com **22 MB** de memória e ferramenta abrindo em **~580 ms**.

## o que vem depois

o hub já reserva lugar pra Linear, Drive e o fluxo completo da migração, da issue até a importação em produção. cada um vai chegar como mais uma ferramenta, com processo e travas próprios. o hub continua só abrindo e fechando.
