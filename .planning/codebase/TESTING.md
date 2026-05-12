# Testing Patterns

**Analysis Date:** 2026-05-12

## Test Framework

**Runner:** None detected.

This codebase is a pure static HTML/CSS/JS website with no build system, no package manager, and no testing infrastructure of any kind. There are no test files, no test configuration, and no testing dependencies.

```
find . -name "*.test.*" -o -name "*.spec.*"   # returns empty
find . -name "jest.config.*"                   # returns empty
find . -name "vitest.config.*"                 # returns empty
find . -name "package.json"                    # returns empty (no Node project)
```

## What Exists Instead of Tests

**Manual visual verification** is the implicit testing approach. The website is a marketing/product site with:
- Static HTML pages (`site/index.html`, `site/docs.html`, `site/download.html`)
- A shared CSS file (`site/site.css`)
- A shared JavaScript file (`site/site-chrome.js`) for nav/footer injection and lightbox behavior

**Browser inspection** in a real browser (or via dev-browser automation) is the only validation method currently in use.

## Test File Organization

Not applicable — no test files exist.

## Test Types

**Unit Tests:** Not present.

**Integration Tests:** Not present.

**E2E Tests:** Not present. The `wrangler.jsonc` config deploys the site to Cloudflare Workers Static Assets, suggesting end-to-end smoke testing could be done by visiting the deployed URL or running the Docker container (`docker-compose.yml` + `Dockerfile` + `nginx.conf`).

## Coverage

**Requirements:** None enforced.

**View Coverage:** Not applicable.

## What Could Be Tested (If Tests Were Added)

Given the site's JavaScript behavior, the following behaviors would be the logical candidates for future test coverage:

**`site/site-chrome.js` — nav injection and lightbox:**
- Nav renders correctly on all `data-page` values (`home`, `docs`, `download`)
- Active class applied to correct nav link based on `data-page`
- Lightbox opens when clicking `img.shot` or `.shot-tile img`
- Lightbox closes on overlay click, close button click, and Escape key
- Lightbox does not open for hidden images (`offsetParent === null`)
- `body.overflow = 'hidden'` set on open; cleared on close

**`site/index.html` — gallery tab switcher (inline script):**
- Clicking a tab activates `.active` on correct tab and corresponding image
- `aria-selected` toggles correctly
- Keyboard shortcut (keys 1–7) switches to the correct gallery image

**`site/download.html` — platform detection and copy buttons:**
- Copy buttons write correct text to clipboard
- `.copied` state class is applied and then removed after delay

## How to Add Testing (Recommended Approach)

If tests are added in the future, the recommended stack for this codebase type:

**Playwright** for E2E/smoke tests against the static site:
```bash
npx playwright test
```

Example test structure:
```js
// tests/smoke.spec.js
import { test, expect } from '@playwright/test';

test('homepage loads and hero is visible', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page.locator('h1')).toBeVisible();
});

test('lightbox opens on screenshot click', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.locator('img.shot.active').click();
  await expect(page.locator('.lightbox.open')).toBeVisible();
});

test('gallery tabs switch active image', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.locator('[data-shot="codex"]').click();
  await expect(page.locator('img[data-shot="codex"]')).toHaveClass(/active/);
});
```

To serve locally for testing:
```bash
# Docker:
docker compose up

# Or with wrangler:
npx wrangler dev
```

## Deployment Verification

The closest thing to a "test" in this project is the Docker healthcheck in `Dockerfile`:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
```

And the nginx `/healthz` endpoint in `nginx.conf`:
```nginx
location = /healthz {
    access_log off;
    return 200 "ok\n";
    add_header Content-Type text/plain;
}
```

These confirm the server is running but do not validate content or behavior.

---

*Testing analysis: 2026-05-12*
