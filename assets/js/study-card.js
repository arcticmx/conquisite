/**
 * study-card.js — Shared factory for study image cards.
 * Used by services.js (index.html) and estudios.js (estudios.html).
 *
 * @param {Object} s          Study object from studies.json
 * @param {Object} [opts]
 * @param {string} [opts.extraClass]  Extra Tailwind classes added to the root card element (e.g. sizing)
 * @param {string} [opts.linkText]    CTA label (default: "Ver estudio")
 * @returns {HTMLElement}
 */
function createStudyCard(s, { extraClass = '', linkText = 'Ver estudio' } = {}) {
  const card = document.createElement('div');
  card.className = `group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer ${extraClass}`;

  const price = s.price
    ? `<span class="text-white font-bold ml-auto">$${Number(s.price).toLocaleString('es-MX')}</span>`
    : '';

  card.innerHTML = `
    <img
      alt="${s.title}"
      src="${s.image}"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
    <div class="absolute bottom-0 left-0 p-6 w-full">
      <div class="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <span class="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded">${s.category || ''}</span>
      </div>
      <h3 class="text-xl font-bold text-white mb-1 leading-tight">${s.title}</h3>
      <p class="text-slate-200 text-xs line-clamp-2 opacity-80 mb-2">${s.description || ''}</p>
      <div class="flex items-center gap-3">
        <a
          href="study-detail.html?id=${encodeURIComponent(s.id)}"
          class="text-white text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75"
        >${linkText} <span class="material-icons-outlined text-sm">arrow_forward</span></a>
        ${price}
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.href = `study-detail.html?id=${encodeURIComponent(s.id)}`;
  });

  return card;
}
