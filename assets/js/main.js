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
