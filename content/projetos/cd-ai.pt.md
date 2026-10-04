## tl;dr

O cd-ai é um agente de código que roda **na sua máquina**, usando modelos locais pelo Ollama. Ele cuida do ciclo completo - do plano à validação - sem chamar uma API externa. O núcleo é feito em Rust, o app desktop usa Tauri e a interface, Next.js. A regra é simples: o modelo **propõe**; o código **decide**.

[código](https://github.com/di0rio/cd-ai)

## o problema

agente de código normalmente é um serviço: seu código sai da máquina e cada token custa dinheiro.

rodando local isso some. sem custo de token, os únicos limites são operacionais e de segurança: memória, tempo, número de iterações e loops. mas aparece outro problema: o modelo local erra mais, principalmente no formato das chamadas de ferramenta. no benchmark do projeto, o `qwen3-coder:30b` acertou 8 de 10 chamadas, e só com um parser tolerante.

então não dá pra confiar no modelo pra ser o sistema de segurança. quem cuida disso tem que ser código determinístico.

## a ideia

o modelo só **sugere** ações (ler um arquivo, editar, rodar um comando). cada ação passa por código que não lê o texto do modelo pra decidir nada:

- o caminho precisa estar dentro do workspace;
- o comando é classificado por regras fixas;
- a permissão sai de uma tabela;
- o resultado final é julgado por testes e checks, não pela opinião do modelo.

e tudo isso mora no Rust. a interface web nunca é fronteira de confiança.

## como fica

a CLI roda uma tarefa de ponta a ponta no terminal. pelo README:

```bash
cargo run -p cd-ai-cli -- task --model <modelo> [--workspace <pasta>] [--mode ask|auto|full-access] "<pedido>"
```

no modo padrão (ASK), cada escrita e cada comando que não seja leitura pedem aprovação no terminal (`Aprovar? [s/N]`). sem terminal interativo a ação é **negada**: não existe `--yes`. uma tarefa interrompida volta com `--resume <id>`, e o Ctrl+C cancela a tarefa e os processos filhos.

o desktop usa o mesmo núcleo, com a interface por cima. a mesma CLI, em modo headless, roda a suíte de eval:

```bash
cargo run -p cd-ai-cli -- eval --scripted
```

## como funciona por trás

o núcleo (`crates/agent-core`) é compartilhado. o desktop e a CLI são só adaptadores em volta dele, sem lógica de agente própria:

```text
                 ┌── desktop (src-tauri, Tauri)
agent-core ──────┤
 (Rust)          └── CLI headless (apps/cli), a mesma que roda o eval
```

e o ciclo de uma tarefa é uma máquina de estados em código, não um agente de LLM decidindo o que fazer a seguir:

```text
pedido ─► classifica ─► contexto ─► modelo ⇄ tool calls ─► verifier ─► relatório
                                         ▲                     │
                                         └── corrige (até o limite) ◄─ falhou
```

cada tool call passa por um funil antes de executar. os passos abaixo são esse funil, na ordem.

### 1. o caminho precisa ficar dentro do workspace

o `Workspace::resolve` (em `workspace.rs`) normaliza o caminho, deixa o sistema operacional resolver os symlinks na parte que já existe e confere se o destino final continua dentro da pasta aberta:

```rust
// 2. Let the OS resolve symlinks on the deepest part that exists; the rest are plain names to be created.
// A dangling symlink fails to canonicalize and is refused: writing through it could land anywhere.
let canonical = existing.canonicalize().map_err(|_| outside())?;
if !canonical.starts_with(&self.root) {
    return Err(outside());
}
```

`../`, symlink pra fora, symlink quebrado e (no Windows) nomes que o sistema trata como outra coisa são recusados. o modelo pedir um caminho não é motivo pro agente tocar nele.

### 2. o comando é classificado por regras, não por interpretação

antes de executar, o argv vira uma classe: `read`, `validate`, `write`, `network`, `destructive` ou `unknown`. o `classify` (em `permissions.rs`) olha o nome do programa e as flags:

```rust
// Basename only: `grep | xargs rm` must never become a `read`.
let basename = program.rsplit(['/', '\\']).next().unwrap_or(program).to_lowercase();
// …
let compound = argv.iter().any(|token| has_shell_metachar(token));
if compound {
    return most_dangerous(argv);
}
```

alguns detalhes que importam:

- comando composto (pipe, `&&`, `;`) assume a classe **mais perigosa** das partes;
- `./ls` ou `target/debug/cargo` não valem como `ls` e `cargo`: caminho qualificado cai em `unknown`, porque pode ser qualquer coisa que o agente construiu;
- `rg --pre` roda um programa arbitrário em cada arquivo, então deixa de ser leitura;
- um validador (teste, lint, build) roda código do próprio repositório, então opções como `cargo --config` que trocam o programa executado também derrubam pra `unknown`.

### 3. a permissão é uma tabela

o resultado da classe entra numa função pura, que **nunca lê texto do modelo nem saída de ferramenta**:

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

são três modos: ASK (o padrão), AUTO e FULL ACCESS. leitura de arquivo comum é automática, e arquivo de secret sempre pede. rede, comando destrutivo e comando desconhecido sempre pedem, em qualquer modo. o diálogo de aprovação mostra o comando completo ou o diff completo, nunca um resumo escrito pelo modelo.

### 4. sem sandbox, sem FULL ACCESS

validar o caminho não protege o shell: `run_command` pode fazer o que o usuário faria. por isso existe sandbox do sistema operacional:

- **Linux:** Landlock pro sistema de arquivos e um namespace de rede, sem rota pra fora (a menos que o comando seja `network` e aprovado);
- **macOS:** `sandbox-exec` com perfil Seatbelt;
- **Windows:** um AppContainer.

e o modo FULL ACCESS só existe se o sandbox estiver completo:

```rust
pub fn effective_mode(mode: PermissionMode, caps: SandboxCapabilities) -> PermissionMode {
    match mode {
        PermissionMode::FullAccess if !caps.ready() => PermissionMode::Ask,
        other => other,
    }
}
```

sem sandbox, todo comando fora da classe `read` pede aprovação, até os validadores. e o que roda **depois**, fora do sandbox (como `~/.cargo/bin`), nunca fica gravável: um comando não pode plantar um binário que o usuário vai executar em seguida.

### 5. secrets não chegam no modelo

o `redactor.rs` olha o **nome** do arquivo (`.env`, `id_rsa`, `.npmrc`, `.pem`…) e o **conteúdo**: prefixos conhecidos de token (`sk-`, `ghp_`, `AKIA`), blocos de chave privada, JWT, usuário e senha dentro de URL, `password=…` e `Bearer …`, e por último uma checagem de entropia:

```rust
const ENTROPY_WINDOW: usize = 32;
const ENTROPY_LIMIT: f64 = 4.7;
```

o que bate vira `[REDIGIDO:…]` antes de ir pro modelo. vale também pra saída de comando (um `env`, um stack trace), não só pra arquivo.

### 6. editar é trocar um trecho exato

pra arquivo existente, o modelo manda um bloco de busca e um de substituição. o `edit_file` tenta o match exato e depois um tolerante só a espaços em branco. sem match, devolve o erro pro modelo em vez de editar errado. depois da edição o arquivo passa por parse sintático, a escrita é atômica e o diff completo é o que o usuário aprova. arquivo de secret é negado direto.

as ferramentas são poucas: `read_file`, `list_directory`, `search`, `edit_file`, `write_file`, `run_command` e quatro de git (`git_status`, `git_diff`, `git_log` e `git_branch`).

### 7. o verifier julga, o modelo não

o `verify.rs` só **julga** o que já está no disco. primeiro o parse dos arquivos alterados e checks baratos de diff (lockfile mexido, arquivo de secret tocado, diff desproporcional). depois os comandos de validação **do próprio workspace** (descobertos de `package.json`, `Cargo.toml`…). uma frase do modelo dizendo "terminei" nunca conta como evidência: a tarefa só termina como `verified` se um comando de validação passou depois da última edição.

se falhar, o modelo volta pra corrigir, até um limite. há ainda um review opcional por LLM, que recebe só o diff e o resultado, e uma falha determinística sempre ganha de um "PASS" do modelo.

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

repetir a mesma tool call com os mesmos argumentos, ou o mesmo erro, é detectado e interrompe a tarefa (`LoopDetected`).

pra poder desfazer, o agente não depende do git do usuário. ele mantém um **repositório git sombra** com o git dir fora do projeto, e o workspace só como work tree. o `.git` do usuário nunca é tocado. o hash de cada arquivo escrito é registrado, e o rollback reverte só o que o agente mudou: se o usuário mexeu no arquivo depois, ele não restaura sem perguntar.

### contexto: compactar, não estender

a janela do `qwen3-coder:30b` é de 32k. perto de estourar, o histórico vira um resumo estruturado, feito só com fatos do engine (arquivos alterados, comandos rodados), e a tarefa segue num turno limpo. o progresso de verdade fica no disco, no git e nos checkpoints, não na memória do modelo. só o pedido do usuário sozinho não caber na janela dá `ContextExhausted`.

## decisões

as decisões estão em ADRs no repositório (`docs/decisions/`). as que mais moldaram o projeto:

**núcleo em Rust, compartilhado.** uma fronteira de confiança só, uma CLI headless natural pro eval, e nenhum segundo runtime no backend. a webview só apresenta dados e manda comandos por IPC.

**exclusivamente local na v1.** sem API externa, telemetria, login ou billing. o provider de modelo é uma interface abstrata só pra não acoplar o código a um provider específico.

**Next.js em static export.** o Tauri não tem runtime de servidor, então a interface não pode ter SSR, API routes nem Server Actions. toda operação com privilégio passa pelo Rust. a ADR registra o trade-off: a documentação do Tauri recomenda Vite, e o Next foi escolhido pela familiaridade.

**aprovação por padrão, só a segurança pausa.** o agente não para por custo ou quota, só por um pedido de aprovação ou cancelamento seu.

**modelos são configuração.** `qwen3:4b` (rápido), `qwen3-coder:30b` (coder) e alternativas são recomendações pro meu hardware, descobertas pelo provider, não dependências no código.

## status e próximos passos

o roadmap da especificação está fechado pro primeiro release Linux: núcleo, CLI, app desktop, permissões, sandbox, verifier, checkpoints, context manager, skills e roteador de modelo. a suíte de eval com o modelo roteirizado passa as 3 tarefas (`soma`, `greet` e `dobro`). ela é pequena de propósito: a meta é entre 20 e 50 tarefas.

o primeiro release só empacota `.deb` e AppImage (Linux x86_64). ficam pra depois:

- Flatpak, RPM, Windows e macOS;
- assinatura dos pacotes e atualização automática;
- medir a taxa de sucesso ao vivo com o `qwen3-coder:30b` numa máquina com Ollama.
