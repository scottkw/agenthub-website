# Codebase Structure

**Analysis Date:** 2026-05-12

## Directory Layout

```
agenthub-website/
├── site/                    # Deployable static site root (THE deploy artifact)
│   ├── index.html           # Landing page (1514 lines)
│   ├── docs.html            # Documentation page (436 lines)
│   ├── download.html        # Download / platform picker page (411 lines)
│   ├── site.css             # Shared design system — all global styles (342 lines)
│   ├── site-chrome.js       # Shared nav, footer, lightbox — injected at runtime (138 lines)
│   ├── _headers             # Cloudflare cache + security headers (mirrors nginx.conf)
│   └── images/              # PNG screenshots (12 files, ~12 MB total)
│       ├── screenshot-gui-*.png    # 8 GUI screenshots
│       └── screenshot-tui-*.png   # 4 TUI screenshots
├── nginx.conf               # nginx server config for Docker deployment
├── Dockerfile               # nginx:1.27-alpine image; copies site/ to /usr/share/nginx/html/
├── docker-compose.yml       # Single service: agenthub-website, port 8080→80
├── wrangler.jsonc           # Cloudflare Workers config — serves site/ as static assets
├── .gitignore               # Excludes node_modules, claude-design-agenthub-website/, IDE dirs
├── .dockerignore            # Excludes source-only files from Docker build context
├── .claude/                 # Claude Code project settings (not application code)
├── .planning/               # GSD workflow planning documents
│   └── codebase/            # Codebase maps written by GSD mapper agents
└── claude-design-agenthub-website/   # LOCAL ONLY — original design export (gitignored)
    └── project/
        ├── images/
        └── uploads/
```

## Directory Purposes

**`site/` (THE deploy artifact):**
- Purpose: Everything that gets published. This directory is served verbatim — no build step.
- Contains: HTML pages, one CSS file, one shared JS file, static images, Cloudflare `_headers`
- Key files: `index.html`, `docs.html`, `download.html`, `site.css`, `site-chrome.js`

**`site/images/`:**
- Purpose: All product screenshots referenced by HTML `<img>` tags
- Contains: 12 PNG files — 8 GUI screenshots, 4 TUI screenshots
- Generated: No — manually exported screenshots
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents for use by planning and execution agents
- Contains: ARCHITECTURE.md, STRUCTURE.md, STACK.md, CONVENTIONS.md, TESTING.md, CONCERNS.md (as generated)
- Generated: Yes (by GSD mapper)
- Committed: Typically yes

**`claude-design-agenthub-website/` (local only):**
- Purpose: Reference design export with unredacted screenshots — never published
- Contains: Original Claude-generated design images and uploads
- Generated: External
- Committed: No (gitignored)

## Key File Locations

**Entry Points (pages):**
- `site/index.html`: Landing page — hero, features, architecture, gallery, install
- `site/docs.html`: Product documentation (3-column layout)
- `site/download.html`: Download page with platform detection

**Styles:**
- `site/site.css`: Single shared stylesheet — all CSS custom properties, reset, layout, components

**Shared JavaScript:**
- `site/site-chrome.js`: Runtime-injected nav + footer + lightbox (loaded at bottom of every page's `<body>`)

**Deployment Config:**
- `wrangler.jsonc`: Cloudflare Workers static assets deployment
- `nginx.conf`: nginx server block for Docker-based self-hosting
- `Dockerfile`: Docker image definition (nginx:1.27-alpine)
- `docker-compose.yml`: Local/self-hosted Docker Compose stack

**Cache / Security Policy:**
- `site/_headers`: Cloudflare-native HTTP headers (mirrors nginx.conf policy)

## Naming Conventions

**HTML files:**
- All lowercase, hyphenated: `index.html`, `docs.html`, `download.html`
- One word preferred; descriptive names for multi-word pages

**CSS classes:**
- Lowercase hyphen-separated (BEM-adjacent, but not strict BEM): `.nav-inner`, `.hero-grid`, `.btn-primary`, `.gallery-tab`
- Page-specific classes scoped by section name: `.dl-hero`, `.dl-tile`, `.dl-panel` (download page)
- Utility classes: `.container`, `.container-wide`, `.section`, `.faint`, `.mono-caption`

**CSS custom properties:**
- Semantic naming with tier suffixes: `--bg`, `--bg-1`, `--bg-2`, `--bg-3`; `--fg`, `--fg-dim`, `--fg-faint`, `--fg-mute`
- Accent: `--accent`, `--accent-2`, `--accent-soft`, `--accent-edge`
- Radii: `--r-sm`, `--r-md`, `--r-lg`, `--r-xl`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

**JavaScript:**
- IIFE pattern: `(function () { ... })();`
- `camelCase` for variables and functions
- `data-*` attributes for DOM state (e.g., `data-page`, `data-shot`, `data-os`, `data-copy`)

**Image files:**
- Pattern: `screenshot-{interface}-{scene}.png`
- Examples: `screenshot-gui-sessions.png`, `screenshot-tui-home.png`

## Where to Add New Code

**New page:**
- Create: `site/{page-name}.html`
- Include in `<head>`: `<link rel="stylesheet" href="site.css">` and Google Fonts `<link>` tags
- Add at bottom of `<body>`: `<script src="site-chrome.js"></script>`
- Set `<body data-page="{name}">` and update the nav active-link check in `site-chrome.js`
- Add nav link in `site-chrome.js` `navHTML` template literal (both desktop nav and footer)

**New global style:**
- Add to `site/site.css` at the appropriate section (layout utilities, components, etc.)
- Use existing CSS custom properties for colors/spacing; add new tokens to `:root` only if needed

**New page-scoped style:**
- Add inside a `<style>` block in the relevant HTML file's `<head>`
- Keep global-utility styles in `site/site.css` — only truly page-unique styles belong in page `<style>`

**New shared JS behavior:**
- Add as a new IIFE at the bottom of `site/site-chrome.js`

**New page-specific JS behavior:**
- Add as an inline `<script>` block at the bottom of the relevant HTML file, after `<script src="site-chrome.js"></script>`

**New screenshot:**
- Place PNG in `site/images/` following naming convention: `screenshot-{gui|tui}-{scene}.png`
- Reference in HTML as `<img src="images/screenshot-{gui|tui}-{scene}.png" alt="..." class="shot">`

## Special Directories

**`site/` (deploy artifact):**
- Purpose: The entire publishable website
- Generated: No — hand-authored
- Committed: Yes — this is the source of truth

**`claude-design-agenthub-website/`:**
- Purpose: Original design reference (unredacted screenshots)
- Generated: Yes (Claude design export)
- Committed: No (explicitly gitignored)

**`.planning/`:**
- Purpose: GSD workflow documents (plans, codebase maps)
- Generated: Yes (by GSD agents)
- Committed: Yes (planning artifacts are versioned)

---

*Structure analysis: 2026-05-12*
