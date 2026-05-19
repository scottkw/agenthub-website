# AgentHub website

Marketing site for [AgentHub](https://github.com/scottkw/agenthub) — a cross-platform desktop app, CLI, and TUI for running AI coding CLIs (Claude Code, Codex, Gemini CLI, OpenCode) and raw shell sessions (bash, zsh, fish, PowerShell) in persistent terminal sessions.

**Live site:** [agenthub.app](https://agenthub.app) (or whichever domain the Worker is bound to)
**Tracks AgentHub release:** v3.3.1 (May 19, 2026)

## What's in here

```
site/                    Deployable static artifact (the only thing that ships)
  index.html             Landing page
  docs.html              Documentation page
  download.html          Platform picker / install instructions
  site.css               Shared design system (one CSS file)
  site-chrome.js         Shared nav + footer + lightbox (IIFE-injected)
  _headers               Cloudflare cache + security headers
  images/                Product screenshots (12 PNGs)

wrangler.jsonc           Cloudflare Workers Static Assets config
nginx.conf               nginx config (Docker fallback)
Dockerfile               nginx 1.27-alpine image
docker-compose.yml       Local dev via docker compose
```

No build step, no framework, no bundler. Edit files in `site/`, deploy `site/`.

## Local development

Pick whichever is easiest:

```bash
# Quickest — Python's stdlib server
cd site && python3 -m http.server 8080

# Or via Docker (matches production nginx config)
docker compose up
```

Then open <http://localhost:8080>.

## Deployment

Production is served by **Cloudflare Workers Static Assets** (see `wrangler.jsonc`). Deploy with:

```bash
wrangler deploy
```

The `site/` directory is the deploy artifact. nginx + `Dockerfile` are kept as a self-hosted fallback.

## Updating for a new AgentHub release

When a new AgentHub version ships:

1. Update version label in the hero eyebrow (`site/index.html`)
2. Update artifact filenames + the Recent releases list (`site/download.html`)
3. Add/refresh any new feature coverage (`site/index.html`, `site/docs.html`)
4. Update the footer version line (`site/site-chrome.js`)
5. Update the version reference in this README

Source of truth for product copy is the agenthub repo's [README](https://github.com/scottkw/agenthub/blob/main/README.md) and [CHANGELOG](https://github.com/scottkw/agenthub/blob/main/CHANGELOG.md).

## License

MIT — same as AgentHub itself.
