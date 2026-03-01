const components = [
  'header',
  'hero',
  'services',
  'pack',
  'branches',
  'about',
  'credentials',
  'footer'
];

/** Resolve [data-href] links relative to the site root. root='' for index. */
function rewriteNavHrefs(root) {
  document.querySelectorAll('[data-href]').forEach(el => {
    const dh = el.getAttribute('data-href');
    el.setAttribute('href', dh === '' ? (root || './') : root + dh);
  });
}

async function loadComponent(name){
  try{
    const res = await fetch(`components/${name}.html`);
    if(!res.ok) throw new Error('No se encontró ' + name);
    const html = await res.text();
    const el = document.getElementById('component-' + name);
    if(el) el.innerHTML = html;
  }catch(e){
    console.warn(e);
  }
}

async function init(){
  for(const c of components) await loadComponent(c);

  // Rewrite data-href → real href now that header/footer are in the DOM
  rewriteNavHrefs('');

  (function ensureMobileMenu(){
    try{
      const btn = document.getElementById('mobile-menu-btn');
      const menu = document.getElementById('mobile-menu');
      const desktop = document.getElementById('desktop-nav-links');
      const mobileList = document.getElementById('mobile-nav-list');
      if(!btn || !menu) return;
      // toggle handler
      if(!window.__main_mobile_installed){
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', ()=>{
          const navEl = document.getElementById('top-nav');
          if(navEl) navEl.classList.toggle('mobile-open');
          if(navEl && navEl.classList.contains('mobile-open')) document.documentElement.style.overflow = 'hidden';
          else document.documentElement.style.overflow = '';
        });
        // wire close button if present (index.html may not load assets/js/nav.js)
        const closeBtn = document.getElementById('mobile-menu-close');
        if(closeBtn && !window.__main_mobile_close_installed){
          closeBtn.addEventListener('click', ()=>{ const navEl = document.getElementById('top-nav'); if(navEl) navEl.classList.remove('mobile-open'); document.documentElement.style.overflow = ''; });
          window.__main_mobile_close_installed = true;
        }
        window.__main_mobile_installed = true;
      }
      // build mobile links from desktop nav
      if(desktop && mobileList){
        mobileList.innerHTML = '';
        desktop.querySelectorAll('a[href]').forEach(a=>{
          const href = a.getAttribute('href') || '#';
          const text = (a.textContent || '').trim();
          const item = document.createElement('a');
          item.href = href;
          item.className = 'block px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800';
          item.textContent = text;
          item.addEventListener('click', (ev)=>{
            const navEl = document.getElementById('top-nav'); if(navEl) navEl.classList.remove('mobile-open');
            document.documentElement.style.overflow = '';
            if(href && href !== '#' && !href.startsWith('http')){
              ev.preventDefault();
              setTimeout(()=> location.href = href, 80);
            }
          });
          mobileList.appendChild(item);
        });
      }
    }catch(e){ console.warn('ensureMobileMenu error', e); }
  })();

  // Simple dark mode sync (desactivado — descomentar para re-habilitar)
  // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  //   document.documentElement.classList.add('dark');
  // }
  // window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  //   if (event.matches) document.documentElement.classList.add('dark');
  //   else document.documentElement.classList.remove('dark');
  // });

  // Load nav helper (if not present) and activate nav links
  await (async function loadNav(){
    if(window.activateNavLinks) return;
    if(document.querySelector('script[src="assets/js/nav.js"]')){
      // wait until it defines the helper
      for(let i=0;i<50 && !window.activateNavLinks;i++){ await new Promise(r=>setTimeout(r,50)); }
      return;
    }
    const s = document.createElement('script'); s.src = 'assets/js/nav.js'; s.async = true; document.body.appendChild(s);
    for(let i=0;i<50 && !window.activateNavLinks;i++){ await new Promise(r=>setTimeout(r,50)); }
  })();
  if(typeof activateNavLinks === 'function') activateNavLinks();
  // also initialize mobile menu if nav helper provided it
  if(typeof window.setupMobileMenu === 'function'){
    try{ window.setupMobileMenu(); }catch(e){ console.warn('setupMobileMenu failed', e); }
  }

  // Load services renderer if the services placeholder exists
  if(document.getElementById('component-services') && document.getElementById('services-grid')){
    if(!window.initServices){
      const s = document.createElement('script'); s.src = 'assets/js/home-studies.js'; s.async = true; document.body.appendChild(s);
      for(let i=0;i<50 && !window.initServices;i++){ await new Promise(r=>setTimeout(r,50)); }
    }
    if(typeof initServices === 'function') initServices();
  }

  // Load packages renderer if the packages placeholder exists
  if(document.getElementById('component-pack') && document.getElementById('packages-grid')){
    if(!window.initPackages){
      const s2 = document.createElement('script'); s2.src = 'assets/js/home-pack.js'; s2.async = true; document.body.appendChild(s2);
      for(let i=0;i<50 && !window.initPackages;i++){ await new Promise(r=>setTimeout(r,50)); }
    }
    if(typeof initPackages === 'function') initPackages();
  }

  // WhatsApp: boton hero
  var btnHeroWA = document.getElementById('btn-hero-agendar');
  if(btnHeroWA && window.WA){ btnHeroWA.addEventListener('click', function(){ window.WA.agendarGeneral(); }); }
}

function activateNavLinks(){
  const currentPage = document.documentElement.dataset.page || '';
  document.querySelectorAll('#desktop-nav-links a[data-page]').forEach(a => {
    const page = a.getAttribute('data-page');
    const active = page === currentPage;
    a.classList.toggle('text-secondary', active);
    a.classList.toggle('font-bold', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
window.activateNavLinks = activateNavLinks;

document.addEventListener('DOMContentLoaded', init);
