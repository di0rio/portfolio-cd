## tl;dr

loopvet hub is the workbench I use to move vet clinics from other systems into Loopvet. It puts three tools together: an **auditor** that shows what an import would do with the files **without writing a thing**; an **importer** that pushes the file queue through the real admin panel; and a **debts** tool that brings over what each client owed in the old system. The hub just opens and closes them, and each one runs in its own process with its own guardrails. It's a **personal project**: nobody asked for it, I built it for my own work, on top of the Loopvet API. The code is private, and there's no clinic data here.

## the problem

migrating a clinic means bringing over years of records: clients, patients, weights, vaccines, visits, exams, appointments. the data shows up as spreadsheets, already converted, and it has to land in Loopvet without breaking anything.

before the hub, every step was its own manual grind:

- uploading file after file in the panel and hoping it worked;
- finding out only **after** the import that a client file got rejected and took all of that client's patients with it;
- watching `Labrador` and `Labradro` turn into two different breeds, in records the clinic uses every single day;
- entering each client's debts with a script pasted into the browser console.

and the worst part: importing into production has **no undo**.

## the idea

pretty simple: whatever only **reads** lives on one side, whatever **writes** lives on the other. and that's baked into the architecture, so it doesn't depend on anyone remembering.

```text
            hub (launches and stops, knows nothing about clinics)
              │
   ┌──────────┼──────────────────┐
   ▼          ▼                  ▼
auditor    importer            debts
read-only  drives the panel    orders API
   │          │
   └── entities (shared package: what exists and in which order it goes up)
```

- **auditor:** answers, file by file, "if this went up right now, what would happen?". it shows rejections, files that would go up halfway, dropped rows, clients that would turn into ghosts and master data that would get duplicated. it only reads: it has no way to write anything, and it won't run outside the test environment.
- **importer:** instead of calling the API directly, it works the real admin panel the way a person would. it has a queue, an emergency stop, and it can pick up where it left off.
- **debts:** opens each client's debt as an open order through the orders API, no console script.
- **hub:** a bare Bun server. it starts the tool you opened, waits for it to answer and shuts it down when you leave.

## decisions

**each tool in its own process, no single app.** the auditor and the importer promise opposite things: one never writes, the other writes to production. if everything ran in one server, that promise would just be a code rule someone could forget. kept apart, the auditor doesn't even have the browser-automation library installed.

**the hub isn't Next.** it stays on all day, so how heavy it is matters. I measured it on the machine: an idle Next server used **382 MB**; the bare Bun hub, already serving, uses **22 MB**.

**measure before packaging.** the first idea was to package everything as a desktop app so it "wouldn't be heavy". once I measured, the weight was in the editor and the browser (over 8 GB together), not in the tool. a desktop shortcut solved "click and open" without any packager.

**open fast.** switching the tools from `next dev` to `next start` cut the time from click to screen from **2283 ms** to about **580 ms**.

**when in doubt, lock it.** in production, without a password, no route answers. opening without one only works on the machine itself and through the hub, both at once. one alone isn't enough: on its own, it would be a switch that turns security off.

**never kill an import halfway.** closing the hub shuts the tools down, except the one that says it's busy. the importer with a running queue stays up and tells you, because a file cut off mid-upload ends up in a state nobody can figure out.

**the clinic's ok is ticked, never guessed.** a migration only goes to production after the clinic checks everything in the test environment and confirms. that ok comes from a conversation between people, so it's a field someone ticks. nothing in the flow gets to assume an "ok" because nobody answered or because time passed, especially right before writing somewhere with no undo.

**one place for the truth.** the eleven import entities were copied across two repos, with 179 lines identical byte for byte. I merged everything into a monorepo, **keeping the history of both**, and the entities became a package both tools use.

## how I work on it

every change starts as a written task: why it matters, the risk, what it depends on and when to stop and ping me. bigger decisions become ADRs. AI plays separate roles:

- one model **does** the task's edits, with no terminal access;
- another, with a terminal, **checks**: runs tests, typecheck and lint, sees if the code drifted from the plan and starts the process to try it for real;
- I **decide** what goes in.

the bar is the same as CI: `bun test`, typecheck and lint on every push.

## by the numbers

- migrating into the test environment: before, **one a day**, eating the whole day; now **up to ten in the same day**, two in parallel, alongside other projects. the ceiling depends on how much data each clinic has;
- **3** tools and **11** import entities;
- **7** ADRs and **21** documented tasks;
- **43** test files and CI on every push and PR;
- a hub using **22 MB** of memory and tools opening in **~580 ms**.

## what's next

the hub already has a spot saved for Linear, Drive and the whole migration flow, from the issue to the production import. each one will come in as another tool, with its own process and guardrails. the hub keeps doing one thing only: opening and closing.
