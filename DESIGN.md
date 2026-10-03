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

Density is low on purpose. One narrow reading column (600px) sits between a quiet sidebar and empty space, sections are separated by generous air, and almost everything is text, hairlines and a single warm accent. Personality lives in a few deliberate places: the illustrated avatar, the contribution graph, the terminal jokes. Everything else stays out of the way.

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
- **Heat Empty** (`heat-empty-light` / `heat-empty-dark`) through **Heat 1–4** (`heat-1` … `heat-4`): the contribution graph ramp, from almost-background to full yellow. In dark theme, levels 1–3 are Cursor Yellow at 28%, 50% and 75% opacity and level 4 is solid Cursor Yellow.

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
- **Body** (400, 16px, 1.5): bio, descriptions, rendered READMEs (line-height 1.75 inside `.markdown`). Bio is capped at about 520px.
- **Small** (400, 14px): dates, metadata, header tagline, footer, legends.
- **Mono** (400, 14px): inline code, topic chips, locale toggle (`pt` / `en`), the 404 prompt. Only for things that are literally code, commands or identifiers.

### Named Rules
**The Lowercase Voice Rule.** Headings, nav and UI labels are written in lowercase ("blog", "experiência", "voltar pro começo"). Proper nouns and acronyms (CMS, API, CV) keep their case.

**The Real Mono Rule.** Mono is for commands, code and identifiers. Never use it to make ordinary text look technical.

**The Tabular Dates Rule.** Dates and counts use tabular numerals so lists of dates align.

## Layout

- **Desktop (≥1024px):** a three-column grid `minmax(0,1fr) | 600px | minmax(0,1fr)` with 56px gaps. The sidebar (192px) is sticky at 32px from the top and right-aligned against the content column. The right column stays empty to keep the reading column centered.
- **Mobile:** single column with 16px side padding. The sidebar becomes a wrapping row of bordered pill links above the content.
- **Vertical rhythm:** 56px between sections in `main`, 14px from a section heading to its content, 16px of padding inside list rows. 80px bottom padding before the footer.
- **Chrome:** a thin header (tagline left, locale toggle and theme button right) and a footer (credit left, `cd ..` hint right), both in small muted text.
- **Contribution graph:** fills the 600px column exactly (cells are fluid squares with 3px gaps). Below about 480px it scrolls horizontally, starting at the current week.

### Named Rules
**The One Column Rule.** Content never spans wider than 600px. New sections stack in the same column; they do not introduce side-by-side layouts at page level.

## Elevation & Depth

Flat. Surfaces sit on the page with 1px hairlines and tonal shifts (cream → raised cream, graphite → raised graphite). There are no ambient or structural shadows.

### Shadow Vocabulary
- **Avatar offset** (`box-shadow: 3px 3px 0 var(--brand)`): the one hard, zero-blur yellow shadow, on the avatar only. It is a signature, not a system.

### Named Rules
**The Flat-By-Default Rule.** No shadows on cards, lists or sections. Hover states change border or background color, never elevation.

**The One Sticker Rule.** The hard yellow offset shadow belongs to the avatar alone. Do not copy it onto buttons or cards.

## Shapes

Soft but not bubbly. Interactive controls use 8–10px corners, content cards 14px, the avatar 18px. Contribution cells are nearly square (2px). Topic chips are the only full pills. Borders are always 1px hairlines; the avatar is the one element with a 2px solid black border.

Prefer a list with hairline dividers (`border-y` plus `divide-y`) over a stack of identical cards. The project list uses this pattern: name in a 136px column, description beside it.

## Components

### Navigation (sidebar)
- **Style:** text links in body size, Ink Muted, each with a small 14px Lucide icon at 70% opacity.
- **Hover / Focus:** Ink text on a 4% tint background, 150ms ease-out. Focus shows a 2px Cursor Yellow ring.
- **Press:** none. Links don't move; only color changes.
- **Mobile:** each link becomes a bordered, wrapping pill with the icon first.
- **Order:** site sections first, then a short hairline, then external profiles (GitHub, LinkedIn, email, CV). External links render only when configured.

### Segmented toggle (locale)
- **Style:** coss `ToggleGroup`, small size, 1px hairline border with 2px inner padding, 10px radius. Labels are mono (`pt` / `en`).
- **State:** the pressed item gets a raised tint. Press scales to 0.98 over 100ms, barely perceptible.
- **Theme button:** a single outline icon button (coss `Button`, `icon-sm`) that flips light ↔ dark. It shows a moon in light theme and a sun in dark theme, with an `aria-label` naming the theme it switches to. Same 0.98 press. It starts from the system theme; there is no separate "system" option.
- **Locale change:** while the server re-renders, `main` fades to 60% opacity (150ms), then returns. No blur.

### Cards / Containers (blog list)
- **Corner Style:** 14px.
- **Background:** page background; hover adds a 4% tint.
- **Border:** hairline; hover switches it to Cursor Yellow.
- **Internal Padding:** 16px vertical, 18px horizontal.
- **Press:** none.

### Topic chips
- **Style:** full pill, hairline border, mono 12px, Ink Muted, 8px horizontal padding. Read-only labels, not filters.

### Contribution graph (signature)
- A 7-row grid of rounded squares, one per day, colored by the heat scale. Each cell's title gives the count and date in the active language.
- On load it is revealed left to right with `clip-path` over 700ms (strong ease-out), ending on the current week. With reduced motion it only fades in.
- Legend ("less ■■■■■ more") sits right-aligned below in small muted text.

### Terminal fragments (signature)
- Mono lines styled as a shell: a Cursor Yellow Ink `~`, a muted `$`, the command, then output in Ink. The 404 page ends with a blinking yellow block cursor (`caret-blink`, 1s), static under reduced motion.
- The footer hint renders `cd ..` as inline code on a 4% tint with an 8px radius.

### Lab (`/lab`)
- A page of live interaction experiments. Each one is a section: lowercase title, one sentence explaining the technique, then a **stage** (raised surface, hairline, 14px radius, min 160px tall, content centered).
- Current experiments: hold-to-confirm (yellow `clip-path` fill, 1.6s linear while holding, 200ms back on release), copy button with blurred icon swap (200ms), clip-path tabs (inverted copy of the list clipped to the active tab, 250ms ease-in-out), and a mock terminal that navigates the site (no animation, keyboard-first).
- New experiments follow the same rules as the rest of the site: yellow is the only accent, motion has a named purpose, reduced motion is handled.

### Page transitions
- Route changes use the View Transitions API through React `<ViewTransition>` around `<main>`: the old content fades out in 120ms, the new one rises 6px out of a 2px blur in 240ms (strong ease-out, 60ms delay). Header, sidebar and footer don't animate.
- Blog titles morph from the list into the post header (`share="morph"`, 320ms ease-in-out).
- Reduced motion: plain 160ms fade, no movement, no morph.

### Markdown (blog posts)
- 16px body at 1.75 line-height; h1/h2/h3 in bold Ubuntu at 24/20/18px with 36px space above; links in Cursor Yellow Ink with underline; blockquotes with a 2px yellow left rule; code blocks on raised surface with a hairline and 14px radius.

## Do's and Don'ts

### Do:
- **Do** keep motion light: only real buttons get press feedback (scale 0.98, 100ms); links and cards change color only.
- **Do** keep Cursor Yellow the only accent, and keep it small: underlines, rings, bullets, cursor, heat scale.
- **Do** use cream / graphite surfaces and 1px alpha hairlines (black 8% / white 6%).
- **Do** write UI copy and headings in lowercase, in both pt and en.
- **Do** use strong ease-out curves (`cubic-bezier(0.23, 1, 0.32, 1)`) with 150–200ms for interface feedback, and gate any movement behind reduced-motion preferences.
- **Do** separate list items with hairline dividers instead of boxing each one.
- **Do** use tabular numerals for dates and counts.

### Don't:
- **Don't** add shadows for elevation; hover changes color or border, not depth.
- **Don't** reuse the avatar's hard yellow offset shadow anywhere else.
- **Don't** use mono as decoration on ordinary text.
- **Don't** introduce a second accent hue or pure white/black page backgrounds.
- **Don't** widen content past the 600px column or add page-level multi-column layouts.
- **Don't** animate keyboard-triggered actions (the `cd` easter egg navigates instantly).
