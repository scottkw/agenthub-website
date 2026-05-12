# Codebase Concerns

**Analysis Date:** 2026-05-12

## Tech Debt

**Hardcoded version strings scattered across multiple files:**
- Issue: Version number "v3.1" and release date "May 3, 2026" are duplicated in at least 4 places — `site/download.html` (lines 185, 228, 262, 272, 280, 304, 350), `site/site-chrome.js` (line 51), `site/index.html` (line 617), and `site/docs.html` (line 231). Every release requires manual updates in all these locations.
- Files: `site/download.html`, `site/site-chrome.js`, `site/index.html`, `site/docs.html`
- Impact: High likelihood of version skew on next release — one file updated, others left stale.
- Fix approach: Introduce a single source-of-truth variable (e.g., a small `version.js` or data attribute on `<body>`) and populate all version badges/labels from it at page-load time.

**Inline `<style>` blocks inside page body:**
- Issue: `site/index.html` contains a second `<style>` block at line 1174, mid-document inside a `<section>`. This is valid HTML but breaks the expectation that styles live in `<head>`, makes per-page CSS harder to audit, and can cause flash-of-unstyled-content on slow connections.
- Files: `site/index.html` (line 1174)
- Impact: Low — purely organizational, but creates precedent for scattered styles.
- Fix approach: Move `.shots-group`, `.shots-heading`, `.shots-grid`, `.shot-tile` rules into `site.css` or into the `<style>` block already in `<head>`.

**Wrangler schema reference points to non-existent `node_modules`:**
- Issue: `wrangler.jsonc` line 2 references `"$schema": "node_modules/wrangler/config-schema.json"`, but there is no `package.json` or `node_modules/` directory committed to the repo. The schema URI is a dead path for anyone who hasn't run `npm install wrangler` locally.
- Files: `wrangler.jsonc`
- Impact: Low — wrangler still works without schema validation, but editor IntelliSense/validation will silently fail.
- Fix approach: Switch to the hosted schema URL: `"https://unpkg.com/wrangler/config-schema.json"` or add a minimal `package.json` + lock file so `node_modules` is reproducible.

**Download page Linux `dpkg` copy-button hardcodes filename with version:**
- Issue: `site/download.html` line 281 shows `data-copy="sudo dpkg -i agenthub-v3.1.0-linux-amd64.deb"`. The filename is version-specific; when v3.2 ships, this copy target becomes incorrect while the generic download link still points to `/releases/latest`.
- Files: `site/download.html` (line 281)
- Impact: Medium — users copy-paste a command with a stale filename that doesn't match what they downloaded.
- Fix approach: Use a generic filename in the copy target (`agenthub-linux-amd64.deb`) and document renaming, or drive the filename from the same version variable noted above.

---

## Known Bugs

**Copy buttons silently fail in non-HTTPS / clipboard-restricted contexts:**
- Symptoms: `navigator.clipboard?.writeText(...)` uses optional chaining and discards the returned Promise. If the Clipboard API is unavailable (non-HTTPS origin, Firefox with strict settings, or old Safari), the button shows "Copied" but nothing is copied.
- Files: `site/index.html` (line 1470), `site/download.html` (line 402)
- Trigger: Open the site over HTTP (e.g., via Docker on port 8080 without TLS), click any Copy button.
- Workaround: None visible to the user — the button still flashes "Copied".

**Platform auto-detect on download page uses `ua.includes('win')` first-last ordering issue:**
- Symptoms: `site/download.html` lines 384-387 check `ua.includes('win')` before `ua.includes('linux')`. On ChromeOS (which includes "linux" in the UA), the platform resolves to "mac" because neither "win" nor "linux" matches first — the fallback `os = 'mac'` is applied. Also, iPadOS/iOS devices that include "mac" in the UA would be mis-categorised as mac.
- Files: `site/download.html` (lines 383-388)
- Trigger: Visit download page on ChromeOS or iOS.
- Workaround: None — users must manually click the correct platform tile.

---

## Security Considerations

**Missing Content-Security-Policy (CSP) header:**
- Risk: No CSP is set in either `site/_headers` (Cloudflare Pages) or `nginx.conf`. Without CSP, any injected script (e.g., via a compromised CDN or XSS) executes without restriction.
- Files: `site/_headers`, `nginx.conf`
- Current mitigation: `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` are set; external Google Fonts is the only third-party script-equivalent resource.
- Recommendations: Add a CSP that allows `'self'` plus `fonts.googleapis.com` and `fonts.gstatic.com`. At minimum, add `default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`.

**Missing `Strict-Transport-Security` (HSTS) header:**
- Risk: Neither `nginx.conf` nor `site/_headers` sets HSTS. On the Docker path, the site is served over plain HTTP on port 8080 by default (no TLS termination in the compose file).
- Files: `nginx.conf`, `site/_headers`, `docker-compose.yml`
- Current mitigation: Cloudflare Workers deployment likely enforces HTTPS at the edge, but the Docker path has no TLS.
- Recommendations: Add `Strict-Transport-Security: max-age=63072000; includeSubDomains` to `site/_headers` for the Cloudflare path. Document that the Docker compose setup requires a reverse proxy with TLS for production use.

**Missing `Permissions-Policy` header:**
- Risk: No `Permissions-Policy` header limits browser feature access (camera, microphone, geolocation). Not a significant risk for a static marketing site, but adds unnecessary browser permission surface.
- Files: `site/_headers`, `nginx.conf`
- Current mitigation: None.
- Recommendations: Add `Permissions-Policy: camera=(), microphone=(), geolocation=()` to both `site/_headers` and `nginx.conf`.

**Google Fonts loaded from external CDN on every page:**
- Risk: Google Fonts `fonts.googleapis.com` / `fonts.gstatic.com` are third-party origins. This is a minor privacy concern (user IPs sent to Google on every page load) and a reliability concern (site degrades if Google's CDN is unavailable).
- Files: `site/index.html` (lines 8-10), `site/download.html` (lines 8-10), `site/docs.html` (lines 8-10)
- Current mitigation: `preconnect` hints reduce latency; `display=swap` prevents FOIT.
- Recommendations: Self-host the Geist and Geist Mono font files in `site/` to eliminate the third-party dependency, remove the CDN `<link>` tags, and add the fonts to the cache-control rules.

---

## Performance Bottlenecks

**Screenshot images are unoptimized PNG at 2x–3x display resolution:**
- Problem: All 12 screenshots in `site/images/` are RGBA PNGs at 2852×2108 pixels, ranging from 876 KB to 1.2 MB each. Total images directory is 12 MB. All are loaded with `loading="lazy"`, but the `index.html` gallery loads 7 shots on one page; the screenshot grid below loads 8 more (many duplicates).
- Files: `site/images/*.png`, `site/index.html` (lines 1113-1285)
- Cause: Screenshots exported at HiDPI (Retina) resolution without compression or format conversion.
- Improvement path: Convert to WebP (typically 50-70% smaller). Use `<picture>` with WebP + PNG fallback. Consider serving images at `1426×1054` max-display size. This alone could reduce page weight from ~12 MB to ~2-3 MB.

**Large monolithic `index.html` — 1,514 lines of mixed HTML/CSS/JS:**
- Problem: The landing page is a single 1,514-line file containing two `<style>` blocks (one 600 lines in `<head>`, one mid-document), one `<script>` block with multiple IIFE modules, and all page content. Browser must parse the entire file before rendering is complete.
- Files: `site/index.html`
- Cause: All code is inlined for simplicity of a static site, but the file has grown large.
- Improvement path: Low priority given the static site nature; the main gains come from image optimization above. If splitting is desired, the gallery JS and terminal animation could be extracted to separate script files.

**No image `width`/`height` attributes on screenshot `<img>` tags:**
- Problem: None of the screenshot `<img>` elements in `site/index.html` include explicit `width` and `height` attributes. Without them, the browser cannot reserve layout space before images load, causing Cumulative Layout Shift (CLS).
- Files: `site/index.html` (lines 1113-1285)
- Cause: Missing attributes.
- Improvement path: Add `width="2852" height="2108"` (or the display size) to each `<img>` to allow aspect ratio reservation.

---

## Fragile Areas

**Mobile navigation — nav links hidden with no replacement:**
- Files: `site/site.css` (line 261), `site/site-chrome.js`
- Why fragile: At `max-width: 960px`, `.nav-links { display: none; }` hides all navigation links with no hamburger menu, drawer, or alternative. Users on tablets and phones have no way to navigate to Docs, Download, or Features without typing URLs directly.
- Safe modification: Add a hamburger toggle button to the nav HTML in `site-chrome.js` and corresponding open/close JS + CSS.
- Test coverage: No automated tests exist.

**IntersectionObserver scroll-spy in docs page uses fragile rootMargin:**
- Files: `site/docs.html` (lines 429-432)
- Why fragile: The `rootMargin: '-40% 0px -55% 0px'` means only 5% of the viewport height triggers a section highlight. With very short sections or large headings, multiple sections can be simultaneously "invisible" and the active link desynchronizes.
- Safe modification: Expand the rootMargin or switch to tracking the topmost visible heading.
- Test coverage: None.

**Platform detection in download page defaults to macOS:**
- Files: `site/download.html` (lines 383-388)
- Why fragile: Any UA string not containing "win" or "linux"/"x11" silently defaults to macOS. This is correct for Safari/macOS but wrong for ChromeOS, iOS, Android, and any future/unusual UA string. A wrong default means mobile users see macOS download instructions.
- Safe modification: Add explicit iOS/Android detection and either show a "not available for mobile" state or default to a neutral "choose your platform" empty state instead of macOS.
- Test coverage: None.

---

## Missing Critical Features

**No favicon:**
- Problem: None of the HTML files reference a `favicon.ico`, `.png`, or `.svg` favicon. No favicon file exists in `site/`. Browser tabs show a blank/default icon for the site.
- Blocks: Professional appearance; brand recognition in browser tabs and bookmarks.

**No Open Graph / Twitter Card meta tags:**
- Problem: None of the HTML pages include `og:title`, `og:description`, `og:image`, `twitter:card`, or `canonical` link elements. Social sharing (GitHub README links, Twitter/X, Slack unfurls) will produce no preview card.
- Files: All pages in `site/`
- Blocks: Social media link previews, SEO signal quality.

**No `robots.txt` or `sitemap.xml`:**
- Problem: Neither file exists in `site/`. Search engines will still crawl the site, but cannot be guided about crawl priorities, and canonical URL confirmation is absent.
- Files: Missing from `site/`
- Blocks: SEO optimization; explicit crawl guidance.

**No `prefers-reduced-motion` media query:**
- Problem: `site/site.css` contains CSS animations (blinking cursor `@keyframes blink`, hover transforms on cards and tiles). No `@media (prefers-reduced-motion: reduce)` rule disables or reduces these animations for users who have requested reduced motion in their OS settings.
- Files: `site/site.css`, `site/index.html`
- Blocks: Accessibility compliance (WCAG 2.1 SC 2.3.3).

**No CI/CD pipeline:**
- Problem: No `.github/workflows/` directory or any other CI configuration exists. There is no automated build, lint, or deployment step. Deployments to Cloudflare Workers (via `wrangler`) are entirely manual.
- Blocks: Automated deployments on push; ability to catch broken links or regressions before going live.

---

## Test Coverage Gaps

**No tests of any kind:**
- What's not tested: HTML validity, broken links, accessibility (axe/pa11y), visual regression, JavaScript behavior (copy buttons, gallery tabs, platform detection, lightbox).
- Files: All files in `site/`
- Risk: Regressions in interactive features (copy buttons, mobile nav once added, platform detection) go undetected.
- Priority: Medium — the site is simple and static, but the interactive JS (terminal animation, gallery, lightbox, clipboard) has several edge-case bugs already identified above.

**Broken-link risk with all GitHub links pointing to a single owner:**
- What's not tested: All 15+ GitHub links point to `https://github.com/scottkw/agenthub`. If the repo is renamed or transferred, every link on every page breaks simultaneously.
- Files: `site/site-chrome.js`, `site/index.html`, `site/download.html`, `site/docs.html`
- Risk: Users clicking GitHub, Issues, Releases, or Changelog links all get 404s.
- Priority: Low — the repo name is unlikely to change, but centralizing the base URL into a constant (currently duplicated ~20 times) would reduce the blast radius.

---

*Concerns audit: 2026-05-12*
