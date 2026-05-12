# External Integrations

**Analysis Date:** 2026-05-12

## APIs & External Services

**Font Delivery:**
- Google Fonts CDN - Serves Geist (sans-serif) and Geist Mono typefaces
  - Preconnect: `https://fonts.googleapis.com`, `https://fonts.gstatic.com`
  - Referenced in: `site/index.html`, `site/docs.html`, `site/download.html`
  - No API key required; public CDN

**GitHub (outbound links only — no API calls):**
- Repository: `https://github.com/scottkw/agenthub`
- Releases: `https://github.com/scottkw/agenthub/releases`
- Issues: `https://github.com/scottkw/agenthub/issues`
- Changelog: `https://github.com/scottkw/agenthub/blob/main/CHANGELOG.md`
- All download `.dmg`, `.deb`, `.exe` links resolve to `https://github.com/scottkw/agenthub/releases/latest`
- No GitHub API integration; all are static `<a href>` links

**Tailscale (referenced in docs — no API integration):**
- `https://tailscale.com` linked as optional prerequisite in `site/download.html`
- AgentHub product uses Tailscale for remote sessions; the website only links to it

**Microsoft WebView2 (referenced in docs — no API integration):**
- `https://developer.microsoft.com/en-us/microsoft-edge/webview2/` linked as Windows prerequisite

## Data Storage

**Databases:**
- None — fully static site, no database

**File Storage:**
- Local filesystem: `site/` directory contains all HTML, CSS, JS, and images
- Images: `site/images/` — 12 screenshot PNGs served as static assets

**Caching:**
- Browser cache via HTTP headers (configured in both `site/_headers` and `nginx.conf`):
  - HTML: `no-cache, must-revalidate`
  - CSS/JS: `public, max-age=604800` (7 days)
  - Images: `public, max-age=2592000, immutable` (30 days)

## Authentication & Identity

**Auth Provider:**
- None — no authentication on the website

## Monitoring & Observability

**Error Tracking:**
- None detected

**Health Check:**
- nginx `/healthz` endpoint returns `200 ok` (`nginx.conf` line 38)
- Docker Compose health check polls `http://localhost/healthz` every 30s (`docker-compose.yml`)

**Logs:**
- nginx access logs (default nginx behavior); `/healthz` endpoint has `access_log off`

## CI/CD & Deployment

**Hosting:**
- Primary: Cloudflare Workers Static Assets (`wrangler.jsonc` — project name `agenthub-website`)
- Alternative: Docker + nginx (`Dockerfile`, `docker-compose.yml`)

**CI Pipeline:**
- None detected in this repository (no `.github/` directory, no CI config files)

**Container Registry:**
- Docker image tagged `agenthub-website:latest` (`docker-compose.yml` line 3)

## Environment Configuration

**Required env vars:**
- `PORT` (optional) — Docker host port, defaults to `8080`

**Secrets location:**
- None — no secrets required for this static site

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None — all external references are static HTML links

## Browser APIs Used

**Clipboard API:**
- `navigator.clipboard.writeText()` — copy-to-clipboard buttons in `site/download.html` (install commands)

**Navigator / User Agent:**
- `navigator.userAgent` — OS auto-detection for download platform picker (`site/download.html`)

**DOM / Events:**
- Image lightbox (`site/site-chrome.js`) — click-to-zoom screenshots using DOM events
- Keyboard `Escape` listener to close lightbox

---

*Integration audit: 2026-05-12*
