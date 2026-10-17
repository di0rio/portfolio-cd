# portfolio-cd

Cauã Diório's personal portfolio ([@di0rio](https://github.com/di0rio)), built with a focus on front-end development. Available in Portuguese and English, with light and dark themes and content that updates automatically from GitHub.

## How it works

The site is almost entirely rendered on the server (React Server Components). Each page fetches what it needs and builds the HTML; only the interactive parts (theme, command palette, contact form, `/lab` demos) run in the browser.

What happens on a visit:

1. **Locale**: `src/proxy.ts` reads the URL. `/blog` is rewritten to `/pt/blog` internally (the URL stays the same); `/en/blog` goes straight through. Details in [Locales and URLs](#locales-and-urls).
2. **Shell**: `src/app/[locale]/layout.tsx` renders what every page shares: header with navigation, footer, theme, command palette and analytics.
3. **Data**: the page combines three sources:
   - **GitHub** (`src/lib/github.ts`): blog posts, featured repositories, contributions and this site's commits. Responses are cached and revalidated every hour, so GitHub is not called on every visit.
   - **Repository files**: the project list (`src/lib/projects.ts`), case study text (`content/projetos/`) and screenshots/videos (`public/projects/`).
   - **UI copy**: the `t.ts` file in each folder, with pt and en side by side.
4. **Response**: the server sends finished HTML. If GitHub fails, the functions in `github.ts` return empty data and the section hides or shows a notice instead of breaking the page.

### Pages

| Route | What it shows | Source |
| --- | --- | --- |
| `/` | Bio, projects, experience, featured repositories and contribution graph | `src/app/t.ts` + GitHub |
| `/projetos`, `/projetos/<slug>` | Project case studies | `src/lib/projects.ts` + `content/projetos/<slug>.<pt\|en>.md` |
| `/blog`, `/blog/<repo>` | Posts written as repository READMEs | GitHub (see below) |
| `/agora` | What I'm building and learning right now, with the most recently updated repositories | GitHub + `src/app/agora/t.ts` |
| `/log` | This site's commit history, with a heatmap and filter | GitHub (this repo's commits) |
| `/lab` | Interactive component and animation demos | `src/components/lab/` |
| `/cv` | Resume, ready to print or save as PDF | `src/app/cv/t.ts` |
| `/freela` | Contact form delivered by email | `src/app/[locale]/freela/actions.ts` (Resend) |

Every page is listed in `sitemap.xml` in both languages. Posts and case studies generate their own preview image (OG); the rest use the homepage one.

### Projects (case studies)

To add a project:

1. Add the entry to `src/lib/projects.ts` (slug, name, stack, links).
2. Write the short description in `src/app/t.ts` and the case study copy in `src/app/projetos/t.ts`.
3. Write the text in `content/projetos/<slug>.pt.md` (and `<slug>.en.md`; without it, English falls back to Portuguese).
4. Optional: add the screenshot `public/projects/<slug>.webp` and, if there is one, the video `<slug>.mp4` + `<slug>-poster.webp`. The light theme version uses the `-light` suffix. Missing files are skipped at build time.

### Terminal extras

The site looks like a terminal, and you can navigate it like one:

- **Ctrl+K** (⌘K on Mac) opens the command palette with pages, posts and actions.
- Typing `cd blog`, `cd lab`, `cd <project>` or `cd ..` anywhere on the page navigates; `help` or `ls` lists the commands. Path logic lives in `src/components/site-shell/shell-routes.ts`.
- There is an easter egg (Konami code) and a message in the browser console.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) + [coss ui](https://coss.com/ui) (Base UI)
- [better-intl](https://www.npmjs.com/package/better-intl) for translations, [next-themes](https://github.com/pacocoursey/next-themes) for themes
- [Vercel Analytics](https://vercel.com/docs/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights)
- [Vercel BotID](https://vercel.com/docs/botid) on the contact form
- [Bun](https://bun.sh) for package management

## Run locally

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Other scripts: `bun run build`, `bun start`, `bun run lint`, `bun run typecheck`, and `bun test`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | No | Raises the GitHub API limit from 60 to 5,000 requests per hour and enables pinned repositories. Without it, the featured section shows repositories with the most stars. A classic token with no scopes is enough for public data. |
| `RESEND_API_KEY` | For `/freela` | [Resend](https://resend.com) key that emails the contact form. Without it, the form says sending is unavailable. |
| `CONTACT_EMAIL` | For `/freela` | Who receives the messages. Without a verified domain on Resend, it must be the Resend account email. |
| `CONTACT_FROM` | No | Sender on a verified domain. Defaults to `onboarding@resend.dev`. |

Create `.env.local` in the project root for local development. On Vercel, add it under *Settings → Environment Variables*.

## Data from GitHub

- **Contribution graph**: the profile's last year, through [github-contributions-api](https://github.com/grubersjoe/github-contributions-api).
- **Featured projects**: pinned profile repositories (with a token) or the repositories with the most stars (without one).
- **Blog**: every public repository tagged `portfolio` or `blog` becomes a post at `/blog/<repo>`, with its README as the content.
  - `README.md` is the Portuguese version; `README.en.md` is the English version. If the English version is missing, the post shows Portuguese with a notice.
  - Relative images and links in each README resolve automatically against GitHub.
- **Avatar**: the profile picture from GitHub.

Data refreshes hourly, except contributions, which refresh every 6 hours.

The blog is also published as an RSS feed: `/feed.xml` in Portuguese and `/en/feed.xml` in English.

## Where to edit

| What | File |
| --- | --- |
| Name, GitHub, LinkedIn, email, company, city, stack, domain | `src/lib/site.ts` |
| Resume (`/cv`, printable to PDF) | `src/app/[locale]/cv/page.tsx` + `src/app/cv/t.ts` |
| Pages (home, blog, 404) | `src/app/[locale]/` |
| Homepage copy (bio, projects, experience) | `src/app/t.ts` |
| Blog copy | `src/app/blog/t.ts` |
| Header, navigation, footer, theme, locale | `src/components/site-shell/` |
| Colors, fonts, animations | `src/app/globals.css` |
| Link preview image (OG) | `src/app/opengraph-image.tsx` |
| Blog RSS feed | `src/lib/feed.ts` |
| Contact form (sending, BotID, per-IP limit) | `src/app/[locale]/freela/actions.ts` |

### Locales and URLs

Portuguese uses the root paths (`/`, `/blog`); English uses `/en` (`/en`, `/en/blog`). Routes live under `src/app/[locale]/`; `src/proxy.ts` rewrites `/x` to `/pt/x` without changing the URL and redirects `/pt/...`. Each page declares `canonical` and `hreflang` metadata, and the sitemap lists both languages. Internal links use `localePath(locale, path)` (`src/i18n/path.ts`).

Each `t.ts` keeps both languages side by side (`{ pt, en }`). `src/i18n/generated.ts` is generated during `dev` and `build`; do not edit it by hand. A missing translation intentionally fails the build.

## Tests and CI

`bun test` runs unit tests for the pure parts: `src/lib/*.test.ts` (GitHub, contact, per-IP limit, reading time, slug), `src/proxy.test.ts` and `src/i18n/path.test.ts`.

On every push or PR to `main`, GitHub Actions (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `test` and `build`, in that order. Deployment is handled by Vercel.

## Design

- [`PRODUCT.md`](PRODUCT.md): audience, goals, and product principles.
- [`DESIGN.md`](DESIGN.md): the visual system, "The Home Terminal", including colors, typography, layout, components, and rules.

