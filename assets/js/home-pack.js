async function initPackages(){
  const container = document.getElementById('packages-grid');
  if(!container) return;
  try{
    const res = await fetch('assets/data/pack.json');
    if(!res.ok) throw new Error('pack.json not found');
    const json = await res.json();
    const items = (json.packages || []).slice(0,4);
    container.innerHTML = '';
    items.forEach(s =>{
      const card = createPackCard(s, {
        extraClass: 'h-80 min-w-[80%] sm:min-w-[45%] md:min-w-full snap-start',
        linkText: 'Ver detalles'
      });
      container.appendChild(card);
    });
  }catch(e){
    console.warn('Failed to load packages', e);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(()=>{ if(typeof initPackages === 'function') initPackages(); }, 80); });
