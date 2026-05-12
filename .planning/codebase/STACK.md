# Technology Stack

**Analysis Date:** 2026-05-12

## Languages

**Primary:**
- HTML5 - All site pages (`site/index.html`, `site/docs.html`, `site/download.html`)
- CSS3 - Site styling (`site/site.css`)
- JavaScript (vanilla, ES2015+) - Shared chrome and interactivity (`site/site-chrome.js`, inline `<script>` blocks in each HTML page)

**Secondary:**
- None — no transpilation, no TypeScript, no build step

## Runtime

**Environment:**
- Static files only — no server-side runtime
- Served by nginx (Docker) or Cloudflare Workers Static Assets (production)

**Package Manager:**
- Not applicable — no Node.js dependencies in this repository
- `wrangler.jsonc` references `node_modules/wrangler/config-schema.json` but `node_modules/` is gitignored and no `package.json` is present (wrangler used externally for deploy)

## Frameworks

**Core:**
- None — plain HTML/CSS/JS, no framework

**Build/Dev:**
- No build pipeline — `site/` directory is the deployable artifact as-is
- nginx 1.27 (Alpine) - Local/self-hosted serving via Docker (`Dockerfile`)
- Cloudflare Workers Static Assets (via Wrangler CLI) - Production hosting (`wrangler.jsonc`)

**Testing:**
- None detected

## Key Dependencies

**Runtime (external CDN only):**
- Google Fonts CDN - Geist and Geist Mono typefaces loaded via `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (all four HTML pages)

**Infrastructure:**
- nginx 1.27-alpine - Docker container image (`Dockerfile` line 1)
- Cloudflare Workers Static Assets - Production platform, compatibility date `2025-01-01` (`wrangler.jsonc`)

## Configuration

**Environment:**
- `PORT` environment variable — controls host port binding in Docker Compose (defaults to `8080`, maps to container port 80) (`docker-compose.yml` line 8)
- No `.env` files or secrets required

**Build:**
- `wrangler.jsonc` — Cloudflare Workers config; serves `./site` directory with `404-page` not-found handling
- `nginx.conf` — nginx server block; gzip compression, cache headers per asset type, `/healthz` endpoint

**HTTP Security Headers (two layers):**
- `site/_headers` — Cloudflare Pages/Workers format; sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and cache-control per asset type
- `nginx.conf` lines 44-47 — identical headers for Docker/nginx deployment

## Platform Requirements

**Development:**
- Any static file server capable of serving `site/`
- Docker + Docker Compose for containerized local dev (`docker-compose.yml`)
- Wrangler CLI (installed externally) for Cloudflare deployment

**Production:**
- Cloudflare Workers Static Assets (primary deployment target per `wrangler.jsonc`)
- Docker + nginx as alternative self-hosted target

---

*Stack analysis: 2026-05-12*
