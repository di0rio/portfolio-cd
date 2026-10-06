## tl;dr

O loopvet hub é a bancada que eu uso pra migrar clínica veterinária de outro sistema pro Loopvet. Ele junta três ferramentas: um **auditor**, que mostra o que a importação faria com os arquivos **sem escrever nada**; um **importador**, que manda a fila de arquivos pelo painel de verdade; e uma de **débitos**, que traz o que cada cliente devia no sistema antigo. O hub só abre e fecha cada uma, e cada uma roda no seu próprio processo, com as suas próprias travas. É um **projeto meu**: ninguém pediu, eu fiz pra usar no meu trabalho, em cima da API do Loopvet. O código é privado e aqui não aparece nenhum dado de clínica.

## o problema

migrar uma clínica é trazer anos de cadastro: cliente, paciente, peso, vacina, atendimento, exame, agenda. os dados chegam em planilha, já convertidos, e precisam entrar no Loopvet sem quebrar nada.

antes do hub, cada etapa era um trampo manual diferente:

- subir arquivo por arquivo no painel e torcer pra dar certo;
- descobrir só **depois** da importação que um arquivo de clientes foi recusado e levou junto todos os pacientes daquele cliente;
- ver `Labrador` e `Labradro` virarem duas raças diferentes, num cadastro que a clínica usa todo dia;
- lançar os débitos de cada cliente com um script colado no console do navegador.

e o pior: importação em produção **não tem desfazer**.

## a ideia

a ideia foi simples: o que só **lê** fica de um lado, o que **escreve** fica do outro. e isso tá na arquitetura, não depende de ninguém lembrar.

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

- **auditor:** responde, arquivo por arquivo, "se isso subisse agora, o que ia acontecer?". mostra recusa, arquivo que sobe pela metade, linha descartada, cliente que vira fantasma e dado mestre que vai duplicar. ele só lê: não tem como escrever nada, e não roda fora do ambiente de testes.
- **importador:** em vez de falar direto com a API, ele mexe no painel de verdade, do jeito que uma pessoa faria. tem fila, parada de emergência e dá pra retomar de onde parou.
- **débitos:** abre o débito de cada cliente como uma ordem em aberto, pela API de ordens, sem script no console.
- **hub:** um servidor Bun cru. ele sobe a ferramenta que você abriu, espera ela responder e derruba quando você sai.

## decisões

**cada ferramenta no seu processo, nada de app único.** o auditor e o importador prometem coisas opostas: um nunca escreve, o outro escreve em produção. se tudo rodasse num servidor só, essa garantia ia virar só uma regra de código que alguém pode esquecer. separados, o auditor nem tem instalada a biblioteca que mexe no navegador.

**o hub não é Next.** ele fica ligado o dia inteiro, então quanto ele pesa importa. medi na máquina: um servidor Next parado usava **382 MB**; o hub em Bun puro, já servindo, usa **22 MB**.

**medir antes de empacotar.** a ideia inicial era empacotar tudo num app desktop pra "não pesar". quando eu medi, o peso tava no editor e no navegador (mais de 8 GB juntos), não na ferramenta. um atalho na área de trabalho resolveu o "clicar e abrir" sem precisar de empacotador nenhum.

**abrir rápido.** trocar `next dev` por `next start` nas ferramentas derrubou o tempo do clique até a tela de **2283 ms** pra uns **580 ms**.

**na dúvida, fecha.** em produção, sem senha, nenhuma rota responde. abrir sem senha só funciona na própria máquina e por dentro do hub, as duas coisas juntas. uma só não basta: sozinha, ela virava um botão que desliga a segurança.

**nunca matar importação no meio.** fechar o hub derruba as ferramentas, menos a que avisa que tá trabalhando. o importador com fila rodando continua de pé e avisa, porque um arquivo cortado no meio do envio fica num estado que ninguém sabe qual é.

**o ok da clínica é marcado, nunca adivinhado.** a migração só vai pra produção depois que a clínica confere tudo no ambiente de testes e confirma. esse ok vem numa conversa entre pessoas, então ele é um campo que alguém marca. nada no fluxo pode deduzir um "ok" porque ninguém respondeu ou porque passou tempo, ainda mais antes de escrever num lugar que não tem desfazer.

**um lugar só pra verdade.** as onze entidades de importação tavam copiadas em dois repositórios, com 179 linhas idênticas byte a byte. juntei tudo num monorepo, **mantendo o histórico dos dois**, e as entidades viraram um pacote que as duas ferramentas usam.

## como eu trabalho nele

toda mudança começa como uma tarefa escrita: por que importa, qual o risco, do que depende e quando parar e me avisar. as decisões maiores viram ADR. a IA entra em papéis separados:

- um modelo **faz** as edições da tarefa, sem acesso ao terminal;
- outro, com terminal, **confere**: roda teste, typecheck e lint, vê se o código fugiu do que foi planejado e sobe o processo pra testar de verdade;
- eu **decido** o que entra.

a régua é a mesma da CI: `bun test`, typecheck e lint em todo push.

## em números

- migração pro ambiente de testes: antes **uma por dia**, tomando o dia inteiro; hoje **até dez no mesmo dia**, duas em paralelo, junto com outros projetos. o limite depende de quanto dado cada clínica tem;
- **3** ferramentas e **11** entidades de importação;
- **7** ADRs e **21** tarefas documentadas;
- **43** arquivos de teste e CI em todo push e PR;
- hub com **22 MB** de memória e ferramenta abrindo em **~580 ms**.

## o que vem depois

o hub já tem lugar guardado pro Linear, pro Drive e pro fluxo inteiro da migração, da issue até a importação em produção. cada um vai entrar como mais uma ferramenta, com processo e travas próprios. o hub continua fazendo uma coisa só: abrir e fechar.
