## tl;dr

loopvet hub is the workbench I use to migrate veterinary clinics from other systems into Loopvet. It brings together three tools: an **auditor** that predicts what an import would do with the files, **without writing anything**; an **importer** that sends the file queue through the real admin panel; and a **debts** tool that carries over what each client owed in the old system. The hub only opens and closes them, and each one runs in its own process with its own safeguards. It's an **internal tool**: the code is private, and no clinic data appears here.

## the problem

migrating a clinic means bringing over years of records: clients, patients, weights, vaccines, visits, exams, appointments. the data arrives as spreadsheets, already converted, and has to land in Loopvet without breaking anything.

before the hub, every step was a different manual chore:

- uploading file after file in the panel and hoping it worked;
- finding out only **after** the import that a client file was rejected and took all of that client's patients with it;
- watching `Labrador` and `Labradro` become two different breeds, in records the clinic uses every day;
- entering each client's debts with a script pasted into the browser console.

and the worst detail: importing into production has **no undo**.

## the idea

keep what **reads** apart from what **writes**, and make that separation part of the architecture instead of a matter of good intentions.

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

- **auditor:** answers, file by file, "if this went up right now, what would happen?". it shows rejections, partial files, discarded rows, clients that would become ghosts and master data that would be duplicated. the only `POST` it ever makes is the login, and it aborts before any request if the target isn't the test environment.
- **importer:** instead of calling the API directly, it attaches to the already logged-in browser (via CDP) and operates the panel the way a person would. it has a queue, an emergency stop and resume.
- **debts:** opens each client's debt as an open order through the orders API, with no console script.
- **hub:** a bare Bun server that starts the tool you opened, waits for it to answer and stops it when you leave.

## decisions

**isolated processes, not one app.** the auditor and the importer have opposite guarantees: one never writes, the other writes to production. in a single server, that guarantee would become a coding convention. kept apart, the auditor doesn't even have the browser-automation library installed.

**the hub isn't Next.** the hub stays up all day, so its cost matters. measured on the machine: an idle Next server used **382 MB**; the bare Bun hub, already serving, uses **22 MB**.

**measure before packaging.** the original request was to package everything as a desktop app so it "wouldn't weigh on the machine". the measurement showed the weight was in the editor and the browser (over 8 GB together), not in the tool. a desktop shortcut solved "click and open" without the cost of a packager.

**open fast.** switching the tools from `next dev` to `next start` cut the time from click to screen from **2283 ms** to about **580 ms**.

**security that fails closed.** in production, without a password, every route returns 503. the single exception needs two things at once: the tool was launched by the hub, and the request comes from `127.0.0.1`. either one alone isn't enough: the variable by itself would be a switch that turns security off.

**never kill an import halfway.** closing the hub stops the tools, except one that reports work in progress. the importer with a running queue stays up and says so, because a file cut off mid-upload ends up in a state nobody can know.

**the client's sign-off is declared, never guessed.** a migration only goes to production after the clinic checks everything in the test environment and confirms. that approval comes from a conversation between people, so it's a field someone ticks. nothing in the flow may infer an "ok" from silence or elapsed time before writing somewhere with no undo.

**one source of truth.** the eleven import entities existed as copies in two repositories, with 179 lines identical byte for byte. I merged everything into a monorepo, **keeping the history of both**, and the entities became a package both tools use.

## how I work on it

every change starts as a written task: why it matters, the risk, what it depends on and when to stop and ask. bigger decisions become ADRs. AI takes part in separate roles:

- one model **executes** the task's edits, with no terminal access;
- another, with a terminal, **verifies**: it runs tests, typecheck and lint, checks the code didn't drift from the plan and starts the process to try it for real;
- I **decide** what goes in.

the gate is the same as CI: `bun test`, typecheck and lint on every push.

## by the numbers

- **3** tools and **11** import entities;
- **7** ADRs and **21** documented tasks;
- **43** test files and CI on every push and PR;
- a hub using **22 MB** of memory and tools opening in **~580 ms**.

## what's next

the hub already has room for Linear, Drive and the full migration flow, from the issue to the production import. each will arrive as one more tool, with its own process and safeguards. the hub keeps doing only one thing: opening and closing.
