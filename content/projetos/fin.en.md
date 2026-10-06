## tl;dr

fin is our household finance tool, and it **only reads**. It hooks up two bank accounts through Open Finance (via Pluggy), shows everything on one dashboard and pings Discord: a daily summary, a bill coming up, a bill that went up, spending above normal and new purchases. It never touches money, has no database and keeps zero amounts on disk. The repo is **private**, because what's in there is real money; here I explain how it works without showing any data.

## the problem

everyone in the family has their own account, at different banks. to know how much the house spent this month, or whether the card bill went up, I had to open two apps and do the math in my head.

I wanted two things: everything in one place, and an alert that shows up on its own, with nobody having to remember to open anything.

## why Pluggy (and Meu Pluggy)

Open Finance is the system from Brazil's central bank that lets you authorize an app to read your account data. Pluggy is the bridge to it, but its commercial plan costs R$ 2,500 a month, which makes zero sense for a family.

what I used is **Meu Pluggy**, their personal portal, with **Connector 200**, which gives you API access to your own data. it's free and never expires. the free plan has a catch, though: the data cache refreshes once a day, so nothing here is real time (and I'm fine with that, more on it below).

the upside is privacy: **each person authorizes their own bank**, inside the bank's app. nobody sees anyone's password, and access is read-only.

## how it works inside

the project has three fronts on top of the **same core**:

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

- **core (`src/`):** TypeScript with almost no dependencies, running straight on Node. every rule lives here, as a pure function. none of the fronts has business logic of its own;
- **dashboard:** Next.js with three screens: home, the month next to the previous one, and the day. it reads everything in Server Components, and a `server-only` import breaks the build if anyone tries to pull financial data into the browser;
- **notifier:** a scheduled Vercel route (Cron) runs twice a day, goes through the rules and sends the alerts to Discord. no computer needs to be on;
- **terminal report:** a command to check what the core made of the statements.

there's no database. transactions get read from the source on every run, live in memory and are gone when the process ends.

## decisions

**read-only.** fin never pays a bill, never transfers, never changes an account. it's rule number one, and it's the one that lets me sleep at night.

**money as whole cents.** `0.1 + 0.2` gives you `0.30000000000000004` in floating point, and that error piles up. integers don't have that problem; turning it into reais only happens when it's shown on screen.

**dates as `YYYY-MM-DD` strings, never `Date`.** `new Date("2026-01-31")` is midnight UTC, which in Brasília time is the 30th and throws the transaction into the wrong month, without a single error. as a string, the month is a `slice(0, 7)` and date order is the same as alphabetical order.

**a month is a calendar month; a bill cycle is something else.** the month goes from the 1st to the last day. the bill cycle (closes one day, is due another, each card on its own schedule) only exists inside the bill math, and it's done account by account. mixing the transactions before the math gave a number that looks right and is wrong, and there's a test just to lock that down.

**no money amounts on disk.** the only thing saved is the notifier's state, and it holds just each alert's key and the send date. transaction keys go through an HMAC with its own secret, so if the file leaks you still can't tell how much anyone spent. a test checks that nothing that looks like money gets written. credentials are never in plain text.

**an alert never shows up twice.** every alert has a fixed key, and the state is only saved **after** the send works. if the network drops, the alert goes out on the next run instead of vanishing, and sending the same batch again doesn't duplicate anything.

**the summary waits for the data.** since the Pluggy cache refreshes once a day, the previous day's summary used to show up late or missing stuff. now, if the data is provably older than yesterday, the send waits and the next run tries again.

**no real time, on purpose.** the data only changes once a day, so a WebSocket would just sit there waiting for news that doesn't exist. the screens read the source on every navigation, no cache, because an old financial number is a wrong number.

**a dropped line always shows up.** nothing disappears quietly: a total lower than the real one, with no warning, would be the worst possible bug in a tool like this.

## tests

tests use `node:test`, no framework, one file per module, and there are over 350 of them. the project rule is that all money math has tests, covering month rollover, year rollover, leap year, empty lists and division by zero. the notifier also has tests that it never repeats an alert and never writes money.

## what I learned

- **the most dangerous error in finance is the one that looks right.** a total that looks right and is wrong is worse than an error in your face, and that drove almost every decision above;
- **pure rules keep the rest simple.** with a core free of I/O, testing a year rollover or a leap year is just building a list and checking the output;
- **a free-plan limit is a requirement too.** instead of hiding the daily cache, the project was built around it;
- **writing down the decision (and what got undone) saves having the same conversation twice.** the project has an `AGENTS.md` with the rules and the why behind each one.

## status

it's in use at home. the code is private, so there's no repo link or live demo.
