# Coding Conventions

**Analysis Date:** 2026-05-12

## Overview

This is a pure static HTML/CSS/JS website — no framework, no build step, no TypeScript, no package manager. All conventions are established directly in the authored files under `site/`.

## Naming Patterns

**HTML files:**
- Lowercase, hyphen-free short names: `index.html`, `docs.html`, `download.html`
- One page per file; no generated or templated HTML

**CSS classes:**
- BEM-inspired but flat: `kebab-case` throughout
- Block names match their role: `.nav`, `.hero`, `.card`, `.footer`, `.gallery`, `.gallery-tab`, `.gallery-cap`
- Modifier suffix with dash: `.btn-primary`, `.btn-ghost`, `.btn-lg`, `.shot-frame`, `.card:hover`
- State suffix: `.active`, `.open`, `.copied`
- Semantic utility classes: `.muted`, `.faint`, `.mono-caption`, `.eyebrow`

**CSS custom properties (variables):**
- All defined in `:root` in `site/site.css`
- Prefix by function: `--bg`, `--bg-1`, `--bg-2`, `--bg-3` (backgrounds)
- `--fg`, `--fg-dim`, `--fg-faint`, `--fg-mute` (foreground/text)
- `--accent`, `--accent-2`, `--accent-soft`, `--accent-edge` (accent colors)
- `--r-sm`, `--r-md`, `--r-lg`, `--r-xl` (border-radii tokens)
- `--shadow-sm`, `--shadow-md`, `--shadow-lg` (shadow tokens)
- `--font-sans`, `--font-mono` (font stacks)
- Agent-brand colors: `--claude`, `--codex`, `--gemini`, `--opencode`
- Status colors: `--ok`, `--warn`, `--err`

**JavaScript:**
- Functions use `camelCase`: `open()`, `close()`
- DOM variables use `camelCase`: `const lbImg`, `const lbCap`, `const overlay`
- Event handlers are anonymous arrow functions or named inner functions passed directly

**HTML IDs:**
- Used sparingly for scroll-anchors and JS hooks: `#features`, `#architecture`, `#gallery`, `#install`, `#term-body`
- Match the `data-page` and `data-shot` attribute pattern for JS targeting

**Data attributes:**
- `data-page="home"` on `<body>` — used by `site-chrome.js` to set nav active state
- `data-shot="claude"` on gallery tabs and images — used for tab switching

## Code Style

**CSS formatting:**
- No formatter tooling (no `.prettierrc`, no `stylelint`)
- Single-line shorthand for flex/grid display properties: `display: flex; align-items: center; gap: 8px;`
- Multi-line for complex rules with many declarations
- Comments use `/* block comment */` style; section headers are clearly labeled with `/* SECTION NAME */`
- Longhand values preferred for transitions: `transition: all .15s ease`
- Numbers without leading zero: `.15s` not `0.15s`

**HTML formatting:**
- 2-space indentation throughout
- Inline styles used sparingly for one-off overrides (color accents on individual elements that vary per instance)
- `aria-*` attributes present on interactive components (lightbox, gallery tabs with `role="tablist"` / `role="tab"` / `aria-selected`)
- External links always have `target="_blank" rel="noopener"`
- Images use `loading="lazy"` for below-fold content

**JavaScript formatting:**
- IIFEs (Immediately Invoked Function Expressions) for isolation: `(function () { ... })()`
- No module system — plain script tags; `site-chrome.js` is the only shared JS file
- Template literals for HTML injection
- `const`/`let` only — no `var`

## Import Organization

**CSS:**
- Single shared stylesheet: `<link rel="stylesheet" href="site.css" />`
- Page-specific styles in a `<style>` block inside `<head>` immediately after the `site.css` link
- Google Fonts loaded via `<link>` with `preconnect` hints

**JavaScript:**
- `site-chrome.js` loaded via `<script src="site-chrome.js"></script>` at end of `<body>` on every page
- Inline `<script>` blocks for page-specific behavior (gallery tab switching, terminal typewriter, copy buttons)
- No module imports; no bundler

## CSS Architecture

**Shared foundation (`site/site.css`):**
- Reset: `box-sizing: border-box` universal, bare margin/padding reset on `html`/`body`
- Design tokens (CSS custom properties in `:root`)
- Layout utilities: `.container` (1200px max), `.container-wide` (1320px max)
- Component styles: `.nav`, `.btn`, `.card`, `.footer`, `.eyebrow`, `.section`, `.kbd`
- Utility classes: `.muted`, `.faint`, `.mono-caption`
- Responsive breakpoints at `960px` and `640px`

**Page-specific styles:**
- Written in `<style>` blocks inside each page's `<head>`
- Extend or override shared components without modifying `site.css`
- Example: `index.html` adds `.hero`, `.term`, `.gallery`, `.arch-*`, `.install-*` etc.

## Typography

**Font stacks (defined as tokens):**
- Sans: `"Geist", "Inter", ui-sans-serif, system-ui, ...` → loaded from Google Fonts
- Mono: `"Geist Mono", "JetBrains Mono", ui-monospace, ...` → loaded from Google Fonts

**Type scale (from `site.css`):**
- `h1`: `clamp(40px, 5.6vw, 72px)`, weight 600, letter-spacing `-0.03em`
- `h2`: `clamp(28px, 3.4vw, 44px)`, letter-spacing `-0.02em`
- `h3`: `18px`
- Body: `16px`, line-height `1.55`
- Mono captions (`.mono-caption`): `12px`, letter-spacing `0.02em`
- Eyebrow labels (`.eyebrow`): monospace, `12px`, `0.08em` tracking, `uppercase`

## Component Patterns

**Button pattern:**
```html
<a class="btn btn-primary btn-lg" href="download.html">Download for macOS</a>
<a class="btn btn-ghost" href="docs.html">Read the docs</a>
```
Base class `.btn` + variant (`.btn-primary`, `.btn-ghost`) + optional size (`.btn-lg`).

**Card pattern:**
```html
<div class="card">
  <div class="icon"><svg ...></svg></div>
  <h3>Feature title</h3>
  <p>Description text.</p>
</div>
```

**Section pattern:**
```html
<section class="section" id="anchor">
  <div class="container-wide">
    <div class="section-title">
      <div><span class="eyebrow">...</span><h2>...</h2></div>
      <p>subtitle</p>
    </div>
    <!-- content -->
  </div>
</section>
```

**Active state pattern:**
- JS adds/removes `.active` class on tabs, gallery images, and panels
- CSS handles all visual state via `.active` selectors — no inline style manipulation for state

## Error Handling

No server-side logic; no JavaScript error handling patterns. The JS is simple DOM manipulation without try/catch. The lightbox JS uses `if (!target || !target.src) return;` as a guard.

## Logging

None — no console logging in production code.

## Comments

**CSS:** Section delimiter comments on major blocks:
```css
/* Nav */
/* Buttons */
/* Cards */
/* Footer */
```

**HTML:** Section comments before major page sections:
```html
<!-- HERO -->
<!-- THREE MODES -->
<!-- BIG FEATURE: REMOTE -->
<!-- GALLERY -->
```

**JS:** Single-line descriptions above logical blocks:
```js
// Shared nav + footer across pages
// Lightbox — click any screenshot to zoom
// defer clearing src so the image doesn't flash while fading
```

## Accessibility Patterns

- `aria-hidden="true"` on decorative elements (logo mark SVG, QR card)
- `aria-label` on icon-only buttons
- `role="dialog"`, `aria-modal="true"`, `aria-label` on lightbox overlay
- `role="tablist"` / `role="tab"` / `aria-selected` on gallery tabs
- `alt` text on all product screenshots (descriptive captions)
- `loading="lazy"` on below-fold images
- Keyboard support: `Escape` closes lightbox

---

*Convention analysis: 2026-05-12*
