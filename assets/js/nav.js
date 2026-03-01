/**
 * Activa el enlace de nav correspondiente a la página actual.
 * Usa el atributo data-page del <html> y de cada <a> en el nav.
 */
window.activateNavLinks = function(){
  const currentPage = document.documentElement.dataset.page || '';

  // Desktop nav
  document.querySelectorAll('#desktop-nav-links a[data-page]').forEach(a => {
    const active = a.getAttribute('data-page') === currentPage;
    a.classList.toggle('text-secondary', active);
    a.classList.toggle('font-bold', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  // Mobile nav (links clonados por setupMobileMenu llevan data-page)
  document.querySelectorAll('#mobile-nav-list a[data-page]').forEach(a => {
    const active = a.getAttribute('data-page') === currentPage;
    a.classList.toggle('text-secondary', active);
    a.classList.toggle('font-bold', active);
  });
};

/**
 * Resolve nav hrefs: sets href = root + data-href for every [data-href] element.
 * Call this AFTER injecting the header/footer into the DOM.
 * @param {string} root  e.g. '' (index) or '../../' (pages/*/)
 */
window.rewriteNavHrefs = function(root) {
  document.querySelectorAll('[data-href]').forEach(el => {
    const dh = el.getAttribute('data-href');
    el.setAttribute('href', dh === '' ? (root || './') : root + dh);
  });
};

/**
 * Configura el menú hamburguesa y clona los enlaces del nav de escritorio
 * en el nav móvil. Llámalo DESPUÉS de inyectar el header en el DOM.
 */
window.setupMobileMenu = function(){
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) { console.warn('setupMobileMenu: btn o menu no encontrados'); return; }

  // ── 1. Instalar toggle del botón hamburguesa ──────────────────────────────
  if (!window.__mobile_menu_toggle_installed) {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      const navEl = document.getElementById('top-nav');
      if (navEl) navEl.classList.toggle('mobile-open');
      document.documentElement.style.overflow =
        (document.getElementById('top-nav') || {}).classList &&
        document.getElementById('top-nav').classList.contains('mobile-open')
          ? 'hidden' : '';
    });
    const closeBtn = document.getElementById('mobile-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const navEl = document.getElementById('top-nav');
        if (navEl) navEl.classList.remove('mobile-open');
        document.documentElement.style.overflow = '';
      });
    }
    window.__mobile_menu_toggle_installed = true;
  }

  // ── 2. Clonar enlaces del nav desktop → nav móvil ────────────────────────
  const desktopNav = document.getElementById('desktop-nav-links');
  const mobileList = document.getElementById('mobile-nav-list');
  if (desktopNav && mobileList) {
    mobileList.innerHTML = '';
    desktopNav.querySelectorAll('a[href]').forEach(a => {
      const ma = document.createElement('a');
      ma.href = a.getAttribute('href') || '#';
      ma.textContent = (a.textContent || '').trim();
      ma.className = 'block px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800';
      // copiar data-page para que activateNavLinks también coloree el nav móvil
      if (a.dataset.page) ma.dataset.page = a.dataset.page;
      ma.addEventListener('click', () => {
        const navEl = document.getElementById('top-nav');
        if (navEl) navEl.classList.remove('mobile-open');
        document.documentElement.style.overflow = '';
      });
      mobileList.appendChild(ma);
    });

    // Refrescar el estado activo ahora que el nav móvil ya está construido
    if (typeof window.activateNavLinks === 'function') window.activateNavLinks();
  }
};
