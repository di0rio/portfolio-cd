---
name: cauã · portfolio-cd
description: Personal portfolio of a front-end developer, a terminal you feel at home in.
colors:
  paper-cream: "#f6f4ee"
  paper-cream-raised: "#fbfaf6"
  graphite: "#1c1c1c"
  graphite-raised: "#222220"
  ink: "#262626"
  ink-muted: "#686868"
  chalk: "#f5f5f5"
  chalk-muted: "#818181"
  cursor-yellow: "#ffd23f"
  cursor-yellow-ink: "#7a5c00"
  heat-empty-light: "#e6e3d9"
  heat-empty-dark: "#2a2a27"
  heat-1: "#f6e3a0"
  heat-2: "#f2cf5e"
  heat-3: "#e0b320"
  heat-4: "#a98300"
typography:
  headline:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
  section:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Ubuntu, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  mono:
    fontFamily: "Ubuntu Mono, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  cell: "2px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
spacing:
  hairline: "3px"
  tight: "6px"
  item: "16px"
  block: "32px"
  section: "56px"
components:
  nav-link:
    textColor: "{colors.ink-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  nav-link-hover:
    textColor: "{colors.ink}"
  segmented-toggle:
    rounded: "{rounded.lg}"
    padding: "2px"
  post-card:
    backgroundColor: "{colors.paper-cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px 18px"
  inline-code:
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "0 6px"
  topic-chip:
    textColor: "{colors.ink-muted}"
    typography: "{typography.mono}"
    rounded: "9999px"
    padding: "0 8px"
---

# Design System: cauã · portfolio-cd

## Overview

**Creative North Star: "O Terminal de Casa" (The Home Terminal)**

The site is a terminal that feels like home. The `cd` monogram is both the owner's initials and the shell command, and that pun runs through the whole system: a prompt on the 404 page, a blinking yellow cursor, an easter egg that navigates when you type `cd ..`. It never becomes a costume, though. There is no green-on-black, no scanlines, no mono everywhere. The terminal shows up in the details while the page reads like a calm personal notebook.

Density is low on purpose. Everything lives in one centered 640px column, header and footer included, sections are separated by generous air, and almost everything is text, hairlines and a single warm accent. Personality lives in a few deliberate places: the illustrated avatar sticker and its speech bubble, the terminal prompt, the `cd ..` jokes. Everything else stays out of the way.

Both themes are warm rather than pure: cream paper instead of white, graphite instead of black, and yellow as the light source in either theme.

**Key Characteristics:**
- Calm and spare: one column, lots of space, flat surfaces.
- Playful in the details: avatar, `cd` jokes, blinking cursor, easter egg.
- Warm neutrals (cream / graphite) with one yellow accent.
- Lowercase voice in headings and UI copy.
- Real data as decoration: the GitHub contribution graph is the visual centerpiece of the home page.

## Colors

A warm two-theme neutral palette carrying one bright yellow accent that behaves like a cursor: small, bright, and always pointing at something.

### Primary
- **Cursor Yellow** (`cursor-yellow`): the single accent, the same in both themes. Used for the avatar's offset shadow, link underlines on hover, focus rings, the blog bullet squares, the 404 cursor, text selection (at 45%) and the top of the contribution heat scale. Never used as a large fill.
- **Cursor Yellow Ink** (`cursor-yellow-ink`): yellow darkened for legible text on cream. Light-theme link color. In dark theme, link text uses Cursor Yellow directly.

### Neutral
- **Paper Cream** (`paper-cream`): light-theme page background.
- **Paper Cream Raised** (`paper-cream-raised`): light cards, popovers, code blocks.
- **Graphite** (`graphite`): dark-theme page background.
- **Graphite Raised** (`graphite-raised`): dark cards, popovers, code blocks.
- **Ink** (`ink`) / **Chalk** (`chalk`): primary text in light / dark.
- **Ink Muted** (`ink-muted`) / **Chalk Muted** (`chalk-muted`): secondary text, dates, metadata, nav links at rest.
- **Hairline**: borders are black at 8% opacity on cream and white at 6% on graphite, never a solid gray.

### Heat scale
- **Heat Empty** (`heat-empty-light` / `heat-empty-dark`) through **Heat 1-4** (`heat-1` … `heat-4`): the contribution graph ramp, from almost-background to full yellow. In dark theme, levels 1-3 are Cursor Yellow at 28%, 50% and 75% opacity and level 4 is solid Cursor Yellow.

### Named Rules
**The Single Light Rule.** Yellow is the only chromatic color in the interface. If a second hue seems necessary, use weight, size or a hairline instead.

**The Warm Neutral Rule.** Never pure `#ffffff` or `#000000` as a page surface. Backgrounds are cream or graphite.

## Typography

**Body and headings:** Ubuntu (400 / 500 / 700)
**Mono:** Ubuntu Mono (400 / 700)

**Character:** Ubuntu's rounded, slightly quirky humanist forms make the page friendly without being childish. Ubuntu Mono is the same family, so terminal fragments sit naturally inside the prose.

### Hierarchy
- **Headline** (700, 28px, 1.25): blog post titles.
- **Title** (700, 22px, 1.25): page titles and the name next to the avatar.
- **Section** (500, 17px, 1.5): section headings ("projetos em que eu trabalhei", "escrita"). Deliberately close to body size; hierarchy comes from weight and space, not scale.
- **Body** (400, 15px, 1.65): the base size of the whole site, set on `<body>`. Paragraphs in Ink; descriptions and metadata in Ink Muted. Rendered READMEs use 16px / 1.75 inside `.markdown`.
- **Small** (400, 14px): dates, metadata, header tagline, footer, legends.
- **Mono** (400, 14px): inline code, topic chips, locale toggle (`pt` / `en`), the 404 prompt. Only for things that are literally code, commands or identifiers.

### Named Rules
**The Lowercase Voice Rule.** Headings, nav and UI labels are written in lowercase ("blog", "experiência", "voltar pro começo"). Proper nouns and acronyms (CMS, API, CV) keep their case.

**The Real Mono Rule.** Mono is for commands, code and identifiers. Never use it to make ordinary text look technical.

**The Tabular Dates Rule.** Dates and counts use tabular numerals so lists of dates align.

## Layout

- **All sizes:** one centered column, max 640px, 16px side padding. Header, `main` and footer share the same edges. There is no sidebar.
- **Header:** the prompt (`cd/ ~/section $▍`) on the left, section links in the middle, locale and theme on the right. Below 640px the links drop to their own row and scroll horizontally if needed.
- **Vertical rhythm:** 64px between sections in `main` (80px above the hero on desktop), 20px from a section title to its content, 16px of padding inside list rows. 96px bottom padding before the footer.
- **Footer:** a hairline on top; the credit on the left, the `cd ..` hint (as a `Kbd`) on the right. Social links live only in the hero buttons, not repeated here.

### Named Rules
**The One Column Rule.** Content never spans wider than 640px. New sections stack in the same column; they do not introduce side-by-side layouts at page level. Two exceptions on reading pages: media marked `wide` (case study screenshots) may grow to 1024px, and long posts get a table of contents in the right gutter from 1200px up (hidden below).

## Elevation & Depth

Flat. Surfaces sit on the page with 1px hairlines and tonal shifts (cream → raised cream, graphite → raised graphite). There are no ambient or structural shadows.

### Shadow Vocabulary
- **Avatar offset** (`box-shadow: 5px 5px 0 var(--brand)`): the one hard, zero-blur yellow shadow, on the avatar only. It is a signature, not a system.

### Named Rules
**The Flat-By-Default Rule.** No shadows on cards, lists or sections. Hover states change border or background color, never elevation.

**The One Sticker Rule.** The hard yellow offset shadow belongs to the avatar alone. Do not copy it onto buttons or cards.

## Shapes

Soft but not bubbly. Interactive controls use 8-10px corners, content cards 14px, the avatar 18px. Contribution cells are nearly square (2px). Topic chips are the only full pills. Borders are always 1px hairlines; the avatar is the one element with a 2px solid black border.

Prefer plain stacked lists (title, then a one-line description, 24px between items) over cards or dividers. Cards are for the /lab stages and cd/ui docs only.

## Components

### Header prompt and navigation
- **Prompt:** mono, `cd/` in bold Ink with a Cursor Yellow Ink slash, then `~/<section> $` in muted text and a blinking yellow block cursor (static under reduced motion). It links home and always shows where you are.
- **Links:** projetos, lab, blog, CV (four, on purpose) as plain small muted text. Hover turns them Ink (150ms). The current page gets Ink text with a 2px Cursor Yellow underline (6px offset).
- **Social:** GitHub and LinkedIn live in the hero buttons and as icon links in the footer, not in the header.

### Home (quiet, Emil-style)
- **Identity row:** the avatar sticker (64px, 16px radius, 2px black border, hard 4px yellow offset shadow, tilted -3°, straightens on hover) with the comic bubble ("e aí!" / "hey!") on its top-right corner, then name (Ubuntu Medium 15px) and role · city (muted). Nothing bigger than 15px on the page.
- **Sections** are only: hoje (two short sentences in Ink + contact buttons), projetos (curated list), escrita (when there are posts). Experience is said in the "hoje" sentence; the full history lives in /cv.
- **Projects list:** name in Ink, one-line description in Ink Muted, written by hand in both languages (never the raw GitHub description). On the right: "ver ↗" when there is a public link, otherwise a muted status ("na loopscape", "em breve"). A single muted line below the list carries the GitHub contribution count; there is no contribution grid.
- **Speech bubble animation:** pops in once, 450ms after load, from scale 0.85 with a slight rotation (360ms strong ease-out); reduced motion only fades it in.

### Section titles
- A quiet muted label in body size (no weight change, no rule line), with an optional muted action on the right ("todos os repositórios ↗").

### Links in lists
- Rows are never clickable as a whole and have no hover background. The only action is a small "ver ↗" at the end of the row. Hovering the row turns that link Ink and nudges the arrow 2px up-right while it turns Cursor Yellow Ink (200ms).

### Locale switch
- **Style:** two real links (`pt` / `en`, mono) inside a 1px hairline pill with 2px padding. Each language is its own URL; the current one gets a 4% tint and `aria-current`.
- **Theme button:** a single outline icon button (cd/ui `Button`, `icon-sm`) that flips light ↔ dark. It shows a moon in light theme and a sun in dark theme, with an `aria-label` naming the theme it switches to. Same 0.98 press. It starts from the system theme; there is no separate "system" option.
- **Locale change:** while the server re-renders, `main` fades to 60% opacity (150ms), then returns. No blur.

### Blog list
- **Shape:** plain stacked list, no cards. Date (and reading time for notes) in a 7.5rem column on desktop, above the title on mobile; tabular numerals, not mono.
- **Row:** the whole row is the link (the post is the only action). Hover/focus turns the title underline Cursor Yellow and nudges the arrow 2px right (150ms); focus also gets the ring, never motion.
- **Entry:** rows rise in once on first paint (6px, 220ms ease-out, 40ms steps capped at 8); opacity only under reduced motion. The title morphs into the post header through a view transition.

### Post page
- 2px Cursor Yellow reading-progress bar driven by the scroll timeline (CSS only, linear, `scaleX`); hidden under reduced motion or without scroll timelines.
- h2/h3 carry ids and a hover `#` anchor. Code blocks get a bar with the language and a copy button (press 0.97, icon swap with a 2px blur crossfade).
- Table of contents (h2s) in the gutter from 1200px; the current section changes color and its 1px rule, nothing moves.

### Log timeline
- One 1px rail with a Cursor Yellow dot per day. Rows: mono sha chip (links to GitHub), an optional muted chip for a `Tag:` or `type(scope):` prefix, the subject, relative time (full date in `title`). Rows get a faint hover tint, the one place a list row has a hover background, because each row is a dense record you scan by pointer.
- Above the timeline, a one-year heatmap of the site's own commits (heat ramp, fluid cells: the whole year fits the column, no scrolling). Days with commits are buttons (roving tabindex, arrows move); clicking one, or a tag chip, filters the list and writes `?dia=` / `?tag=` to the URL with `history.replaceState` (a router navigation would replay the page transition). Filtering never animates.
- /agora shows the same heatmap, static, with the whole-GitHub contribution year.

### Topic chips
- **Style:** full pill, hairline border, mono 12px, Ink Muted, 8px horizontal padding. Read-only labels, not filters.

### Terminal fragments (signature)
- Mono lines styled as a shell: a Cursor Yellow Ink `~`, a muted `$`, the command, then output in Ink. The 404 page ends with a blinking yellow block cursor (`caret-blink`, 1s), static under reduced motion.
- The footer hint renders `cd ..` as inline code on a 4% tint with an 8px radius.

### Lab (`/lab`)
- A page of live interaction experiments. Each one is a section: lowercase title, one sentence explaining the technique, then a **stage** (raised surface, hairline, 14px radius, min 160px tall, content centered).
- Current experiments: hold-to-confirm (yellow `clip-path` fill, 1.6s linear while holding, 200ms back on release), copy button with blurred icon swap (200ms), clip-path tabs (inverted copy of the list clipped to the active tab, 250ms ease-in-out), and a mock terminal that navigates the site (no animation, keyboard-first).
- New experiments follow the same rules as the rest of the site: yellow is the only accent, motion has a named purpose, reduced motion is handled.

### Page transitions
- Route changes use the View Transitions API through React `<ViewTransition>` around `<main>`: the old content fades out in 120ms, the new one rises 6px out of a 2px blur in 240ms (strong ease-out, 60ms delay). Header and footer don't animate.
- Blog titles morph from the list into the post header (`share="morph"`, 320ms ease-in-out).
- Reduced motion: plain 160ms fade, no movement, no morph.

### Markdown (blog posts)
- 16px body at 1.75 line-height; h1/h2/h3 in bold Ubuntu at 24/20/18px with 36px space above; links in Cursor Yellow Ink with underline; blockquotes with a 1px hairline left rule and italic muted text; code blocks on raised surface with a hairline and 14px radius.

## Do's and Don'ts

### Do:
- **Do** keep motion light: only real buttons get press feedback (scale 0.98, 100ms); links and cards change color only.
- **Do** keep Cursor Yellow the only accent, and keep it small: underlines, rings, bullets, cursor, heat scale.
- **Do** use cream / graphite surfaces and 1px alpha hairlines (black 8% / white 6%).
- **Do** write UI copy and headings in lowercase, in both pt and en.
- **Do** use strong ease-out curves (`cubic-bezier(0.23, 1, 0.32, 1)`) with 150-200ms for interface feedback, and gate any movement behind reduced-motion preferences.
- **Do** separate list items with hairline dividers instead of boxing each one.
- **Do** use tabular numerals for dates and counts.

### Don't:
- **Don't** add shadows for elevation; hover changes color or border, not depth.
- **Don't** reuse the avatar's hard yellow offset shadow anywhere else.
- **Don't** use mono as decoration on ordinary text.
- **Don't** introduce a second accent hue or pure white/black page backgrounds.
- **Don't** widen content past the 640px column or add page-level multi-column layouts.
- **Don't** animate keyboard-triggered actions (the `cd` easter egg navigates instantly).
