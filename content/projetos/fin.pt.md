## tl;dr

O fin é a ferramenta de finanças lá de casa, e ela **só lê**. Conecta duas contas bancárias pelo Open Finance (via Pluggy), mostra tudo num dashboard e manda aviso no Discord: resumo do dia, fatura chegando, fatura que aumentou, gasto acima do normal e compra nova. Ela nunca mexe em dinheiro, não tem banco de dados e não guarda valor nenhum em disco. O repositório é **privado**, porque o que tá ali é dinheiro de verdade; aqui eu conto como funciona, sem mostrar dado nenhum.

## o problema

cada um da família tem a própria conta, em banco diferente. pra saber quanto a casa gastou no mês, ou se a fatura do cartão subiu, era abrir dois apps e somar de cabeça.

eu queria duas coisas: ver tudo num lugar só, e um aviso que chega sozinho, sem ninguém precisar lembrar de abrir nada.

## por que Pluggy (e o Meu Pluggy)

o Open Finance é o sistema do Banco Central que deixa você autorizar um app a ler os dados da sua conta. a Pluggy é a ponte pra isso, mas o plano comercial dela custa R$ 2.500 por mês, o que não faz sentido pra uso de família.

o caminho que eu usei foi o **Meu Pluggy**, o portal pessoal deles, com o **Conector 200**, que dá acesso à API dos seus próprios dados. é de graça e não tem prazo. só que o plano grátis tem um custo: o cache dos dados atualiza uma vez por dia, então nada aqui é tempo real (e eu aceitei isso, explico mais embaixo).

o lado bom é a privacidade: **cada pessoa autoriza o próprio banco**, no app do banco. ninguém vê a senha de ninguém, e o acesso é só de leitura.

## como é por dentro

o projeto tem três frentes em cima do **mesmo núcleo**:

```text
Pluggy ─► fonte (única camada que sabe de onde vem o dado)
              │
              ▼
        serviços (regras puras: extrato, faturas, gastos, avisos)
              │
   ┌──────────┼──────────────────────┐
   ▼          ▼                      ▼
dashboard   relatório            notificador
(Next.js)   (terminal)           (Vercel Cron ─► Discord)
```

- **núcleo (`src/`):** TypeScript quase sem dependência, rodando direto no Node. todas as regras moram aqui, como funções puras. nenhuma das frentes tem regra de negócio própria;
- **dashboard:** Next.js com três telas: início, o mês comparado com o anterior, e o dia. lê tudo em Server Component, e um `server-only` faz o build quebrar se alguém tentar levar dado financeiro pro navegador;
- **notificador:** uma rota agendada na Vercel (Cron) roda duas vezes por dia, passa pelas regras e manda os avisos no Discord. não precisa de computador ligado;
- **relatório no terminal:** um comando pra conferir o que o núcleo entendeu dos extratos.

não tem banco de dados. as transações são lidas da fonte a cada execução, ficam na memória e somem quando o processo acaba.

## decisões

**só leitura.** o fin nunca paga fatura, nunca transfere, nunca muda cadastro. é a regra número um, e é a que mais me deixa tranquilo.

**dinheiro em centavos, em número inteiro.** `0.1 + 0.2` dá `0.30000000000000004` em ponto flutuante, e esse erro vai acumulando. com inteiro isso não existe; a conversão pra reais só acontece na hora de mostrar na tela.

**data como string `YYYY-MM-DD`, nunca `Date`.** `new Date("2026-01-31")` é meia-noite em UTC, que no horário de Brasília vira dia 30 e joga a transação pro mês errado, sem dar erro nenhum. como string, o mês é um `slice(0, 7)` e a ordem por data é a mesma da ordem alfabética.

**mês é mês do calendário; ciclo de fatura é outra coisa.** o mês vai do dia 1 até o último. o ciclo da fatura (fecha num dia, vence em outro, cada cartão no seu) só existe dentro do cálculo de faturas, e é feito conta por conta. misturar os lançamentos antes de calcular dava um número que parece certo e tá errado, e tem teste só pra travar isso.

**nenhum valor de dinheiro em disco.** a única coisa salva é o estado do notificador, e ele guarda só a chave de cada aviso e a data de envio. as chaves de transação passam por um HMAC com segredo próprio, então se o arquivo vazar não dá pra saber quanto ninguém gastou. tem um teste que confere que nada com cara de dinheiro é gravado. credencial nunca fica em texto puro.

**aviso não chega duas vezes.** todo aviso tem uma chave fixa, e o estado só é salvo **depois** que o envio dá certo. se a rede cair, o aviso sai na próxima execução em vez de sumir, e mandar o mesmo lote de novo não duplica nada.

**o resumo espera o dado chegar.** como o cache da Pluggy atualiza uma vez por dia, o resumo do dia anterior chegava atrasado ou faltando coisa. agora, se dá pra provar que o dado é mais velho que ontem, o envio espera e a próxima execução tenta de novo.

**sem tempo real, de propósito.** o dado só muda uma vez por dia, então um WebSocket ia ficar aberto esperando uma novidade que não existe. as telas leem a fonte a cada navegação, sem cache, porque número financeiro velho é número errado.

**linha descartada sempre aparece.** nada some calado: um total menor que o real, sem aviso, seria o pior defeito possível numa ferramenta dessas.

## testes

os testes usam `node:test`, sem framework, um arquivo por módulo, e já passam de 350. a regra do projeto é que toda conta de dinheiro tem teste, cobrindo virada de mês, virada de ano, ano bissexto, lista vazia e divisão por zero. o notificador também tem teste de que não manda aviso repetido e de que não grava dinheiro.

## o que eu aprendi

- **o erro mais perigoso em finanças é o que parece certo.** um total que parece certo e tá errado é pior que um erro na cara, e isso guiou quase todas as decisões ali em cima;
- **regra pura deixa o resto simples.** com o núcleo sem I/O, testar virada de ano e ano bissexto é só montar uma lista e conferir a saída;
- **limite do plano grátis também é requisito.** em vez de esconder o cache diário, o projeto foi pensado em volta dele;
- **escrever a decisão (e o que foi desfeito) evita ter a mesma conversa de novo.** o projeto tem um `AGENTS.md` com as regras e o porquê de cada uma.

## status

tá em uso aqui em casa. o código é privado, então não tem link pro repositório nem demo no ar.
