const components = [
  'header',
  'hero',
  'services',
  'packages',
  'branches',
  'about',
  'credentials',
  'footer'
];

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

  // Ensure mobile menu is initialized even if header contains inline scripts (they don't execute when fetched)
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

  // Simple dark mode sync
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  });

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
      const s = document.createElement('script'); s.src = 'assets/js/services.js'; s.async = true; document.body.appendChild(s);
      for(let i=0;i<50 && !window.initServices;i++){ await new Promise(r=>setTimeout(r,50)); }
    }
    if(typeof initServices === 'function') initServices();
  }

  // Load packages renderer if the packages placeholder exists
  if(document.getElementById('component-packages') && document.getElementById('packages-grid')){
    if(!window.initPackages){
      const s2 = document.createElement('script'); s2.src = 'assets/js/packages.js'; s2.async = true; document.body.appendChild(s2);
      for(let i=0;i<50 && !window.initPackages;i++){ await new Promise(r=>setTimeout(r,50)); }
    }
    if(typeof initPackages === 'function') initPackages();
  }
}

function activateNavLinks(){
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('nav a[href]').forEach(a=>{
    const href = a.getAttribute('href') || '';
    const target = href.split('/').pop() || '';
    if(target === current || (target === '' && current === 'index.html')){
      a.classList.add('text-secondary','font-bold');
      a.setAttribute('aria-current','page');
    } else {
      a.classList.remove('text-secondary','font-bold');
      a.removeAttribute('aria-current');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
