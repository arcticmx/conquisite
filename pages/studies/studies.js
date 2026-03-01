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
  await loadComponentTo('component-studies-hero','hero.html');
  await loadComponentTo('component-studies-content','list.html');
  await loadComponentTo('component-footer','../../components/footer.html');

  // Dark mode sync (same behaviour as main)
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  });

  // Activate nav links after header has been injected
  // Ensure nav helper is loaded and activate nav
  // Ensure navigation helper and mobile menu script are present.
  if(!window.activateNavLinks || !window.setupMobileMenu){
    const s = document.createElement('script'); s.src = '../../assets/js/nav.js'; s.async = true; document.body.appendChild(s);
    for(let i=0;i<50 && !(window.activateNavLinks && window.setupMobileMenu);i++){ await new Promise(r=>setTimeout(r,50)); }
  }
  if(typeof activateNavLinks === 'function') activateNavLinks();
  if(typeof window.setupMobileMenu === 'function'){
    try{ window.setupMobileMenu(); }catch(e){ console.warn('setupMobileMenu failed', e); }
  }
  // end nav init
}

// --- Studies dynamic rendering (search, categories, pagination) ---
const STUDIES_PER_PAGE = 6;
let studiesData = [];
let filtered = [];
let currentPage = 1;
let currentCategory = 'All';
let currentSort = 'relevance';

async function fetchStudies(){
  try{
    const res = await fetch('../../assets/data/studies.json');
    const json = await res.json();
    studiesData = (json.studies || []).map((s,idx)=> ({...s, __index: idx}));
    filtered = studiesData.slice();
  }catch(e){
    console.warn('No se pudo cargar studies.json', e);
    studiesData = [];
    filtered = [];
  }
}

function renderCategories(){
  const container = document.getElementById('study-categories');
  if(!container) return;
  const categories = ['All', ...Array.from(new Set(studiesData.map(s=>s.category)))];
  container.innerHTML = '';
  categories.forEach((cat,idx)=>{
    const btn = document.createElement('button');
    btn.className = 'w-full text-left px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary dark:hover:text-blue-300 font-medium text-sm flex justify-between items-center group transition-colors';
    if(idx===0) btn.classList.add('bg-blue-50','dark:bg-blue-900/20','text-primary','dark:text-blue-300','font-bold');
    btn.textContent = (cat==='All') ? 'Todos los servicios' : cat;
    btn.dataset.category = cat;
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#study-categories button').forEach(b=>b.classList.remove('bg-blue-50','dark:bg-blue-900/20','text-primary','dark:text-blue-300','font-bold'));
      btn.classList.add('bg-blue-50','dark:bg-blue-900/20','text-primary','dark:text-blue-300','font-bold');
      currentCategory = cat;
      currentPage = 1;
      applyFilters();
    });
    const arrow = document.createElement('span');
    arrow.className = 'material-icons-outlined text-lg opacity-0 group-hover:opacity-100 transition-opacity';
    arrow.textContent = 'chevron_right';
    btn.appendChild(arrow);
    container.appendChild(btn);
  });
  // Setup mobile collapse behavior if panel/toggle exist
  const toggle = document.getElementById('study-categories-toggle');
  const panel = document.getElementById('study-categories-panel');
  if(toggle && panel){
    const isDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
    // collapsed by default on mobile
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
      if(expanded){ panel.style.display = 'none'; toggle.setAttribute('aria-expanded','false'); toggle.querySelector('.material-icons-outlined').textContent = 'expand_more'; }
      else { panel.style.display = 'block'; toggle.setAttribute('aria-expanded','true'); toggle.querySelector('.material-icons-outlined').textContent = 'expand_less'; }
    });
    // keep behavior in sync on resize
    let _t;
    window.addEventListener('resize', ()=>{
      clearTimeout(_t);
      _t = setTimeout(()=>{
        const nowDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
        if(nowDesktop){ panel.style.display = 'block'; toggle.setAttribute('aria-expanded','true'); toggle.querySelector('.material-icons-outlined').textContent = 'expand_less'; }
        else { panel.style.display = 'none'; toggle.setAttribute('aria-expanded','false'); toggle.querySelector('.material-icons-outlined').textContent = 'expand_more'; }
      }, 120);
    });
  }
}

function renderGrid(){
  const grid = document.getElementById('studies-list-grid');
  const accordion = document.getElementById('studies-list-accordion');
  const countEl = document.querySelector('.mb-6 p span.font-bold');
  if(!grid && !accordion) return;
  // compute slice
  const start = (currentPage-1)*STUDIES_PER_PAGE;
  const pageItems = filtered.slice(start, start+STUDIES_PER_PAGE);

  // render grid for md+
  if(grid){
    grid.innerHTML = '';
    pageItems.forEach(s=>{
      const card = createStudyCard(s, { extraClass: 'h-72' });
      grid.appendChild(card);
    });
  }

  // render accordion for mobile
  if(accordion){
    accordion.innerHTML = '';
    pageItems.forEach(s=>{
      const item = document.createElement('div');
      item.className = 'bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700';
      const prepChip = (s.preparation && s.preparation.length)
        ? `<span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">${s.preparation[0].split(':')[0] || s.preparation[0]}</span>`
        : '';
      const durChip = s.duration
        ? `<span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">${s.duration}</span>`
        : '';
      item.innerHTML = `
        <div class="flex items-center justify-between p-3 cursor-pointer">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <img src="${s.image}" alt="${s.title}" class="w-12 h-12 rounded-lg object-cover shrink-0"/>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-slate-800 dark:text-white truncate">${s.title}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">${s.category}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 pl-2">
            ${s.price ? `<span class="text-sm font-bold text-primary hidden sm:block">$${Number(s.price).toLocaleString('es-MX')}</span>` : ''}
            <button class="accordion-toggle p-2 rounded-md text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50" aria-expanded="false">
              <span class="material-icons-outlined">expand_more</span>
            </button>
          </div>
        </div>
        <div class="accordion-panel hidden border-t border-slate-100 dark:border-slate-700">
          <div class="p-4 flex-1 min-w-0">
            <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">${s.description}</p>
            <div class="flex items-center gap-3 mt-2">
              ${prepChip}${durChip}
            </div>
          </div>
          <div class="px-4 pb-4 flex items-center justify-between">
            ${s.price ? `<span class="text-lg font-bold text-primary">$${Number(s.price).toLocaleString('es-MX')} <span class="text-xs font-normal text-slate-400">MXN</span></span>` : '<span></span>'}
            <a href="detail.html?id=${encodeURIComponent(s.id)}" class="inline-flex items-center gap-1 bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Ver estudio <span class="material-icons-outlined text-sm">arrow_forward</span>
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
        if(ev.target.closest('a')) return;
        doToggle();
      });
      toggleBtn.addEventListener('click', (ev)=>{ ev.stopPropagation(); doToggle(); });

      accordion.appendChild(item);
    });
  }

  if(countEl) countEl.textContent = filtered.length;
  renderPagination();
}

function renderPagination(){
  const totalPages = Math.max(1, Math.ceil(filtered.length / STUDIES_PER_PAGE));
  const nav = document.getElementById('study-pagination');
  if(!nav){
    // fallback: find existing nav and set id
    const found = document.querySelector('nav.flex.items-center');
    if(found) found.id = 'study-pagination';
  }
  const pagination = document.getElementById('study-pagination');
  if(!pagination) return;
  pagination.innerHTML = '';
  const createBtn = (content, disabled, cls)=>{
    const b = document.createElement('button');
    b.className = `w-10 h-10 flex items-center justify-center rounded-lg ${cls || ''}`;
    if(disabled) b.setAttribute('disabled','');
    b.innerHTML = content;
    return b;
  };
  const left = createBtn('<span class="material-icons-outlined">chevron_left</span>', currentPage===1, 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500');
  left.addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderGrid(); } });
  pagination.appendChild(left);
  for(let p=1;p<=totalPages;p++){
    const cls = (p===currentPage) ? 'bg-primary text-white font-bold shadow-md shadow-blue-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium';
    const btn = createBtn(p.toString(), false, cls);
    btn.addEventListener('click', ()=>{ currentPage = p; renderGrid(); });
    pagination.appendChild(btn);
  }
  const right = createBtn('<span class="material-icons-outlined">chevron_right</span>', currentPage===totalPages, 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500');
  right.addEventListener('click', ()=>{ if(currentPage<totalPages){ currentPage++; renderGrid(); } });
  pagination.appendChild(right);
}

function applyFilters(){
  const q = (document.getElementById('study-search')?.value || '').trim().toLowerCase();
  filtered = studiesData.filter(s => {
    const matchCat = (currentCategory === 'All') || (s.category === currentCategory);
    const matchQ = q === '' || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  // Apply sorting
  if(currentSort === 'name'){
    filtered.sort((a,b)=> a.title.localeCompare(b.title, 'es', {sensitivity:'base'}));
  } else if(currentSort === 'popular'){
    filtered.sort((a,b)=> (b.popularity || b.id) - (a.popularity || a.id));
  } else {
    // relevance -> original order
    filtered.sort((a,b)=> (a.__index || 0) - (b.__index || 0));
  }
  renderGrid();
}

function setupSearch(){
  const input = document.getElementById('study-search');
  if(!input) return;
  let t;
  input.addEventListener('input', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{ currentPage=1; applyFilters(); }, 250);
  });
}

function setupSort(){
  const sel = document.getElementById('study-sort');
  if(!sel) return;
  sel.addEventListener('change', ()=>{
    currentSort = sel.value || 'relevance';
    currentPage = 1;
    applyFilters();
  });
}

async function initStudies(){
  await fetchStudies();
  renderCategories();
  setupSearch();
  setupSort();
  applyFilters();
}

// kick off after components load
document.addEventListener('DOMContentLoaded', ()=>{
  // small timeout to ensure component-studies-content exists
  setTimeout(()=>{ initStudies(); }, 60);
});

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
