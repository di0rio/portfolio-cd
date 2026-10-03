# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences with equal weight:

- **Recruiters and tech leads** evaluating Cauã for a role. They skim: who he is, what he has shipped, how active he is, how to reach him.
- **Freelance clients** (clinics, small companies, agencies) checking whether he can build the interface of their product.
- **Other developers** arriving through the blog, GitHub, or community links, reading posts generated from his repositories.

## Product Purpose

Personal portfolio of Cauã Diorio, front-end developer. It is a living record, not a one-off launch: it grows as he builds interesting projects and levels up as a programmer. Success means the site stays current with little effort and honestly reflects his current level and work.

## Positioning

A front-end developer who cares about the details people see and use. The site itself demonstrates that craft, and it stays current on its own: content is pulled live from his GitHub (contribution graph, repositories tagged `portfolio` or `blog` become posts with their README as the body), so the portfolio updates itself as he works.

## Operating Context

- Built with Next.js 16 (App Router), Tailwind CSS v4, coss ui (Base UI), `better-intl` for translations, `next-themes` for light/dark.
- Content sources: colocated `t.ts` translation files for copy, `src/lib/site.ts` for personal data, GitHub API for blog posts and README content, a public contributions API for the activity graph. `GITHUB_TOKEN` is optional (rate limit 60 req/h without it).
- Blog convention: `README.md` in Portuguese, `README.en.md` in English; missing English falls back to Portuguese with a notice.
- Deploy target: Vercel (final domain undecided; `site.url` reads `VERCEL_PROJECT_PRODUCTION_URL`).

## Capabilities and Constraints

- Two locales, **pt and en with equal weight**; every user-facing string must exist in both (`onMissing: "error"`).
- Light, dark and system themes.
- Easter egg: typing `cd ..`, `cd ~` or `cd blog` anywhere navigates.
- Open / undecided: LinkedIn handle, contact email, CV file, final domain, real dates for the Loopvet experience entry, and whether projects link to repositories or live sites.

## Brand Commitments

- Name: Cauã Diorio; short name "cauã"; monogram "cd" (also a terminal pun used across the site).
- Voice: lowercase, casual Brazilian Portuguese ("pra", "digita"), direct and concrete; English mirrors that tone.
- Assets: illustrated avatar (`public/avatar.svg`), "cd" icon (`src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/favicon.ico`).

## Evidence on Hand

- Real projects: Loopvet (veterinary clinic management), Domus (CMS turned content marketing platform), Converter-Hub (in-browser file converters, public repo; shown under "featured on github", not duplicated in the projects list).
- Real activity: GitHub profile `di0rio` and its contribution history.
- Absent and not to be fabricated: testimonials, client logos, metrics, employment dates, star counts beyond what the GitHub API returns.

## Product Principles

1. Self-updating over hand-maintained: prefer content that flows from GitHub over copy that goes stale.
2. Honest level: show real work at its real stage; no inflated claims.
3. Bilingual parity: neither language is a second-class translation.
4. Quick to scan for recruiters, worth staying in for developers.
5. Personality in the details (terminal jokes, avatar), never at the cost of clarity.
