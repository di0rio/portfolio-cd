## tl;dr

fin is a **read-only** family finance tool. It connects two bank accounts through Open Finance (via Pluggy), shows everything in one dashboard, and sends alerts to Discord: a daily summary, an upcoming bill, a bill that grew, spending above normal, and new purchases. It never moves money, has no database, and stores no financial value on disk. The repository is **private**, because it deals with real money; here I explain how it works without showing any data.

## the problem

everyone in the family has their own account, at different banks. to know how much the household spent this month, or whether the credit card bill went up, I had to open two apps and add things up in my head.

I wanted two things: a single view, and an alert that arrives on its own, with nothing to remember to open.

## why Pluggy (and Meu Pluggy)

Open Finance is the system regulated by Brazil's central bank that lets you authorize an app to read your account data. Pluggy is the bridge to it, but its commercial plan costs R$ 2,500 a month, which makes no sense for a family.

the path I used is **Meu Pluggy**, their personal portal, with **Connector 200**, which gives API access to your own data. It's free, with no expiry. The free plan has a catch: the data cache refreshes once a day, so nothing here is real time (and I accepted that, more below).

the upside is privacy: **each person authorizes their own bank**, inside the bank's app. Nobody sees anyone's password, and access is read-only.

## how it works inside

the project has three surfaces on top of the **same core**:

```text
Pluggy ─► source (the only layer that knows where data comes from)
              │
              ▼
        services (pure rules: statements, bills, spending, alerts)
              │
   ┌──────────┼──────────────────────┐
   ▼          ▼                      ▼
dashboard   report               notifier
(Next.js)   (terminal)           (Vercel Cron ─► Discord)
```

- **core (`src/`):** TypeScript with almost no dependencies, running straight on Node. Every rule lives here, as a pure function. None of the surfaces has business logic of its own;
- **dashboard:** Next.js with three screens: home, the month compared to the previous one, and the day. It reads everything in Server Components, and a `server-only` import turns any attempt to pull financial data into the client into a build error;
- **notifier:** a scheduled Vercel route (Cron) runs twice a day, evaluates the rules, and sends the alerts to Discord. It doesn't depend on a computer being on;
- **terminal report:** a command to check what the core understood from the statements.

there is no database. Transactions are read from the source on every run, live in memory, and disappear when the process ends.

## decisions

**read-only.** fin never pays a bill, never transfers, never changes a registration. It's rule number one, and the one that lets me sleep at night.

**money as integer cents.** `0.1 + 0.2` gives `0.30000000000000004` in floating point, and the error accumulates. Integers don't have that problem; converting to reais only happens when formatting.

**dates as `YYYY-MM-DD` strings, never `Date`.** `new Date("2026-01-31")` is midnight UTC, which in Brasília time becomes the 30th and moves the transaction to the wrong month, with no error at all. As a string, the month is a `slice(0, 7)` and chronological order is alphabetical order.

**a month is a calendar month; a bill cycle is something else.** the month runs from the 1st to the last day. The bill cycle (it closes on one day, is due on another, each card on its own schedule) only exists inside the bill calculation, and it's done per account. Mixing the transactions before calculating would produce a plausible, wrong number, and there's a test just to lock that down.

**no financial value on disk.** the only persisted state belongs to the notifier, and it holds just the key of each alert and the send date. Transaction keys go through an HMAC with its own secret, so the file could leak without revealing how much anyone spent. A test checks that nothing that looks like money is written. Credentials are never in plain text.

**an alert never goes out twice.** every alert has a stable key, and the state is only saved **after** a successful send. If the network drops, the alert goes out on the next run instead of vanishing forever, and resending the same batch duplicates nothing.

**the summary waits for the data.** because the Pluggy cache refreshes once a day, the previous day's summary used to arrive late or incomplete. Now, if the data is provably older than yesterday, the send is held back and the next run tries again.

**no realtime, on purpose.** the data only changes once a day, so a WebSocket would sit open to broadcast news that doesn't exist. The screens read the source on every navigation, with no cache, because stale financial numbers are wrong numbers.

**a dropped line is always reported.** nothing disappears silently: a total lower than the real one, with no warning, would be the worst possible defect in a tool like this.

## tests

tests use `node:test`, no framework, one file per module, and there are over 350 of them. The project rule is that all financial aggregation logic has tests, explicitly covering month rollover, year rollover, leap year, empty series, and division by zero. The notifier also has tests for idempotency and for never writing money.

## what I learned

- **the most dangerous error in finance is the one that looks right.** a plausible, wrong total is worse than an explicit error, and that shaped almost every decision above;
- **pure rules keep everything else simple.** with a core free of I/O, testing a year rollover or a leap year is just building a list and checking the output;
- **a free-plan limit is a requirement too.** instead of hiding the daily cache, the project was designed around it;
- **writing down the decision (and what was reverted) saves repeating the same conversation.** the project has an `AGENTS.md` with the rules and the reason behind each one.

## status

it's in use by the family. The code is private, so there's no repository link or live demo.
