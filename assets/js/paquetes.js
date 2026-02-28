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
  await loadComponentTo('component-header','components/header.html');
  await loadComponentTo('component-packages-hero','components/packages-hero.html');
  await loadComponentTo('component-packages-content','components/packages-list.html');
  await loadComponentTo('component-footer','components/footer.html');

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  });

  // ensure nav helper is loaded and activate nav
  if(!window.activateNavLinks){
    const s = document.createElement('script'); s.src = 'assets/js/nav.js'; s.async = true; document.body.appendChild(s);
    await new Promise(r=>setTimeout(r,100));
  }
  if(typeof activateNavLinks === 'function') activateNavLinks();
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
    const res = await fetch('assets/data/packages.json');
    const json = await res.json();
    packagesData = (json.packages || []).map((s,idx)=> ({...s, __index: idx}));
    filtered = packagesData.slice();
  }catch(e){
    console.warn('No se pudo cargar packages.json', e);
    packagesData = [];
    filtered = [];
  }
}

function renderCategories(){
  const container = document.getElementById('package-categories');
  if(!container) return;
  const categories = ['All', ...Array.from(new Set(packagesData.map(s=>s.category)))];
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
    });
    const arrow = document.createElement('span');
    arrow.className = 'material-icons-outlined text-lg opacity-0 group-hover:opacity-100 transition-opacity';
    arrow.textContent = 'chevron_right';
    btn.appendChild(arrow);
    container.appendChild(btn);
  });
}

function renderGrid(){
  const grid = document.getElementById('package-grid');
  const countEl = document.querySelector('.mb-6 p span.font-bold');
  if(!grid) return;
  const start = (currentPage-1)*PACKAGES_PER_PAGE;
  const pageItems = filtered.slice(start, start+PACKAGES_PER_PAGE);
  grid.innerHTML = '';
  pageItems.forEach(s=>{
    const card = document.createElement('div');
    card.className = 'group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-72';
    card.addEventListener('click', () => { location.href = `pack-detail.html?id=${s.id}`; });
    card.innerHTML = `
      <img alt="${s.title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${s.image}"/>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
      <div class="absolute bottom-0 left-0 p-6 w-full">
        <div class="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"><span class="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded">${s.prep || ''}</span></div>
        <h3 class="text-xl font-bold text-white mb-1 leading-tight">${s.title}</h3>
        <p class="text-slate-200 text-xs line-clamp-2 opacity-80 mb-2">${s.description}</p>
        <div class="flex items-center gap-3">
          <a href="pack-detail.html?id=${s.id}" class="text-white text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">Ver paquete <span class="material-icons-outlined text-sm">arrow_forward</span></a>
          <span class="text-white font-bold ml-auto">$ ${s.price || ''}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
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
