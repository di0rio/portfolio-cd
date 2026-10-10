## tl;dr

O cd-ai é um agente de código que roda **na sua máquina**, com modelo local pelo Ollama. Ele faz o ciclo inteiro, do plano à validação, sem chamar API de fora. O núcleo é em Rust, o app desktop usa Tauri e a interface é Next.js. O modelo **sugere**, e quem **decide** é o código.

**projeto de estudo.** comecei sem saber Rust nem Tauri. escrevi com o Claude Code: a IA me explica os conceitos, eu reviso cada mudança antes de entrar e decido o que o agente pode ou não fazer. é onde eu aprendo a ler e revisar código numa linguagem que ainda não domino.

[código](https://github.com/di0rio/cd-ai)

## o problema

agente de código geralmente é um serviço: seu código sai da máquina e cada token custa dinheiro.

rodando local isso some. sem custo de token, os únicos limites são de operação e de segurança: memória, tempo, número de voltas e loop. só que aparece outro problema: modelo local erra mais, principalmente no formato das chamadas de ferramenta. no benchmark do projeto, o `qwen3-coder:30b` acertou 8 de 10 chamadas, e isso só com um parser tolerante.

então não dá pra confiar no modelo pra ser a segurança. quem cuida disso tem que ser código que sempre responde igual.

## a ideia

o modelo só **sugere** ação (ler um arquivo, editar, rodar um comando). cada ação passa por código que não lê o texto do modelo pra decidir nada:

- o caminho tem que estar dentro do workspace;
- o comando é classificado por regras fixas;
- a permissão sai de uma tabela;
- o resultado final é julgado por teste e check, não pela opinião do modelo.

e tudo isso fica no Rust. a interface web nunca é onde se decide o que é confiável.

## como fica

a CLI roda uma tarefa do começo ao fim no terminal. pelo README:

```bash
cargo run -p cd-ai-cli -- task --model <modelo> [--workspace <pasta>] [--mode ask|auto|full-access] "<pedido>"
```

no modo padrão (ASK), toda escrita e todo comando que não seja leitura pedem aprovação no terminal (`Aprovar? [s/N]`). sem terminal interativo a ação é **negada**: não existe `--yes`. uma tarefa interrompida volta com `--resume <id>`, e o Ctrl+C cancela a tarefa e os processos filhos.

o desktop usa o mesmo núcleo, com a interface por cima. a mesma CLI, sem interface, roda a suíte de eval:

```bash
cargo run -p cd-ai-cli -- eval --scripted
```

## como funciona por trás

o núcleo (`crates/agent-core`) é compartilhado. o desktop e a CLI só fazem a ponte com ele, sem lógica de agente própria:

```text
                 ┌── desktop (src-tauri, Tauri)
agent-core ──────┤
 (Rust)          └── CLI headless (apps/cli), a mesma que roda o eval
```

e o ciclo de uma tarefa é uma máquina de estados em código, não um LLM decidindo o que fazer depois:

```text
pedido ─► classifica ─► contexto ─► modelo ⇄ tool calls ─► verifier ─► relatório
                                         ▲                     │
                                         └── corrige (até o limite) ◄─ falhou
```

toda tool call passa por um funil antes de executar. os passos abaixo são esse funil, na ordem.

### 1. o caminho tem que ficar dentro do workspace

o `Workspace::resolve` (no `workspace.rs`) normaliza o caminho, deixa o sistema operacional resolver os symlinks na parte que já existe e confere se o destino final continua dentro da pasta aberta:

```rust
// 2. Let the OS resolve symlinks on the deepest part that exists; the rest are plain names to be created.
// A dangling symlink fails to canonicalize and is refused: writing through it could land anywhere.
let canonical = existing.canonicalize().map_err(|_| outside())?;
if !canonical.starts_with(&self.root) {
    return Err(outside());
}
```

`../`, symlink pra fora, symlink quebrado e (no Windows) nome que o sistema trata como outra coisa são recusados. o modelo pedir um caminho não é motivo pro agente mexer nele.

### 2. o comando é classificado por regra fixa

antes de rodar, o argv vira uma classe: `read`, `validate`, `write`, `network`, `destructive` ou `unknown`. o `classify` (no `permissions.rs`) olha o nome do programa e as flags:

```rust
// Basename only: `grep | xargs rm` must never become a `read`.
let basename = program.rsplit(['/', '\\']).next().unwrap_or(program).to_lowercase();
// …
let compound = argv.iter().any(|token| has_shell_metachar(token));
if compound {
    return most_dangerous(argv);
}
```

uns detalhes que importam:

- comando composto (pipe, `&&`, `;`) pega a classe **mais perigosa** das partes;
- `./ls` ou `target/debug/cargo` não contam como `ls` e `cargo`: caminho com pasta cai em `unknown`, porque pode ser qualquer coisa que o agente montou;
- `rg --pre` roda um programa qualquer em cada arquivo, então deixa de ser leitura;
- um validador (teste, lint, build) roda código do próprio repositório, então opção tipo `cargo --config`, que troca o programa que vai rodar, também derruba pra `unknown`.

### 3. a permissão é uma tabela

a classe entra numa função pura, que **nunca lê texto do modelo nem saída de ferramenta**:

```rust
PermissionKind::RunCommand { class } => match class {
    CommandClass::Read => Policy::Auto,
    CommandClass::Validate if caps.filesystem => Policy::Auto,
    CommandClass::Validate => Policy::Ask,
    CommandClass::Write => match mode {
        PermissionMode::Ask => Policy::Ask,
        PermissionMode::Auto | PermissionMode::FullAccess if caps.filesystem => Policy::Auto,
        PermissionMode::Auto | PermissionMode::FullAccess => Policy::Ask,
    },
    CommandClass::Network | CommandClass::Destructive | CommandClass::Unknown => Policy::Ask,
},
```

são três modos: ASK (o padrão), AUTO e FULL ACCESS. ler arquivo comum é automático, e arquivo de secret sempre pede. rede, comando destrutivo e comando desconhecido sempre pedem, em qualquer modo. a tela de aprovação mostra o comando inteiro ou o diff inteiro, nunca um resumo escrito pelo modelo.

### 4. sem sandbox, sem FULL ACCESS

checar o caminho não protege o shell: o `run_command` pode fazer qualquer coisa que o usuário faria. por isso tem sandbox do sistema operacional:

- **Linux:** Landlock pro sistema de arquivos e um namespace de rede sem saída pra fora (a não ser que o comando seja `network` e tenha sido aprovado);
- **macOS:** `sandbox-exec` com perfil Seatbelt;
- **Windows:** um AppContainer.

e o modo FULL ACCESS só existe se o sandbox tiver completo:

```rust
pub fn effective_mode(mode: PermissionMode, caps: SandboxCapabilities) -> PermissionMode {
    match mode {
        PermissionMode::FullAccess if !caps.ready() => PermissionMode::Ask,
        other => other,
    }
}
```

sem sandbox, todo comando fora da classe `read` pede aprovação, até os validadores. e o que roda **depois**, fora do sandbox (tipo `~/.cargo/bin`), nunca fica liberado pra escrita: um comando não pode deixar plantado um binário que você vai rodar em seguida.

### 5. secret não chega no modelo

o `redactor.rs` olha o **nome** do arquivo (`.env`, `id_rsa`, `.npmrc`, `.pem`…) e o **conteúdo**: prefixo conhecido de token (`sk-`, `ghp_`, `AKIA`), bloco de chave privada, JWT, usuário e senha dentro de URL, `password=…` e `Bearer …`, e por último uma checagem de entropia:

```rust
const ENTROPY_WINDOW: usize = 32;
const ENTROPY_LIMIT: f64 = 4.7;
```

o que bate vira `[REDIGIDO:…]` antes de ir pro modelo. vale pra saída de comando também (um `env`, um stack trace), não só pra arquivo.

### 6. editar é trocar um trecho exato

pra arquivo que já existe, o modelo manda um bloco de busca e um de substituição. o `edit_file` tenta o match exato e depois um que só ignora espaço em branco. se não achar, devolve o erro pro modelo em vez de editar errado. depois da edição o arquivo passa por um parse de sintaxe, a escrita é atômica e o que você aprova é o diff completo. arquivo de secret é negado direto.

as ferramentas são poucas: `read_file`, `list_directory`, `search`, `edit_file`, `write_file`, `run_command` e quatro de git (`git_status`, `git_diff`, `git_log` e `git_branch`).

### 7. quem julga é o verifier

o `verify.rs` só **julga** o que já tá no disco. primeiro faz o parse dos arquivos alterados e uns checks baratos no diff (lockfile mexido, arquivo de secret tocado, diff grande demais pro pedido). depois roda os comandos de validação **do próprio workspace** (achados no `package.json`, no `Cargo.toml`…). o modelo falar "terminei" nunca conta como prova: a tarefa só termina como `verified` se um comando de validação passou depois da última edição.

se falhar, o modelo volta pra corrigir, até um limite. tem também um review opcional por LLM, que recebe só o diff e o resultado, e uma falha determinística sempre ganha de um "PASS" do modelo.

### 8. limites, loop e desfazer

os limites padrão ficam num struct só:

```rust
Self {
    max_iterations: 30,
    max_model_retries: 2,
    max_invalid_tool_calls: 3,
    max_correction_retries: 3,
    llm_review: true,
    model_turn_timeout_ms: 300_000,
    task_timeout_ms: 45 * 60 * 1_000,
}
```

repetir a mesma tool call com os mesmos argumentos, ou o mesmo erro, é detectado e para a tarefa (`LoopDetected`).

pra poder desfazer, o agente não depende do teu git. ele mantém um **repositório git sombra**, com o git dir fora do projeto e o workspace só como work tree. o teu `.git` nunca é tocado. o hash de cada arquivo escrito fica registrado, e o rollback desfaz só o que o agente mudou: se você mexeu no arquivo depois, ele não restaura sem perguntar.

### contexto: resumir quando a janela enche

a janela do `qwen3-coder:30b` é de 32k. quando tá perto de estourar, o histórico vira um resumo organizado, feito só com fatos do próprio motor (arquivos alterados, comandos rodados), e a tarefa segue num turno limpo. o progresso de verdade fica no disco, no git e nos checkpoints, não na memória do modelo. só dá `ContextExhausted` se o pedido sozinho não couber na janela.

## decisões

as decisões tão em ADRs no repositório (`docs/decisions/`). as que mais mudaram o projeto:

**núcleo em Rust, compartilhado.** um lugar só decidindo o que é confiável, uma CLI sem interface que serve direto pro eval, e nenhum segundo runtime no backend. a webview só mostra dado e manda comando por IPC.

**só local na v1.** sem API de fora, telemetria, login ou cobrança. o provider de modelo é uma interface abstrata só pra não amarrar o código num provider específico.

**Next.js em static export.** o Tauri não tem servidor rodando, então a interface não pode ter SSR, API routes nem Server Actions. toda operação com privilégio passa pelo Rust. a ADR registra a troca: a documentação do Tauri recomenda Vite, e eu escolhi o Next porque já conheço.

**aprovação por padrão, e só segurança pausa.** o agente não para por custo ou cota, só pra pedir tua aprovação ou se você cancelar.

**modelo é configuração.** `qwen3:4b` (rápido), `qwen3-coder:30b` (coder) e as alternativas são recomendações pro meu hardware, descobertas pelo provider, não dependência no código.

## status e próximos passos

o roadmap da especificação tá fechado pro primeiro release no Linux: núcleo, CLI, app desktop, permissões, sandbox, verifier, checkpoints, context manager, skills e roteador de modelo. a suíte de eval com o modelo roteirizado passa as 3 tarefas (`soma`, `greet` e `dobro`). ela é pequena de propósito: a meta é ter entre 20 e 50 tarefas.

o primeiro release só empacota `.deb` e AppImage (Linux x86_64). fica pra depois:

- Flatpak, RPM, Windows e macOS;
- assinatura dos pacotes e atualização automática;
- medir a taxa de acerto ao vivo com o `qwen3-coder:30b` numa máquina com Ollama.
