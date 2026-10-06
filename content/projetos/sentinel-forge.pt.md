## tl;dr

O sentinel-forge é um motor de **detecção como código** em Go. As regras ficam em YAML versionado, passam por revisão e são validadas antes de rodar. O motor lê evento ou log de sshd e nginx e gera detecções que mostram de onde vieram: regra, versão, janela, limiar e técnica do MITRE ATT&CK. É onde eu estudo segurança, de hobby, na prática.

**projeto de estudo.** comecei sem saber Go. escrevi com o Claude Code: a IA me explica os conceitos, eu reviso cada mudança antes de entrar e decido o que o motor detecta e como isso é testado. é onde eu aprendo segurança e uma linguagem nova ao mesmo tempo.

[código](https://github.com/di0rio/sentinel-forge)

## o problema

lógica de detecção geralmente fica em dashboard e em query solta. isso dá três dores de cabeça:

- **difícil de revisar:** ninguém faz code review de um filtro no painel;
- **difícil de testar:** mudar a query pode quebrar a detecção sem ninguém perceber;
- **impossível de reproduzir:** meses depois, os mesmos dados não dão o mesmo alerta.

## a ideia

tratar detecção como código:

- **regra é YAML versionado**, revisado em PR e validado antes de rodar;
- **toda regra é testada** contra fixture de mentira, então uma mudança não quebra uma detecção calada;
- **toda detecção explica por que disparou**;
- **sempre o mesmo resultado:** as janelas usam o horário do evento, não o do relógio, então rodar os mesmos eventos de novo dá sempre a mesma resposta.

## como fica

### a regra

essa é a `AUTH-001`, em `rules/authentication/AUTH-001.yml`:

```yaml
id: AUTH-001
version: 1

name: Brute Force Authentication

description: >
  Detects repeated authentication failures
  from the same source IP.

severity: high

tags:
  - authentication
  - brute-force

when:
  type: authentication_failure

threshold:
  count: 10
  window: 60s

group_by:
  - network.sourceIp

attack:
  tactic: credential-access
  technique: T1110

references:
  - https://attack.mitre.org/techniques/T1110/
```

lendo de cima pra baixo: **10 eventos** do tipo `authentication_failure` **em 60 segundos**, contados **separado por IP de origem**, é um brute force (técnica T1110 do MITRE ATT&CK). todas as condições do `when` precisam bater, e o `group_by` mantém um contador pra cada valor.

### o log de entrada

o motor lê um `auth.log` no formato de verdade do sshd. um pedaço do arquivo de teste (`fixtures/authentication/auth.log`):

```text
Oct  3 14:31:05 bastion01 sshd[1180]: Accepted publickey for deploy from 198.51.100.7 port 50022 ssh2: ED25519 SHA256:EXAMPLEFINGERPRINTNOTAREALKEY0000000000000
Oct  3 14:31:58 bastion01 sshd[1244]: Failed password for alice from 192.0.2.18 port 49810 ssh2
Oct  3 14:32:04 bastion01 sshd[1244]: Failed password for alice from 192.0.2.18 port 49810 ssh2
Oct  3 14:32:09 bastion01 sshd[1244]: Accepted password for alice from 192.0.2.18 port 49810 ssh2
Oct  3 14:32:11 bastion01 sshd[1301]: Invalid user admin from 203.0.113.45 port 51234
Oct  3 14:32:12 bastion01 sshd[1301]: Failed password for invalid user admin from 203.0.113.45 port 51234 ssh2
Oct  3 14:32:14 bastion01 sshd[1303]: Failed password for root from 203.0.113.45 port 51240 ssh2
Oct  3 14:32:16 bastion01 sshd[1305]: Failed password for root from 203.0.113.45 port 51246 ssh2
Oct  3 14:32:18 bastion01 sshd[1307]: Invalid user test from 203.0.113.45 port 51252
Oct  3 14:32:19 bastion01 sshd[1307]: Failed password for invalid user test from 203.0.113.45 port 51252 ssh2
```

o arquivo inteiro tem 35 linhas: gente normal entrando, a `alice` errando a senha duas vezes e acertando, e um atacante em `203.0.113.45` tentando `admin`, `root`, `test`, `oracle`, `ubuntu` e `postgres` por uns 40 segundos. os IPs são de documentação (`192.0.2.0/24`, `198.51.100.0/24` e `203.0.113.0/24`), não são de ninguém de verdade.

### o replay

```bash
sentinelforge replay --format sshd --year 2026 fixtures/authentication/auth.log
```

o `--year` existe porque o timestamp clássico do syslog (`Oct  3 14:32:11`) não traz o ano. com ele fixo, o resultado se repete. a saída de verdade:

```text
SentinelForge Detection Engine

✓ 25 events processed
· 10 lines skipped (not security events)
✓ 2 rules evaluated

────────────────────────────────────────

🚨 Detection triggered

AUTH-001 v1
Brute Force Authentication

Severity:      HIGH
Group:         network.sourceIp=203.0.113.45
Matched:       14 events
Window:        42s (14:32:12 → 14:32:54)
Threshold:     10 events / 60s
MITRE ATT&CK:  T1110 (credential-access)

Reason:
14 events matched type=authentication_failure, reaching the threshold of 10 within 60s.

────────────────────────────────────────

1 detections in 10ms
```

de 35 linhas, 25 viraram evento e 10 foram descartadas porque não são evento de segurança (as linhas de sessão do PAM, do CRON, o `Server listening`…). a `alice` errou duas vezes, mas ficou abaixo do limiar: nada. o atacante errou 14 vezes em 42 segundos: uma detecção. e as 14 tentativas viraram **uma** detecção, não catorze.

### uma segunda regra, no nginx

a `WEB-001` (`rules/web/WEB-001.yml`) pega scanner de diretório e de vulnerabilidade, aquele que fica testando caminho que não existe:

```yaml
id: WEB-001
version: 1

name: Web Scanning

description: >
  Detects many 404 responses to the same source IP in a short time,
  typical of directory and vulnerability scanners probing for paths
  that do not exist. The status is compared as a string.

severity: medium

tags:
  - web
  - scanning
  - reconnaissance

when:
  type: http_request
  metadata.status: "404"

threshold:
  count: 20
  window: 60s

group_by:
  - network.sourceIp

attack:
  tactic: reconnaissance
  technique: T1595

references:
  - https://attack.mitre.org/techniques/T1595/
```

repara no `"404"` entre aspas: o status é comparado como texto. o log de acesso (`fixtures/web/scan.log`) mistura uso normal com um scanner (o user agent dele se apresenta como Nuclei):

```text
203.0.113.88 - - [03/Oct/2026:14:01:10 +0000] "GET /products/42 HTTP/1.1" 200 8140 "https://shop.example.test/products" "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0"
198.51.100.77 - - [03/Oct/2026:14:01:35 +0000] "GET /wp-login.php HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
198.51.100.77 - - [03/Oct/2026:14:01:37 +0000] "GET /.env HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
198.51.100.77 - - [03/Oct/2026:14:01:38 +0000] "GET /phpmyadmin/ HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
198.51.100.77 - - [03/Oct/2026:14:01:41 +0000] "GET /.git/config HTTP/1.1" 404 153 "-" "Nuclei - Open-source project (github.com/projectdiscovery/nuclei)"
```

```bash
sentinelforge replay --format nginx fixtures/web/scan.log
```

```text
SentinelForge Detection Engine

✓ 35 events processed
· 1 lines skipped (not security events)
✓ 2 rules evaluated

────────────────────────────────────────

🚨 Detection triggered

WEB-001 v1
Web Scanning

Severity:      MEDIUM
Group:         network.sourceIp=198.51.100.77
Matched:       25 events
Window:        32s (14:01:35 → 14:02:07)
Threshold:     20 events / 60s
MITRE ATT&CK:  T1595 (reconnaissance)

Reason:
25 events matched metadata.status=404, type=http_request, reaching the threshold of 20 within 60s.

────────────────────────────────────────

1 detections in 14ms
```

a linha descartada é uma linha do log de **erro** do nginx que foi parar no mesmo arquivo. o 404 solto do `favicon.ico` de outro IP nem chega perto de 20.

e validar as regras antes de rodar é um comando só:

```text
$ sentinelforge rules validate
✓ AUTH-001 v1  Brute Force Authentication
✓ WEB-001 v1  Web Scanning

2 rules valid
```

## como funciona por trás

```text
auth.log / access.log ─► parser ─┐
                                 ├─► eventos ─► ordena ─► engine ─► detecções
JSON de eventos ─► validação ────┘               ▲
regras YAML ─► parse estrito ────────────────────┘
```

### 1. o parser: log cru vira evento padronizado

o motor inteiro trabalha em cima de um evento só, com campos fixos: `type`, `source`, `actor.username`, `network.sourceIp`, `target.host` e `metadata.*`. é o formato do JSON de entrada:

```json
{"id": "evt_002", "timestamp": "2026-09-26T14:30:41Z", "source": "auth-service", "type": "authentication_failure", "actor": {"username": "bob"}, "network": {"sourceIp": "10.0.0.22"}, "metadata": {"method": "password"}}
```

os parsers (`internal/parser`) transformam uma linha de log nesse mesmo formato. o do sshd, por exemplo, é um conjunto de expressões ancoradas:

```go
sshdFailed   = regexp.MustCompile(`^Failed (\S+) for (invalid user )?(.+) from (\S+) port ([0-9]{1,5})(?: ssh2)?$`)
sshdInvalid  = regexp.MustCompile(`^Invalid user (.+) from (\S+)(?: port ([0-9]{1,5}))?$`)
sshdAccepted = regexp.MustCompile(`^Accepted (\S+) for (\S+) from (\S+) port ([0-9]{1,5})(?: ssh2)?(?::.*)?$`)
```

o sshd gera três tipos: `authentication_failure`, `authentication_success` e `invalid_user`. esse último é separado de propósito: o sshd loga `Invalid user` **antes** do `Failed password for invalid user` da mesma tentativa, então tratar os dois como falha ia contar uma tentativa duas vezes. o nginx gera `http_request`, com o status em `metadata.status` como texto.

e o ID do evento vem da fonte e do número da linha (`sshd-12`), então ler o mesmo arquivo duas vezes dá eventos iguaizinhos.

### 2. o motor: janela deslizante no tempo do evento

o `Engine.Evaluate` recebe um evento por vez e passa por cada regra. o estado fica separado por uma chave que junta **regra + tenant + valores do `group_by`**: é por isso que cada IP tem o seu contador.

```go
hits := append(prune(e.windows[key], ev.Timestamp.Add(-window)), hit{ev.ID, ev.Timestamp})
if len(hits) < r.Threshold.Count {
    e.windows[key] = hits
    continue
}
```

a cada evento que bate no `when`, o motor joga fora os acertos mais velhos que a janela (`prune`) e confere se o total chegou no limiar. o relógio é o `ev.Timestamp`, nunca o `time.Now()`. por isso o resultado é sempre o mesmo, e dá pra reproduzir um incidente daqui a seis meses.

o replay ordena os eventos por horário antes de mandar pro motor, porque o motor espera tudo em ordem.

### 3. proteção contra chuva de alerta

quando bate o limiar, a detecção fica **aberta**. enquanto chegarem acertos dentro da janela, eles **aumentam** essa detecção em vez de abrir outra:

```go
if d := e.open[key]; d != nil {
    if ev.Timestamp.Sub(d.Last) <= window {
        d.MatchedEvents = append(d.MatchedEvents, ev.ID)
        d.Last = ev.Timestamp
        continue
    }
    delete(e.open, key)
}
```

no log de exemplo, a décima falha do atacante (14:32:36) abre a detecção. as outras quatro (14:32:39, 43, 46 e 54) entram nela, e é por isso que o relatório fala **14** eventos. um ataque de mil tentativas é uma detecção, não cem.

### 4. a regra é uma linguagem pequena e travada, tratada como entrada que não dá pra confiar

a linguagem de regra é declarativa e **restrita**: sem expressão, sem template, sem rodar código. o `when` é só igualdade de texto (`campo: valor`), e os campos que uma regra pode citar são uma lista fixa. na hora de carregar (`internal/rule`):

- campo desconhecido no YAML **falha** (`yaml.Strict()`), e campo desconhecido no `when` ou no `group_by` também;
- o `id` tem que casar com `^[A-Z]+-[0-9]{3}$`, a severidade é `low`, `medium`, `high` ou `critical`, e a janela fica entre 0 e 24 horas;
- **alias de YAML é recusado**, e arquivo com mais de um documento também: expandir alias transforma umas centenas de bytes em gigabytes (o "billion laughs");
- arquivo de regra tem tamanho máximo (64 KiB), e symlink dentro da pasta de regras não é seguido;
- id duplicado é erro, e todos os erros de todos os arquivos voltam juntos.

um fuzz test (`FuzzParse`) já achou um caso em que o decodificador de YAML dava panic com uma tag malformada. agora arquivo ruim vira erro, não crash.

### 5. blindagem: log e evento também não dá pra confiar

um log pode ser escrito por quem tá atacando. por isso:

- linha tem limite de **64 KiB**. uma linha maior é rejeitada e a leitura continua na próxima. (um `bufio.Scanner` ia parar de vez nessa linha.)
- os padrões são ancorados e o `regexp` do Go roda em tempo linear, então não tem backtracking catastrófico;
- IP é validado com `net/netip` e padronizado (sem zona, IPv4-mapeado vira IPv4), então um host é sempre um grupo só;
- linha que não é evento de segurança ou que não passa na validação é **contada e pulada**, nunca derruba nada;
- o replay lê no máximo **64 MiB** (log maior tem que ser dividido) e acompanha no máximo **100.000 grupos** ao mesmo tempo. passou disso, o motor para com erro em vez de estourar a memória. a chave de estado tem o tamanho de cada parte na frente (`3:abc`), então valor com qualquer byte não colide com outra combinação de regra, tenant e grupo;
- na hora de imprimir, campo de evento e de regra vira texto limpo: um username de sshd com `\x1b[2J` ia redesenhar o terminal, então caractere de controle e invisível sai como `<U+XXXX>`:

```go
func unsafeRune(r rune) bool { return unicode.IsControl(r) || unicode.Is(unicode.Cf, r) }
```

## decisões

**declarativo e travado.** linguagem pequena é mais fácil de revisar, de validar e de proteger. uma regra não tem como rodar nada, porque a linguagem nem oferece isso.

**tempo do evento, não do relógio.** é isso que deixa a detecção reproduzível e testável com fixture.

**explica por padrão.** a saída fala a regra, a versão, o grupo, quantos eventos, a janela, o limiar, a técnica do ATT&CK e o motivo. dá pra entender o alerta sem abrir o código.

**um evento padrão.** parser novo só precisa gerar esse evento, e regra nova só precisa citar os campos dele. por isso a mesma `AUTH-001` serve pro JSON de teste e pro `auth.log`.

**na dúvida, falha seguro.** linha malformada é pulada e contada, estourar limite é erro na cara. o CI roda os testes com `-race`, lint, [govulncheck](https://go.dev/doc/security/vuln/) e [gitleaks](https://github.com/gitleaks/gitleaks) em todo push.

## status e próximos passos

o projeto tá no começo (pré-1.0): o núcleo de detecção funciona do começo ao fim, mas a API e o formato das regras ainda podem mudar. já tem motor de limiar, regra em YAML, CLI de replay e parser pro auth.log do sshd e pro access log do nginx.

um limite que o próprio código documenta: o motor espera os eventos em ordem de tempo (o replay ordena antes), e ainda não aguenta evento fora de ordem. um evento com horário muito no futuro ia expirar as janelas do grupo dele.

o que vem no roadmap:

- regras de sequência e correlação;
- alertas com deduplicação, supressão, cooldown e persistência;
- incidentes e linha do tempo;
- API HTTP e interface web;
- importar regras do Sigma.
