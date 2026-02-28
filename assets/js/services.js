async function initServices(){
  const container = document.getElementById('services-grid');
  if(!container) return;
  try{
    const res = await fetch('assets/data/studies.json');
    if(!res.ok) throw new Error('studies.json not found');
    const json = await res.json();
    const items = (json.studies || []).slice(0,4);
    container.innerHTML = '';
    items.forEach(s =>{
      const card = document.createElement('div');
      card.className = 'group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-80 min-w-[80%] sm:min-w-[45%] md:min-w-full snap-start';
      card.innerHTML = `
        <img alt="${escapeHtml(s.title)}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${escapeHtml(s.image)}"/>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-6 w-full">
          <div class="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <span class="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded">${escapeHtml(s.prep || '')}</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2 leading-tight">${escapeHtml(s.title)}</h3>
          <p class="text-slate-200 text-sm line-clamp-2 opacity-80">${escapeHtml(s.description || '')}</p>
          <button class="mt-4 text-white text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">Ver detalles <span class="material-icons-outlined text-sm">arrow_forward</span></button>
        </div>
      `;
      container.appendChild(card);
      // navigate to study detail when clicked
      card.addEventListener('click', ()=>{ window.location.href = `study-detail.html?id=${encodeURIComponent(s.id)}`; });
      const btn = card.querySelector('button');
      if(btn) btn.addEventListener('click', (ev)=>{ ev.stopPropagation(); window.location.href = `study-detail.html?id=${encodeURIComponent(s.id)}`; });
    });
  }catch(e){
    console.warn('Failed to load services', e);
  }
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Auto-init if the page already loaded components
document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{ if(typeof initServices === 'function') initServices(); }, 80);
});
