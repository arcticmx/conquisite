// activateNavLinks: colorea el enlace del nav que coincide con data-page del <html>.
window.activateNavLinks = function () {
  var currentPage = document.documentElement.dataset.page || '';

  document.querySelectorAll('#desktop-nav-links a[data-page]').forEach(function (a) {
    var active = a.getAttribute('data-page') === currentPage;
    a.classList.toggle('text-secondary', active);
    a.classList.toggle('font-bold', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  document.querySelectorAll('#mobile-nav-list a[data-page]').forEach(function (a) {
    var active = a.getAttribute('data-page') === currentPage;
    a.classList.toggle('text-secondary', active);
    a.classList.toggle('font-bold', active);
  });
};

// rewriteNavHrefs: convierte data-href en href real.
// root = '' para index.html, '../../' para pages/X/
window.rewriteNavHrefs = function (root) {
  document.querySelectorAll('[data-href]').forEach(function (el) {
    var dh = el.getAttribute('data-href');
    el.setAttribute('href', dh === '' ? (root || './') : root + dh);
  });
};

// setupMobileMenu: instala el toggle del hamburguesa y clona los links al nav movil.
// Llamar DESPUES de inyectar el header en el DOM.
window.setupMobileMenu = function () {
  var btn  = document.getElementById('mobile-menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) {
    console.warn('setupMobileMenu: #mobile-menu-btn o #mobile-menu no encontrados');
    return;
  }

  // 1. Toggle hamburguesa (se instala solo una vez)
  if (!window.__nav_toggle_installed) {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', function () {
      var navEl = document.getElementById('top-nav');
      if (!navEl) return;
      navEl.classList.toggle('mobile-open');
      document.documentElement.style.overflow =
        navEl.classList.contains('mobile-open') ? 'hidden' : '';
    });

    var closeBtn = document.getElementById('mobile-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        var navEl = document.getElementById('top-nav');
        if (navEl) navEl.classList.remove('mobile-open');
        document.documentElement.style.overflow = '';
      });
    }
    window.__nav_toggle_installed = true;
  }

  // 2. Clonar enlaces desktop al nav movil
  var desktopNav = document.getElementById('desktop-nav-links');
  var mobileList = document.getElementById('mobile-nav-list');
  if (!desktopNav || !mobileList) return;

  mobileList.innerHTML = '';
  desktopNav.querySelectorAll('a[href]').forEach(function (a) {
    var ma = document.createElement('a');
    ma.href = a.getAttribute('href') || '#';
    ma.textContent = (a.textContent || '').trim();
    ma.className = 'block px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800';
    if (a.dataset.page) ma.dataset.page = a.dataset.page;
    ma.addEventListener('click', function () {
      var navEl = document.getElementById('top-nav');
      if (navEl) navEl.classList.remove('mobile-open');
      document.documentElement.style.overflow = '';
    });
    mobileList.appendChild(ma);
  });

  // Colorear el item activo ahora que el nav movil esta construido
  window.activateNavLinks();
};
