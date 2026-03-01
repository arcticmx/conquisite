/**
 * pack-detail.js
 * Carga y renderiza la página de detalle de un paquete desde pack.json
 * basado en el parámetro ?id= de la URL.
 */
(async function () {
  function qv(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  // ── Esperar a que el DOM esté listo ─────────────────────────────────────
  await new Promise((resolve) => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', resolve);
  });

  const id = qv('id');
  if (!id) return;

  try {
    const res = await fetch('../../assets/data/pack.json');
    if (!res.ok) throw new Error('pack.json no encontrado');
    const json = await res.json();
    const pkg = (json.packages || []).find((x) => String(x.id) === String(id));
    if (!pkg) return;

    // ── Actualizar <title> ───────────────────────────────────────────────
    document.title = `CONQUI - ${pkg.title}`;

    // ── Sección Hero ─────────────────────────────────────────────────────
    const img = document.getElementById('pack-image');
    if (img && pkg.image) { img.src = pkg.image; img.alt = pkg.title; }

    setText('pack-breadcrumb', pkg.title || 'Detalle');
    setText('pack-category', pkg.category || '');
    setText('pack-title', pkg.title || '');
    setText('pack-short', pkg.description || '');

    // ── Sección: ¿Qué incluye? ────────────────────────────────────────────
    const includesGrid = document.getElementById('pack-includes');
    if (includesGrid && Array.isArray(pkg.includes)) {
      includesGrid.innerHTML = pkg.includes.map((item) => `
        <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <span class="material-symbols-outlined text-primary mt-0.5" style="font-variation-settings:'FILL' 0,'wght' 400">${escHtml(item.icon || 'check_circle')}</span>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white text-sm">${escHtml(item.title)}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">${escHtml(item.description)}</p>
          </div>
        </div>
      `).join('');
    }

    // ── Sección: Beneficios ───────────────────────────────────────────────
    const benefitsEl = document.getElementById('pack-benefits');
    if (benefitsEl) benefitsEl.textContent = pkg.benefits || '';

    const tipEl = document.getElementById('pack-benefits-tip-text');
    if (tipEl && pkg.benefits_tip) {
      const parts = pkg.benefits_tip.split(':');
      if (parts.length > 1) {
        tipEl.innerHTML = `<strong>${escHtml(parts[0])}:</strong>${escHtml(parts.slice(1).join(':'))}`;
      } else {
        tipEl.textContent = pkg.benefits_tip;
      }
    } else if (!pkg.benefits_tip) {
      const tipContainer = document.getElementById('pack-benefits-tip');
      if (tipContainer) tipContainer.classList.add('hidden');
    }

    // ── Sección: Preparación ──────────────────────────────────────────────
    const prepList = document.getElementById('pack-prep');
    if (prepList && Array.isArray(pkg.preparation)) {
      prepList.innerHTML = pkg.preparation.map((step) => `
        <li class="flex gap-4 items-start">
          <div class="min-w-[40px] h-10 rounded-full bg-primary/10 dark:bg-slate-700 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary" style="font-variation-settings:'FILL' 0,'wght' 400">${escHtml(step.icon || 'check')}</span>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-slate-100">${escHtml(step.title)}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${escHtml(step.description)}</p>
          </div>
        </li>
      `).join('');
    }

    // ── Sección: Ubicaciones ──────────────────────────────────────────────
    const locContainer = document.getElementById('pack-locations');
    if (locContainer && Array.isArray(pkg.locations) && pkg.locations.length) {
      locContainer.innerHTML = pkg.locations.map((loc) => {
        const dot = loc.available
          ? '<div class="w-2 h-2 rounded-full bg-green-500"></div><span class="text-xs font-medium text-green-600 dark:text-green-400">'
          : '<div class="w-2 h-2 rounded-full bg-slate-400"></div><span class="text-xs font-medium text-slate-500 dark:text-slate-400">';
        return `
          <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors group">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-bold text-primary dark:text-white group-hover:text-secondary transition-colors">${escHtml(loc.name)}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${escHtml(loc.address)}</p>
                <div class="flex items-center gap-2 mt-3">
                  ${dot}${escHtml(loc.availability)}</span>
                </div>
              </div>
              <span class="material-icons-outlined text-slate-300 dark:text-slate-600 text-3xl mt-1 ml-2">apartment</span>
            </div>
          </div>
        `;
      }).join('');
    } else if (locContainer) {
      locContainer.innerHTML = '<p class="text-sm text-slate-500 col-span-2">Consulta disponibilidad por teléfono.</p>';
    }

    // ── Sidebar: Precio ───────────────────────────────────────────────────
    const priceEl = document.getElementById('pack-price');
    if (priceEl) {
      const price = Number(pkg.price);
      priceEl.textContent = price ? `$${price.toLocaleString('es-MX')}` : '$0';
    }

    if (pkg.regular_price) {
      const regEl = document.getElementById('pack-regular-price');
      if (regEl) {
        regEl.textContent = `Precio regular: $${Number(pkg.regular_price).toLocaleString('es-MX')} MXN`;
        show('pack-regular-price');
      }
    }

    if (pkg.savings_label) {
      const badge = document.getElementById('pack-savings-badge');
      if (badge) { badge.textContent = pkg.savings_label; show('pack-savings-badge'); }
    }

    // ── Sidebar: Duración y Resultados ────────────────────────────────────
    const durEl = document.getElementById('pack-duration');
    if (durEl) durEl.textContent = pkg.duration ? `Duración total: ${pkg.duration}` : 'Duración: --';

    const resEl = document.getElementById('pack-results');
    if (resEl) resEl.textContent = pkg.results ? `Resultados completos en ${pkg.results}` : 'Resultados: --';

  } catch (e) {
    console.warn('pack-detail.js:', e);
  }
})();
