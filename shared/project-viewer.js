/**
 * Shared project viewer — reads window.PROJECT_CONFIG, builds the full UI,
 * and wires up all interactions (sidebar, preview, theme, screenshots).
 *
 * Config shape:
 *   {
 *     title:            string,          // project name shown in top bar
 *     backLink:         string,          // href for "All Projects" link
 *     counterText:      string,          // e.g. "9 screens · 4 prototypes"
 *     accent:           string,          // CSS color, e.g. "#6366F1"
 *     accentLight:      string,          // e.g. "rgba(99, 102, 241, 0.08)"
 *     accentHover:      string,          // e.g. "rgba(99, 102, 241, 0.14)"
 *     screenshotPaths:  (file) => { desktop, mobile },
 *     screens:          [{ group, type?, items: [{ num, file, name, desc }] }]
 *   }
 */
(function () {
  const config = window.PROJECT_CONFIG;
  if (!config) return;

  const root = document.documentElement;
  root.style.setProperty('--accent', config.accent);
  root.style.setProperty('--accent-light', config.accentLight);
  root.style.setProperty('--accent-hover', config.accentHover);

  const SCREENS = config.screens;
  SCREENS.forEach(g => g.items.forEach(s => {
    s.screenshots = config.screenshotPaths(s.file);
  }));
  const flatScreens = SCREENS.flatMap(g => g.items);

  /* ---- SVG icons ---- */
  const icons = {
    back:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    menu:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    chevLeft:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    chevRight:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    sun:        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon:       '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    play:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    image:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    openTab:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    proto:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  };

  /* ---- Build HTML ---- */
  document.body.innerHTML = `
    <div class="top-bar">
      <a href="${config.backLink}" class="back-link">${icons.back} All Projects</a>
      <div class="top-divider"></div>
      <span class="project-title">${config.title}</span>
      <span class="top-bar-spacer"></span>
      <span class="screen-counter">${config.counterText}</span>
    </div>
    <div class="shell">
      <aside class="sidebar" id="sidebar"></aside>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <button class="toggle-sidebar-btn" id="toggle-sidebar" aria-label="Toggle screen list">${icons.menu}</button>
          <button class="preview-nav-btn" id="btn-prev" aria-label="Previous screen">${icons.chevLeft}</button>
          <span class="preview-screen-name" id="preview-title">&mdash;</span>
          <button class="preview-nav-btn" id="btn-next" aria-label="Next screen">${icons.chevRight}</button>
          <button class="theme-toggle-btn" id="theme-toggle" aria-label="Toggle dark/light theme" title="Toggle dark/light theme">${icons.sun}${icons.moon}</button>
          <div class="mode-toggle" id="mode-toggle">
            <button class="mode-toggle-btn" data-mode="live">${icons.play} Live</button>
            <button class="mode-toggle-btn active" data-mode="screenshots">${icons.image} Screenshots</button>
          </div>
          <button class="open-tab-btn" id="btn-open-tab" title="Open in new tab">${icons.openTab}<span class="btn-label">Open in new tab</span></button>
        </div>
        <div class="preview-frame-wrap" id="preview-frame-wrap" data-mode="screenshots">
          <div class="device-frame"><iframe id="preview-iframe" title="Screen preview"></iframe></div>
          <div class="screenshots-view" id="screenshots-view">
            <div class="screenshot-card mobile"><span class="screenshot-card-label">Mobile</span><img id="screenshot-mobile" alt="Mobile screenshot"></div>
            <div class="screenshot-card desktop"><span class="screenshot-card-label">Desktop</span><img id="screenshot-desktop" alt="Desktop screenshot"></div>
          </div>
        </div>
      </div>
    </div>`;

  /* ---- DOM refs ---- */
  const sidebar    = document.getElementById('sidebar');
  const iframe     = document.getElementById('preview-iframe');
  const titleEl    = document.getElementById('preview-title');
  const btnPrev    = document.getElementById('btn-prev');
  const btnNext    = document.getElementById('btn-next');
  const btnOpenTab = document.getElementById('btn-open-tab');
  const btnToggle  = document.getElementById('toggle-sidebar');
  const frameWrap  = document.getElementById('preview-frame-wrap');
  const modeToggle = document.getElementById('mode-toggle');
  const mobileImg  = document.getElementById('screenshot-mobile');
  const desktopImg = document.getElementById('screenshot-desktop');
  const themeBtn   = document.getElementById('theme-toggle');

  let activeIndex  = 0;
  let viewMode     = 'screenshots';
  let currentTheme = 'light';

  /* ---- Sidebar ---- */
  function buildSidebar() {
    sidebar.innerHTML = SCREENS.map(group => `
      <div class="sidebar-section">
        <div class="sidebar-section-title">${group.group}</div>
        ${group.items.map(s => {
          const idx = flatScreens.indexOf(s);
          const isProto = group.type === 'prototype';
          const badge = isProto
            ? `<span class="screen-item-icon">${icons.proto}</span>`
            : `<span class="screen-item-num">${s.num}</span>`;
          return `<button class="screen-item" data-idx="${idx}">
            ${badge}
            <div class="screen-item-text">
              <div class="screen-item-name">${s.name}</div>
              <div class="screen-item-desc">${s.desc}</div>
            </div>
          </button>`;
        }).join('')}
      </div>
    `).join('');

    sidebar.addEventListener('click', e => {
      const btn = e.target.closest('.screen-item');
      if (btn) selectScreen(parseInt(btn.dataset.idx, 10));
    });
  }

  /* ---- Screenshots ---- */
  function renderScreenshots(s) {
    mobileImg.src  = s.screenshots.mobile;
    mobileImg.alt  = `${s.name} — Mobile`;
    desktopImg.src = s.screenshots.desktop;
    desktopImg.alt = `${s.name} — Desktop`;
  }

  /* ---- View mode ---- */
  function setViewMode(mode) {
    viewMode = mode;
    frameWrap.dataset.mode = mode;
    modeToggle.querySelectorAll('.mode-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    const s = flatScreens[activeIndex];
    if (mode === 'screenshots') {
      renderScreenshots(s);
      iframe.src = 'about:blank';
    } else {
      iframe.src = s.file;
    }
  }

  /* ---- Screen selection ---- */
  function selectScreen(idx) {
    if (idx < 0 || idx >= flatScreens.length) return;
    activeIndex = idx;
    const s = flatScreens[idx];

    if (viewMode === 'live') {
      iframe.src = s.file;
    } else {
      renderScreenshots(s);
    }

    titleEl.textContent = typeof s.num === 'number' ? `${s.num}. ${s.name}` : s.name;
    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === flatScreens.length - 1;

    sidebar.querySelectorAll('.screen-item').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    const activeBtn = sidebar.querySelector('.screen-item.active');
    if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---- Theme ---- */
  function applyThemeToIframe() {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (doc && doc.documentElement) {
        doc.documentElement.setAttribute('data-theme', currentTheme);
      }
    } catch (_) { /* cross-origin */ }
  }

  iframe.addEventListener('load', applyThemeToIframe);

  themeBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    themeBtn.classList.toggle('dark', currentTheme === 'dark');
    applyThemeToIframe();
  });

  /* ---- Event listeners ---- */
  btnPrev.addEventListener('click', () => selectScreen(activeIndex - 1));
  btnNext.addEventListener('click', () => selectScreen(activeIndex + 1));
  btnOpenTab.addEventListener('click', () => window.open(flatScreens[activeIndex].file, '_blank'));
  btnToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

  modeToggle.addEventListener('click', e => {
    const btn = e.target.closest('.mode-toggle-btn');
    if (btn && btn.dataset.mode !== viewMode) setViewMode(btn.dataset.mode);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); selectScreen(activeIndex - 1); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); selectScreen(activeIndex + 1); }
  });

  /* ---- Init ---- */
  buildSidebar();
  selectScreen(0);
})();
