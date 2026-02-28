async function initPackages(){
  const container = document.getElementById('packages-grid');
  if(!container) return;
  try{
    const res = await fetch('assets/data/packages.json');
    if(!res.ok) throw new Error('packages.json not found');
    const json = await res.json();
    const items = (json.packages || []).slice(0,4);
    container.innerHTML = '';
    items.forEach(s =>{
      const card = document.createElement('div');
      card.className = 'group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-80';
      card.innerHTML = `
        <img alt="${escapeHtml(s.title)}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${escapeHtml(s.image)}"/>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-6 w-full">
          <div class="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <span class="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded">${escapeHtml(s.prep || '')}</span>
            <span class="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded">${escapeHtml(s.duration || '')}</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2 leading-tight">${escapeHtml(s.title)}</h3>
          <p class="text-slate-200 text-sm line-clamp-2 opacity-80">${escapeHtml(s.description || '')}</p>
          <div class="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
            <button class="text-white text-sm font-bold flex items-center gap-1">Ver detalles <span class="material-icons-outlined text-sm">arrow_forward</span></button>
            <div class="text-white font-bold">$ ${escapeHtml(s.price || '')}</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }catch(e){
    console.warn('Failed to load packages', e);
  }
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(()=>{ if(typeof initPackages === 'function') initPackages(); }, 80); });
