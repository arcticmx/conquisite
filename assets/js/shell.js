/**
 * shell.js — Carga encabezado, pie de página y nav para páginas de detalle.
 * El elemento <html> debe tener data-base="../../" para apuntar a la raíz.
 */
(async function initShell() {
  const base = document.documentElement.dataset.base || '';

  async function loadTo(id, path) {
    try {
      const r = await fetch(base + path);
      if (!r.ok) throw new Error(path);
      const el = document.getElementById(id);
      if (el) el.innerHTML = await r.text();
    } catch (e) {
      console.warn('shell:', e);
    }
  }

  await loadTo('component-header', 'components/header.html');
  await loadTo('component-footer', 'components/footer.html');

  // Resolve data-href links now that header/footer are in the DOM
  document.querySelectorAll('[data-href]').forEach(el => {
    const dh = el.getAttribute('data-href');
    el.setAttribute('href', dh === '' ? (base || './') : base + dh);
  });

  // Dark mode sync (desactivado — descomentar para re-habilitar)
  // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  //   document.documentElement.classList.add('dark');
  // }
  // window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  //   document.documentElement.classList.toggle('dark', e.matches);
  // });

  // Inject nav helper
  const s = document.createElement('script');
  s.src = base + 'assets/js/nav.js';
  s.async = true;
  document.body.appendChild(s);
})();
