## tl;dr

O fin é uma ferramenta de finanças da família, **somente leitura**. Ela conecta duas contas bancárias pelo Open Finance (via Pluggy), mostra tudo num dashboard e manda avisos no Discord: resumo do dia, fatura chegando, fatura que aumentou, gasto acima do normal e compra nova. Nunca move dinheiro, não tem banco de dados e não guarda nenhum valor em disco. O repositório é **privado**, porque o que ele mexe é dinheiro de verdade; aqui eu conto como funciona, sem mostrar dado nenhum.

## o problema

cada pessoa da família tem a própria conta, em bancos diferentes. pra saber quanto a casa gastou no mês, ou se a fatura do cartão subiu, era abrir dois apps e somar de cabeça.

eu queria duas coisas: uma visão única, e um aviso que chega sozinho, sem precisar lembrar de abrir nada.

## por que Pluggy (e o Meu Pluggy)

o Open Finance é o sistema regulado pelo Banco Central que deixa você autorizar um app a ler os dados da sua conta. a Pluggy é a ponte pra isso, mas o plano comercial dela custa R$ 2.500 por mês, inviável pra uso familiar.

o caminho que usei é o **Meu Pluggy**, o portal pessoal deles, com o **Conector 200**, que dá acesso à API dos próprios dados. é gratuito e sem prazo. o plano grátis tem um custo: o cache dos dados renova uma vez por dia, então nada aqui é tempo real (e eu aceitei isso, mais embaixo).

o lado bom é a privacidade: **cada pessoa autoriza o próprio banco**, no app do banco. ninguém vê a senha de ninguém, e o acesso é só de leitura.

## como é por dentro

o projeto tem três superfícies em cima do **mesmo núcleo**:

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

- **núcleo (`src/`):** TypeScript quase sem dependência, rodando direto no Node. é onde moram todas as regras, como funções puras. nenhuma das superfícies tem regra de negócio própria;
- **dashboard:** Next.js com três telas: início, o mês comparado ao anterior, e o dia. lê tudo em Server Component, e um `server-only` transforma em erro de build qualquer tentativa de puxar dado financeiro pro cliente;
- **notificador:** uma rota agendada na Vercel (Cron) roda duas vezes por dia, avalia as regras e manda os avisos no Discord. não depende de computador ligado;
- **relatório de terminal:** um comando pra conferir o que o núcleo entendeu dos extratos.

não existe banco de dados. as transações são lidas da fonte a cada execução, vivem em memória e somem quando o processo acaba.

## decisões

**somente leitura.** o fin nunca paga fatura, nunca transfere, nunca altera cadastro. é a regra número um, e a que mais me deixa tranquilo.

**dinheiro em centavos inteiros.** `0.1 + 0.2` dá `0.30000000000000004` em ponto flutuante, e o erro acumula. com inteiros isso não existe; a conversão pra reais só acontece na hora de formatar.

**datas como string `YYYY-MM-DD`, nunca `Date`.** `new Date("2026-01-31")` é meia-noite UTC, que no horário de Brasília vira dia 30 e joga a transação pro mês errado, sem erro nenhum. como string, o mês é um `slice(0, 7)` e a ordem cronológica é a ordem alfabética.

**mês é mês calendário; ciclo de fatura é outra coisa.** o mês vai do dia 1 ao último. o ciclo da fatura (fecha num dia, vence em outro, cada cartão no seu) só existe dentro do cálculo de faturas, e é feito por conta. misturar os lançamentos antes de calcular produziria um número plausível e errado, e tem teste só pra travar isso.

**nenhum valor financeiro em disco.** o único estado persistido é o do notificador, e ele guarda só a chave de cada aviso e a data de envio. as chaves de transação passam por um HMAC com segredo próprio, então o arquivo pode vazar sem revelar quanto ninguém gastou. um teste confere que nada com cara de dinheiro é gravado. credencial nunca fica em texto plano.

**aviso não sai duas vezes.** todo aviso tem uma chave estável, e o estado só é gravado **depois** de um envio bem-sucedido. se a rede cair, o aviso sai na próxima execução em vez de sumir pra sempre, e reenviar o mesmo lote não duplica nada.

**o resumo espera o dado chegar.** como o cache da Pluggy renova uma vez por dia, o resumo do dia anterior chegava atrasado ou incompleto. agora, se o dado é comprovadamente mais velho que ontem, o envio é segurado e a próxima execução tenta de novo.

**sem realtime, de propósito.** o dado só muda uma vez por dia, então um WebSocket ficaria aberto pra transmitir uma novidade que não existe. as telas leem a fonte a cada navegação, sem cache, porque número financeiro velho é número errado.

**linha descartada sempre é reportada.** nada some em silêncio: um total menor que o real, sem aviso, seria o pior defeito possível numa ferramenta dessas.

## testes

os testes usam `node:test`, sem framework, um arquivo por módulo, e passam de 350. a regra do projeto é que toda lógica de agregação financeira tem teste, cobrindo explicitamente virada de mês, virada de ano, ano bissexto, série vazia e divisão por zero. o notificador também tem teste de idempotência e da propriedade de não gravar dinheiro.

## o que eu aprendi

- **o erro mais perigoso em finanças é o que parece certo.** um total plausível e errado é pior que um erro explícito, e isso moldou quase todas as decisões acima;
- **regra pura faz o resto ficar simples.** com o núcleo sem I/O, testar virada de ano e ano bissexto vira só montar uma lista e conferir a saída;
- **limite do plano grátis também é requisito.** em vez de esconder o cache diário, o projeto foi desenhado em volta dele;
- **documentar a decisão (e o que foi revertido) evita refazer a mesma conversa.** o projeto tem um `AGENTS.md` com as regras e o porquê de cada uma.

## status

está em uso pela família. o código é privado, então não tem link pro repositório nem demo no ar.
