<!-- refreshed: 2026-05-12 -->
# Architecture

**Analysis Date:** 2026-05-12

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     Browser / User Agent                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Delivery Layer (two targets)                    │
│                                                              │
│  Option A: Cloudflare Workers Static Assets                  │
│            `wrangler.jsonc`                                  │
│                                                              │
│  Option B: nginx (Docker)                                    │
│            `Dockerfile` + `nginx.conf`                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ serves files
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Static Site Root                           │
│                       `site/`                                │
│                                                              │
│  site/index.html    — landing page                           │
│  site/docs.html     — documentation page                     │
│  site/download.html — download / platform picker page        │
│  site/site.css      — shared design system (one CSS file)    │
│  site/site-chrome.js — shared nav, footer, lightbox          │
│  site/images/       — PNG screenshots (12 images)            │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Landing page | Hero, features, architecture diagram, screenshot gallery, install section | `site/index.html` |
| Docs page | Three-column docs layout with left nav, main content, right TOC | `site/docs.html` |
| Download page | Platform picker (macOS/Linux/Windows), install instructions, release history | `site/download.html` |
| Shared styles | Full design system: CSS variables, typography, layout utilities, nav, footer, all component styles | `site/site.css` |
| Shared chrome | IIFE-injected nav bar, footer, and lightbox widget | `site/site-chrome.js` |
| nginx config | Gzip, cache headers, HTML no-cache, 404 handling, security headers, health endpoint | `nginx.conf` |
| Cloudflare config | Static asset delivery with 404-page fallback | `wrangler.jsonc` |
| Docker setup | Multi-stage-free single-stage nginx image; compose for local dev | `Dockerfile`, `docker-compose.yml` |

## Pattern Overview

**Overall:** Static multi-page site (MPA) with vanilla HTML/CSS/JS — no build step, no framework, no bundler.

**Key Characteristics:**
- Zero build tooling: edit files, deploy files. `site/` is the deploy artifact.
- Shared chrome (nav + footer) injected at runtime by `site-chrome.js` as IIFEs via `insertAdjacentHTML`, keeping HTML pages DRY without a build step.
- All CSS lives in one file (`site.css`) using CSS custom properties for theming. Page-specific styles are `<style>` blocks in each HTML file's `<head>`.
- All JS is inline `<script>` blocks or the shared `site-chrome.js` — no imports, no modules.
- Dual deployment targets: Cloudflare Workers (primary, via `wrangler`) and Docker/nginx (self-hosted).

## Layers

**Delivery Layer:**
- Purpose: Serve static files to browsers with appropriate caching, compression, and security headers
- Location: `nginx.conf` (Docker) / `wrangler.jsonc` (Cloudflare)
- Contains: Cache policy, gzip, security headers, 404 handling
- Depends on: `site/` directory contents
- Used by: Browsers / CDN edge

**Presentation Layer:**
- Purpose: HTML structure and page content
- Location: `site/index.html`, `site/docs.html`, `site/download.html`
- Contains: Semantic HTML, page-scoped `<style>` blocks, page-scoped `<script>` blocks
- Depends on: `site.css`, `site-chrome.js`
- Used by: Browsers

**Shared Style Layer:**
- Purpose: Global design system
- Location: `site/site.css`
- Contains: CSS custom properties (color tokens, radii, shadows, typography), reset, layout utilities (`.container`, `.container-wide`), nav, footer, button, badge, card, code block, lightbox styles, responsive breakpoints
- Depends on: Google Fonts CDN (Geist, Geist Mono)
- Used by: All three HTML pages

**Shared Behavior Layer:**
- Purpose: Runtime-injected nav/footer and shared interactive widgets
- Location: `site/site-chrome.js`
- Contains: Nav IIFE, footer IIFE, lightbox IIFE (click-to-zoom screenshots)
- Depends on: `data-page` attribute on `<body>` for active nav link state
- Used by: All three HTML pages (loaded via `<script src="site-chrome.js">` at end of `<body>`)

**Asset Layer:**
- Purpose: Static images referenced by HTML
- Location: `site/images/`
- Contains: 12 PNG screenshots — 8 GUI screenshots, 4 TUI screenshots
- Naming: `screenshot-{gui|tui}-{scene}.png`

## Data Flow

### Page Request

1. Browser requests URL (e.g., `/docs.html`)
2. Cloudflare Workers or nginx resolves to `site/docs.html` (nginx uses `try_files $uri $uri/ $uri.html =404`)
3. Browser receives HTML, begins parsing
4. CSS fetched: `site/site.css` (7-day cache), Google Fonts (CDN)
5. `site-chrome.js` fetched (7-day cache), executes IIFEs, injects nav + footer into DOM
6. Page-specific `<script>` block executes interactive widgets

### Nav Active State

1. `site-chrome.js` reads `document.body.dataset.page` (e.g., `"home"`, `"docs"`, `"download"`)
2. Nav link `class` for matching page set to `"active"` inside the template literal
3. CSS `.nav-links a.active` applies underline/color accent

### Download Page Platform Detection

1. Inline `<script>` reads `navigator.userAgent`
2. Detects `win`, `linux`, or defaults to `mac`
3. Calls `activate(os)` which toggles `.active` on `.dl-tile[data-os]` and `.dl-panel[data-panel]`
4. User can click tiles to override

### Screenshot Lightbox

1. `site-chrome.js` lightbox IIFE appends `<div class="lightbox">` to `<body>` once
2. Delegated click listener on `document` catches clicks on `img.shot, .shot-tile img`
3. Only reacts if image is visible (`offsetParent !== null`)
4. Sets `lbImg.src` and opens overlay; Escape / overlay-click closes

### Docs Scroll Spy

1. `docs.html` inline script creates `IntersectionObserver` on all `h2[id], h3[id]` elements
2. On intersection, sets `.active` on matching sidebar and TOC links
3. `rootMargin: '-40% 0px -55% 0px'` targets the middle viewport band

### Hero Terminal Animation (index.html)

1. Inline `<script>` defines a `script[]` array of typed lines
2. IIFE steps through lines with `setTimeout`
3. Lines with `typing: true` simulate keystrokes at ~28–58ms intervals
4. Animation loops after 4.5s pause at end

## Key Abstractions

**CSS Custom Properties (design tokens):**
- Purpose: Single source of truth for all colors, spacing, radii, shadows, typography
- Location: `:root {}` block in `site/site.css` (lines 1–47)
- Pattern: `--bg`, `--fg`, `--accent`, `--r-sm`, `--shadow-md`, `--font-sans`, etc.

**Shared Chrome (IIFE pattern):**
- Purpose: Inject identical nav and footer into every page without duplication or a build step
- Location: `site/site-chrome.js`
- Pattern: Self-executing function that uses `insertAdjacentHTML('afterbegin', navHTML)` and `insertAdjacentHTML('beforeend', footerHTML)`

**Page identity (`data-page`):**
- Purpose: Lets `site-chrome.js` know which page it is on to set active nav state
- Pattern: `<body data-page="home">`, `<body data-page="docs">`, `<body data-page="download">`

## Entry Points

**Landing page:**
- Location: `site/index.html`
- Triggers: Root URL `/` or `/index.html`
- Responsibilities: Hero, feature grid, architecture diagram, screenshot gallery, install section, agent badges

**Docs page:**
- Location: `site/docs.html`
- Triggers: `/docs.html`
- Responsibilities: Full product documentation in a 3-column layout (left nav / content / right TOC)

**Download page:**
- Location: `site/download.html`
- Triggers: `/download.html`
- Responsibilities: OS detection, platform-specific install instructions, release history

## Architectural Constraints

- **Build step:** None. `site/` is directly deployable. No transpilation, bundling, or pre-processing.
- **JS modules:** None. All JS uses the IIFE pattern or bare `<script>` blocks. No `import`/`export`.
- **Global state:** None beyond DOM. Each page's scripts are self-contained.
- **External runtime deps:** Google Fonts CDN only. All JS/CSS is local.
- **Circular imports:** Not applicable (no module system).
- **Deployment parity:** `site/_headers` mirrors `nginx.conf` cache/security headers for Cloudflare parity.

## Anti-Patterns

### Duplicated page-scoped `<style>` blocks

**What happens:** Each HTML file has a large `<style>` block in `<head>` for page-specific styles. Some utilities (e.g., `.section`, `.callout`) may overlap between pages.
**Why it's wrong:** Maintenance burden — the same utility style edited in one page may be missed in others.
**Do this instead:** Move any utility that appears in more than one page into `site/site.css`. Keep only truly page-unique styles in the per-page `<style>` block.

### Copy-paste JS for clipboard buttons

**What happens:** The copy-button handler (`navigator.clipboard?.writeText`) is duplicated in `site/index.html` and `site/download.html`.
**Why it's wrong:** Bug fixes or UX changes must be applied in two places.
**Do this instead:** Move the copy-button handler into `site/site-chrome.js` (or a new shared script) and remove the duplicates.

## Error Handling

**Strategy:** Static file delivery — no application errors possible. HTTP 404 is handled by:
- Cloudflare: `not_found_handling: "404-page"` in `wrangler.jsonc`
- nginx: `try_files $uri $uri/ $uri.html =404` returns nginx's built-in 404 page

**Client JS:** No explicit error handling in interactive scripts. Failures are silent (e.g., `navigator.clipboard?.writeText` uses optional chaining).

## Cross-Cutting Concerns

**Caching:** Tiered — HTML: `no-cache, must-revalidate`; CSS/JS: 7 days; images: 30 days immutable. Defined in both `site/_headers` (Cloudflare) and `nginx.conf` (Docker).
**Security headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` — applied at delivery layer in both targets.
**Fonts:** Loaded from Google Fonts CDN via `<link rel="preconnect">` + stylesheet in every HTML page `<head>`. Font families: Geist (400/500/600/700) and Geist Mono (400/500/600).
**Responsive design:** Handled via `@media (max-width: 960px)` and `@media (max-width: 640px)` breakpoints in `site/site.css` and in per-page `<style>` blocks.

---

*Architecture analysis: 2026-05-12*
