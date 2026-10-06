## tl;dr

cd-ai is a coding agent that runs **on your machine** with local models through Ollama. It does the whole loop, from planning to validation, without calling any outside API. The core is Rust, the desktop app is Tauri and the interface is Next.js. The rule is simple: the model **suggests**; the code **decides**.

**a study project.** I started without knowing Rust or Tauri. I built it with Claude Code: the AI explains the concepts, I review every change before it goes in, and I decide what the agent can and can't do. it's where I learn to read and review code in a language I don't master yet.

[code](https://github.com/di0rio/cd-ai)

## the problem

a coding agent is usually a service: your code leaves the machine and every token costs money.

running it locally makes that go away. no token cost, so the only limits are about operations and safety: memory, time, how many rounds and loops. but another problem shows up: a local model messes up more, mostly in the format of tool calls. in the project's benchmark, `qwen3-coder:30b` got 8 out of 10 calls right, and only with a tolerant parser.

so you can't trust the model to be the safety net. that job has to go to code that always answers the same way.

## the idea

the model only **suggests** actions (read a file, edit, run a command). every action goes through code that never reads the model's text to decide anything:

- the path has to be inside the workspace;
- the command is classified by fixed rules;
- the permission comes from a table;
- the final result is judged by tests and checks, not by the model's opinion.

and all of that lives in Rust. the web interface never gets to decide what's trusted.

## what it looks like

the CLI runs a task end to end in the terminal. from the README:

```bash
cargo run -p cd-ai-cli -- task --model <model> [--workspace <folder>] [--mode ask|auto|full-access] "<request>"
```

in the default mode (ASK), every write and every non-read command asks for approval in the terminal (`Aprovar? [s/N]`). with no interactive terminal the action is **denied**: there is no `--yes`. an interrupted task comes back with `--resume <id>`, and Ctrl+C cancels the task and its child processes.

the desktop app uses the same core, with the interface on top. the same CLI, headless, runs the eval suite:

```bash
cargo run -p cd-ai-cli -- eval --scripted
```

## how it works under the hood

the core (`crates/agent-core`) is shared. the desktop app and the CLI just wrap it, with no agent logic of their own:

```text
                 ┌── desktop (src-tauri, Tauri)
agent-core ──────┤
 (Rust)          └── headless CLI (apps/cli), the same one that runs the eval
```

and a task's loop is a state machine in code, not an LLM deciding what to do next:

```text
request ─► classify ─► context ─► model ⇄ tool calls ─► verifier ─► report
                                       ▲                    │
                                       └── fix (up to the limit) ◄─ failed
```

every tool call goes through a funnel before it runs. the steps below are that funnel, in order.

### 1. the path has to stay inside the workspace

`Workspace::resolve` (in `workspace.rs`) normalizes the path, lets the operating system resolve symlinks on the part that already exists and checks that the final destination is still inside the opened folder:

```rust
// 2. Let the OS resolve symlinks on the deepest part that exists; the rest are plain names to be created.
// A dangling symlink fails to canonicalize and is refused: writing through it could land anywhere.
let canonical = existing.canonicalize().map_err(|_| outside())?;
if !canonical.starts_with(&self.root) {
    return Err(outside());
}
```

`../`, a symlink pointing out, a dangling symlink and (on Windows) names the system treats as something else are refused. the model asking for a path is no reason for the agent to go touch it.

### 2. commands are sorted by rules, not by reading between the lines

before running, the argv becomes a class: `read`, `validate`, `write`, `network`, `destructive` or `unknown`. `classify` (in `permissions.rs`) looks at the program name and the flags:

```rust
// Basename only: `grep | xargs rm` must never become a `read`.
let basename = program.rsplit(['/', '\\']).next().unwrap_or(program).to_lowercase();
// …
let compound = argv.iter().any(|token| has_shell_metachar(token));
if compound {
    return most_dangerous(argv);
}
```

a few details that matter:

- a compound command (pipe, `&&`, `;`) takes the **most dangerous** class among its parts;
- `./ls` or `target/debug/cargo` don't count as `ls` and `cargo`: a qualified path falls to `unknown`, because it could be anything the agent built;
- `rg --pre` runs an arbitrary program on every file, so it stops being a read;
- a validator (test, lint, build) runs the repository's own code, so options like `cargo --config` that swap the program being run also drop it to `unknown`.

### 3. permission is a table

the class goes into a pure function that **never reads model text or tool output**:

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

there are three modes: ASK (the default), AUTO and FULL ACCESS. reading a regular file is automatic, and a secret file always asks. network, destructive and unknown commands always ask, in every mode. the approval dialog shows the full command or the full diff, never a summary written by the model.

### 4. no sandbox, no FULL ACCESS

checking the path doesn't protect the shell: `run_command` can do anything you could do. that's why there's an OS sandbox:

- **Linux:** Landlock for the file system and a network namespace with no route out (unless the command is an approved `network` one);
- **macOS:** `sandbox-exec` with a Seatbelt profile;
- **Windows:** an AppContainer.

and FULL ACCESS mode only exists if the sandbox is complete:

```rust
pub fn effective_mode(mode: PermissionMode, caps: SandboxCapabilities) -> PermissionMode {
    match mode {
        PermissionMode::FullAccess if !caps.ready() => PermissionMode::Ask,
        other => other,
    }
}
```

without a sandbox, every command outside the `read` class asks for approval, validators included. and what runs **later**, outside the sandbox (like `~/.cargo/bin`), is never writable: a command can't leave behind a binary you're about to run.

### 5. secrets don't reach the model

`redactor.rs` looks at the file **name** (`.env`, `id_rsa`, `.npmrc`, `.pem`…) and at the **content**: known token prefixes (`sk-`, `ghp_`, `AKIA`), private key blocks, JWTs, user and password inside URLs, `password=…` and `Bearer …`, and finally an entropy check:

```rust
const ENTROPY_WINDOW: usize = 32;
const ENTROPY_LIMIT: f64 = 4.7;
```

whatever matches becomes `[REDIGIDO:…]` before it goes to the model. that applies to command output too (an `env`, a stack trace), not just files.

### 6. editing is swapping an exact snippet

for an existing file, the model sends a search block and a replacement block. `edit_file` tries an exact match and then one that tolerates whitespace only. if nothing matches, it sends the error back to the model instead of editing the wrong thing. after the edit the file goes through a syntax parse, the write is atomic and the full diff is what the user approves. a secret file is denied outright.

the tools are few: `read_file`, `list_directory`, `search`, `edit_file`, `write_file`, `run_command` and four git ones (`git_status`, `git_diff`, `git_log` and `git_branch`).

### 7. the verifier is the judge, not the model

`verify.rs` only **judges** what's already on disk. first a parse of the changed files and cheap diff checks (a lockfile touched, a secret file touched, a disproportionate diff). then the **workspace's own** validation commands (found from `package.json`, `Cargo.toml`…). the model saying "done" never counts as proof: a task only ends as `verified` if a validation command passed after the last edit.

if it fails, the model goes back to fix it, up to a limit. there's also an optional LLM review, which receives only the diff and the result, and a deterministic failure always beats a model "PASS".

### 8. limits, loops and undo

the default limits live in a single struct:

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

repeating the same tool call with the same arguments, or the same error, is detected and stops the task (`LoopDetected`).

to be able to undo things, the agent doesn't lean on your git. it keeps a **shadow git repository** with the git dir outside the project and the workspace only as the work tree. your `.git` is never touched. the hash of every file written is recorded, and rollback only reverts what the agent changed: if you edited the file afterwards, it won't restore it without asking.

### context: summarize, don't stretch

`qwen3-coder:30b`'s window is 32k. near the limit, the history becomes a structured summary, built only from engine facts (changed files, commands run), and the task continues in a clean turn. real progress lives on disk, in git and in checkpoints, not in the model's memory. you only get `ContextExhausted` if the request alone doesn't fit in the window.

## decisions

the decisions are written down as ADRs in the repo (`docs/decisions/`). the ones that shaped the project the most:

**a shared Rust core.** one place deciding what's trusted, a headless CLI that fits the eval perfectly, and no second runtime on the backend. the webview only presents data and sends commands over IPC.

**local only in v1.** no external API, telemetry, login or billing. the model provider is an abstract interface only so the code doesn't get coupled to one specific provider.

**Next.js with static export.** Tauri has no server runtime, so the interface can't have SSR, API routes or Server Actions. every privileged operation goes through Rust. the ADR writes down the trade-off: Tauri's docs recommend Vite, and I went with Next because I already know it.

**approval by default, and only safety hits pause.** the agent doesn't stop for cost or quota, only for an approval request or for you cancelling.

**models are configuration.** `qwen3:4b` (fast), `qwen3-coder:30b` (coder) and alternatives are recommendations for my hardware, discovered through the provider, not dependencies in the code.

## status and next steps

the spec's roadmap is closed for the first Linux release: core, CLI, desktop app, permissions, sandbox, verifier, checkpoints, context manager, skills and the model router. the eval suite with the scripted model passes all 3 tasks (`soma`, `greet` and `dobro`). it's small on purpose: the goal is somewhere between 20 and 50 tasks.

the first release only packages `.deb` and AppImage (Linux x86_64). left for later:

- Flatpak, RPM, Windows and macOS;
- package signing and auto-update;
- measuring the live success rate with `qwen3-coder:30b` on a machine running Ollama.
