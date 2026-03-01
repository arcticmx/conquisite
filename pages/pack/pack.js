// Detail page is in same folder when used from pack listing
window.PACK_DETAIL_PATH = 'detail.html';

/** Resolve [data-href] links relative to root. */
function rewriteNavHrefs(root) {
  document.querySelectorAll('[data-href]').forEach(el => {
    const dh = el.getAttribute('data-href');
    el.setAttribute('href', dh === '' ? (root || './') : root + dh);
  });
}

async function loadComponentTo(id, path){
  try{
    const res = await fetch(path);
    if(!res.ok) throw new Error(path + ' not found');
    document.getElementById(id).innerHTML = await res.text();
  }catch(e){
    console.warn(e);
  }
}

async function init(){
  await loadComponentTo('component-header','../../components/header.html');
  await loadComponentTo('component-packages-hero','hero.html');
  await loadComponentTo('component-packages-content','list.html');
  await loadComponentTo('component-footer','../../components/footer.html');

  // Resolve data-href links now that header/footer are in the DOM
  rewriteNavHrefs('../../');

  // Dark mode sync (desactivado — descomentar para re-habilitar)
  // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  //   document.documentElement.classList.add('dark');
  // }
  // window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  //   if (event.matches) document.documentElement.classList.add('dark');
  //   else document.documentElement.classList.remove('dark');
  // });

  // nav.js cargado como script estático — invocar helpers directamente
  if(typeof window.setupMobileMenu === 'function') window.setupMobileMenu();
  if(typeof window.activateNavLinks === 'function') window.activateNavLinks();
}

// --- Packages dynamic rendering (search, categories, pagination) ---
const PACKAGES_PER_PAGE = 6;
let packagesData = [];
let filtered = [];
let currentPage = 1;
let currentCategory = 'All';
let currentSort = 'relevance';

async function fetchPackages(){
  try{
    const res = await fetch('../../assets/data/pack.json');
    const json = await res.json();
    packagesData = (json.packages || []).map((s,idx)=> ({...s, __index: idx}));
    filtered = packagesData.slice();
  }catch(e){
    console.warn('No se pudo cargar pack.json', e);
    packagesData = [];
    filtered = [];
  }
}

function renderCategories(){
  const container = document.getElementById('package-categories');
  if(!container) return;
  const categories = ['All', ...Array.from(new Set(packagesData.map(s=>s.category)))];

  // update badge count
  const badge = document.getElementById('package-categories-count');
  if(badge) badge.textContent = categories.length - 1; // excluding "All"

  container.innerHTML = '';
  categories.forEach((cat,idx)=>{
    const btn = document.createElement('button');
    btn.className = 'w-full text-left px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary dark:hover:text-blue-300 font-medium text-sm flex justify-between items-center group transition-colors';
    if(idx===0) btn.classList.add('bg-blue-50','dark:bg-blue-900/20','text-primary','dark:text-blue-300','font-bold');
    btn.textContent = (cat==='All') ? 'Todos los paquetes' : cat;
    btn.dataset.category = cat;
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#package-categories button').forEach(b=>b.classList.remove('bg-blue-50','dark:bg-blue-900/20','text-primary','dark:text-blue-300','font-bold'));
      btn.classList.add('bg-blue-50','dark:bg-blue-900/20','text-primary','dark:text-blue-300','font-bold');
      currentCategory = cat;
      currentPage = 1;
      applyFilters();
      // collapse panel on mobile after selecting
      const panel = document.getElementById('package-categories-panel');
      const toggle = document.getElementById('package-categories-toggle');
      if(panel && toggle && window.matchMedia('(max-width: 639px)').matches){
        panel.style.display = 'none';
        toggle.setAttribute('aria-expanded','false');
        toggle.querySelector('.material-icons-outlined').textContent = 'expand_more';
      }
    });
    const arrow = document.createElement('span');
    arrow.className = 'material-icons-outlined text-lg opacity-0 group-hover:opacity-100 transition-opacity';
    arrow.textContent = 'chevron_right';
    btn.appendChild(arrow);
    container.appendChild(btn);
  });

  // Setup mobile collapse behavior
  const toggle = document.getElementById('package-categories-toggle');
  const panel = document.getElementById('package-categories-panel');
  if(toggle && panel){
    const isDesktop = window.matchMedia && window.matchMedia('(min-width: 640px)').matches;
    if(!isDesktop){
      panel.style.display = 'none';
      toggle.setAttribute('aria-expanded','false');
      toggle.querySelector('.material-icons-outlined').textContent = 'expand_more';
    } else {
      panel.style.display = 'block';
      toggle.setAttribute('aria-expanded','true');
      toggle.querySelector('.material-icons-outlined').textContent = 'expand_less';
    }
    toggle.addEventListener('click', ()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if(expanded){
        panel.style.display = 'none';
        toggle.setAttribute('aria-expanded','false');
        toggle.querySelector('.material-icons-outlined').textContent = 'expand_more';
      } else {
        panel.style.display = 'block';
        toggle.setAttribute('aria-expanded','true');
        toggle.querySelector('.material-icons-outlined').textContent = 'expand_less';
      }
    });
    let _rt;
    window.addEventListener('resize', ()=>{
      clearTimeout(_rt);
      _rt = setTimeout(()=>{
        const nowDesktop = window.matchMedia('(min-width: 640px)').matches;
        if(nowDesktop){
          panel.style.display = 'block';
          toggle.setAttribute('aria-expanded','true');
          toggle.querySelector('.material-icons-outlined').textContent = 'expand_less';
        } else {
          panel.style.display = 'none';
          toggle.setAttribute('aria-expanded','false');
          toggle.querySelector('.material-icons-outlined').textContent = 'expand_more';
        }
      }, 120);
    });
  }
}

function renderGrid(){
  const grid = document.getElementById('package-grid');
  const accordion = document.getElementById('packages-list-accordion');
  const countEl = document.getElementById('package-count-label');
  if(!grid && !accordion) return;
  const start = (currentPage-1)*PACKAGES_PER_PAGE;
  const pageItems = filtered.slice(start, start+PACKAGES_PER_PAGE);

  // ── Grid md+ ─────────────────────────────────────────────────────────────
  if(grid){
    grid.innerHTML = '';
    if(pageItems.length === 0){
      grid.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
        <span class="material-icons-outlined text-5xl mb-3">search_off</span>
        <p class="text-lg font-medium">Sin elementos para mostrar</p>
        <p class="text-sm mt-1">Intenta con otro filtro o término de búsqueda</p>
      </div>`;
    } else {
      pageItems.forEach(s=>{
        const card = createPackCard(s, { extraClass: 'h-72' });
        grid.appendChild(card);
      });
    }
  }

  // ── Accordion mobile ──────────────────────────────────────────────────────
  if(accordion){
    accordion.innerHTML = '';
    if(pageItems.length === 0){
      accordion.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <span class="material-icons-outlined text-5xl mb-3">search_off</span>
        <p class="text-base font-medium">Sin elementos para mostrar</p>
        <p class="text-sm mt-1">Intenta con otro filtro o término de búsqueda</p>
      </div>`;
    } else {
      pageItems.forEach(s=>{
      const item = document.createElement('div');
      item.className = 'bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700';
      item.innerHTML = `
        <div class="flex items-center justify-between p-3 cursor-pointer">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <img src="${s.image}" alt="${s.title}" class="w-12 h-12 rounded-lg object-cover shrink-0"/>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-slate-800 dark:text-white truncate">${s.title}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">${s.category || ''}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 pl-2">
            <span class="text-sm font-bold text-primary hidden sm:block">$${Number(s.price||0).toLocaleString('es-MX')}</span>
            <button class="accordion-toggle p-2 rounded-md text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50" aria-expanded="false">
              <span class="material-icons-outlined">expand_more</span>
            </button>
          </div>
        </div>
        <div class="accordion-panel hidden border-t border-slate-100 dark:border-slate-700">
          <div class="p-4 flex gap-4">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">${s.description}</p>
              <div class="flex items-center gap-3 mt-2">
                ${s.prep ? `<span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">${s.prep}</span>` : ''}
                ${s.duration ? `<span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">${s.duration}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="px-4 pb-4 flex items-center justify-between">
            <span class="text-lg font-bold text-primary">$${Number(s.price||0).toLocaleString('es-MX')} <span class="text-xs font-normal text-slate-400">MXN</span></span>
            <a href="detail.html?id=${s.id}" class="inline-flex items-center gap-1 bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Ver paquete <span class="material-icons-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
      `;

      const header = item.firstElementChild;
      const toggleBtn = item.querySelector('.accordion-toggle');
      const panel = item.querySelector('.accordion-panel');

      function doToggle(){
        const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', (!expanded).toString());
        if(expanded){
          panel.classList.add('hidden');
          toggleBtn.querySelector('.material-icons-outlined').textContent = 'expand_more';
        } else {
          panel.classList.remove('hidden');
          toggleBtn.querySelector('.material-icons-outlined').textContent = 'expand_less';
        }
      }

      header.addEventListener('click', (ev)=>{
        if(ev.target.closest('a')) return; // let links navigate
        doToggle();
      });
      toggleBtn.addEventListener('click', (ev)=>{ ev.stopPropagation(); doToggle(); });

      accordion.appendChild(item);
    });
    }
  }

  if(countEl) countEl.textContent = filtered.length;
  renderPagination();
}

function renderPagination(){
  const totalPages = Math.max(1, Math.ceil(filtered.length / PACKAGES_PER_PAGE));
  const nav = document.getElementById('package-pagination');
  if(!nav) return;
  nav.innerHTML = '';
  const createBtn = (content, disabled, cls)=>{
    const b = document.createElement('button');
    b.className = `w-10 h-10 flex items-center justify-center rounded-lg ${cls || ''}`;
    if(disabled) b.setAttribute('disabled','');
    b.innerHTML = content;
    return b;
  };
  const left = createBtn('<span class="material-icons-outlined">chevron_left</span>', currentPage===1, 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500');
  left.addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderGrid(); } });
  nav.appendChild(left);
  for(let p=1;p<=totalPages;p++){
    const cls = (p===currentPage) ? 'bg-primary text-white font-bold shadow-md shadow-blue-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium';
    const btn = createBtn(p.toString(), false, cls);
    btn.addEventListener('click', ()=>{ currentPage = p; renderGrid(); });
    nav.appendChild(btn);
  }
  const right = createBtn('<span class="material-icons-outlined">chevron_right</span>', currentPage===totalPages, 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500');
  right.addEventListener('click', ()=>{ if(currentPage<totalPages){ currentPage++; renderGrid(); } });
  nav.appendChild(right);
}

function applyFilters(){
  const q = (document.getElementById('package-search')?.value || '').trim().toLowerCase();
  filtered = packagesData.filter(s => {
    const matchCat = (currentCategory === 'All') || (s.category === currentCategory);
    const matchQ = q === '' || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  if(currentSort === 'name'){
    filtered.sort((a,b)=> a.title.localeCompare(b.title, 'es', {sensitivity:'base'}));
  } else if(currentSort === 'popular'){
    filtered.sort((a,b)=> (b.popularity || b.id) - (a.popularity || a.id));
  } else {
    filtered.sort((a,b)=> (a.__index || 0) - (b.__index || 0));
  }
  renderGrid();
}

function setupSearch(){
  const input = document.getElementById('package-search');
  if(!input) return;
  let t;
  input.addEventListener('input', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{ currentPage=1; applyFilters(); }, 250);
  });
}

function setupSort(){
  const sel = document.getElementById('package-sort');
  if(!sel) return;
  sel.addEventListener('change', ()=>{
    currentSort = sel.value || 'relevance';
    currentPage = 1;
    applyFilters();
  });
}

async function initPackages(){
  await fetchPackages();
  renderCategories();
  setupSearch();
  setupSort();
  applyFilters();
}

// kick off after components load
document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{ initPackages(); }, 60);
});

document.addEventListener('DOMContentLoaded', init);
