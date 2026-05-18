// Shared nav + footer across pages
(function () {
  const page = document.body.dataset.page || '';

  const navHTML = `
  <nav class="nav">
    <div class="nav-inner">
      <a class="brand" href="index.html">
        <span class="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3 L21 20 L15 20 L12 14 L9 20 L3 20 Z" fill="white"/>
          </svg>
        </span>
        <span class="wordmark">Agent<span class="hub">Hub</span></span>
      </a>
      <div class="nav-links">
        <a href="index.html#features" class="${page==='home'?'active':''}">Features</a>
        <a href="index.html#architecture">Architecture</a>
        <a href="docs.html" class="${page==='docs'?'active':''}">Docs</a>
        <a href="download.html" class="${page==='download'?'active':''}">Download</a>
        <a href="https://github.com/scottkw/agenthub" target="_blank" rel="noopener">GitHub</a>
      </div>
      <div class="nav-right">
        <a class="btn btn-ghost" href="https://github.com/scottkw/agenthub" target="_blank" rel="noopener" aria-label="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.96 3.22 9.17 7.69 10.66.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.14-1.25-5.14-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.15-1.45 3.1-1.15 3.1-1.15.62 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.28-5.16 5.55.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.77.53 4.47-1.49 7.68-5.7 7.68-10.66C23.25 5.48 18.27.5 12 .5Z"/>
          </svg>
          <span>Star</span>
        </a>
        <a class="btn btn-primary" href="download.html">Download</a>
      </div>
    </div>
  </nav>`;

  const footerHTML = `
  <footer class="footer">
    <div class="container-wide">
      <div class="footer-inner">
        <div>
          <a class="brand" href="index.html" style="margin-bottom:14px;">
            <span class="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3 L21 20 L15 20 L12 14 L9 20 L3 20 Z" fill="white"/>
              </svg>
            </span>
            <span class="wordmark">Agent<span class="hub">Hub</span></span>
          </a>
          <p class="faint" style="margin-top:14px; max-width: 36ch; font-size: 14px;">
            A desktop app, CLI, and TUI for running — and sharing — AI coding sessions.
          </p>
          <p class="mono-caption" style="margin-top:18px;">v3.3 · MIT</p>
        </div>
        <div>
          <h4>Product</h4>
          <ul>
            <li><a href="index.html#features">Features</a></li>
            <li><a href="index.html#architecture">Architecture</a></li>
            <li><a href="index.html#install">Install</a></li>
            <li><a href="download.html">Download</a></li>
          </ul>
        </div>
        <div>
          <h4>Docs</h4>
          <ul>
            <li><a href="docs.html#getting-started">Getting started</a></li>
            <li><a href="docs.html#cli">CLI reference</a></li>
            <li><a href="docs.html#tui">TUI mode</a></li>
            <li><a href="docs.html#remote">Remote &amp; Tailscale</a></li>
          </ul>
        </div>
        <div>
          <h4>Project</h4>
          <ul>
            <li><a href="https://github.com/scottkw/agenthub" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="https://github.com/scottkw/agenthub/releases" target="_blank" rel="noopener">Releases</a></li>
            <li><a href="https://github.com/scottkw/agenthub/issues" target="_blank" rel="noopener">Issues</a></li>
            <li><a href="https://github.com/scottkw/agenthub/blob/main/CHANGELOG.md" target="_blank" rel="noopener">Changelog</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="faint">© 2026 AgentHub contributors.</span>
        <span class="mono-caption">Built with Go · Wails · React · Bubble Tea</span>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();

// Lightbox — click any screenshot to zoom
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Screenshot preview');
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close preview" type="button">×</button>
    <img alt="" />
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector('img');
  const lbCap = overlay.querySelector('.lightbox-caption');

  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCap.textContent = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // defer clearing src so the image doesn't flash while fading
    setTimeout(() => { lbImg.src = ''; }, 200);
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('img.shot, .shot-tile img');
    if (!target || !target.src) return;
    // only react to visible images (gallery hides inactive ones)
    if (target.offsetParent === null) return;
    e.preventDefault();
    e.stopPropagation();
    open(target.src, target.alt);
  });

  overlay.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
