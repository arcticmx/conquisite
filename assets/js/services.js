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
      const card = createStudyCard(s, {
        extraClass: 'h-80 min-w-[80%] sm:min-w-[45%] md:min-w-full snap-start',
        linkText: 'Ver detalles'
      });
      container.appendChild(card);
    });
  }catch(e){
    console.warn('Failed to load services', e);
  }
}

// Auto-init if the page already loaded components
document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{ if(typeof initServices === 'function') initServices(); }, 80);
});
