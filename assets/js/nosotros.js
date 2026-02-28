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
  await loadComponentTo('component-nosotros','components/nosotros.html');
  await loadComponentTo('component-footer','components/footer.html');

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  });

  // activate nav
  // ensure nav helper is loaded and activate nav
  if(!window.activateNavLinks){
    const s = document.createElement('script'); s.src = 'assets/js/nav.js'; s.async = true; document.body.appendChild(s);
    await new Promise(r=>setTimeout(r,100));
  }
  if(typeof activateNavLinks === 'function') activateNavLinks();

  // initialize carousel for nosotros
  initNosotrosCarousel();
}

document.addEventListener('DOMContentLoaded', init);

// --- Carousel logic for Nosotros ---
let nosotrosImages = [];
let nosotrosIndex = 0;
let nosotrosInterval = null;

async function fetchNosotrosImages(){
  try{
    const res = await fetch('assets/data/nosotros-images.json');
    const json = await res.json();
    nosotrosImages = json.images || [];
  }catch(e){
    console.warn('No se pudieron cargar las imágenes del carousel', e);
    nosotrosImages = [];
  }
}

function updateNosotrosImage(){
  const img = document.getElementById('nosotros-carousel-img');
  const indicators = document.getElementById('nosotros-carousel-indicators');
  if(!img || nosotrosImages.length===0) return;
  const item = nosotrosImages[nosotrosIndex % nosotrosImages.length];
  img.src = item.url;
  img.alt = item.alt || 'Imagen';
  // update indicators
  if(indicators){
    Array.from(indicators.children).forEach((dot, i)=>{
      dot.classList.toggle('bg-white', i===nosotrosIndex);
      dot.classList.toggle('bg-white/50', i!==nosotrosIndex);
    });
  }
}

function prevNosotros(){
  if(nosotrosImages.length===0) return;
  nosotrosIndex = (nosotrosIndex - 1 + nosotrosImages.length) % nosotrosImages.length;
  updateNosotrosImage();
}

function nextNosotros(){
  if(nosotrosImages.length===0) return;
  nosotrosIndex = (nosotrosIndex + 1) % nosotrosImages.length;
  updateNosotrosImage();
}

function renderNosotrosIndicators(){
  const indicators = document.getElementById('nosotros-carousel-indicators');
  if(!indicators) return;
  indicators.innerHTML = '';
  nosotrosImages.forEach((img,i)=>{
    const dot = document.createElement('div');
    dot.className = 'w-2.5 h-2.5 rounded-full shadow-sm cursor-pointer ' + (i===nosotrosIndex ? 'bg-white' : 'bg-white/50');
    dot.addEventListener('click', ()=>{ nosotrosIndex = i; updateNosotrosImage(); });
    indicators.appendChild(dot);
  });
}

function startNosotrosAutoPlay(){
  stopNosotrosAutoPlay();
  nosotrosInterval = setInterval(()=>{ nextNosotros(); }, 5000);
}

function stopNosotrosAutoPlay(){
  if(nosotrosInterval){ clearInterval(nosotrosInterval); nosotrosInterval = null; }
}

async function initNosotrosCarousel(){
  await fetchNosotrosImages();
  if(nosotrosImages.length===0) return;
  renderNosotrosIndicators();
  updateNosotrosImage();

  const prev = document.getElementById('nosotros-carousel-prev');
  const next = document.getElementById('nosotros-carousel-next');
  const container = document.getElementById('nosotros-carousel');
  if(prev) prev.addEventListener('click', ()=>{ prevNosotros(); startNosotrosAutoPlay(); });
  if(next) next.addEventListener('click', ()=>{ nextNosotros(); startNosotrosAutoPlay(); });
  if(container){
    container.addEventListener('mouseenter', stopNosotrosAutoPlay);
    container.addEventListener('mouseleave', startNosotrosAutoPlay);
    // Keyboard controls: left/right arrows
    const keyHandler = (e)=>{
      if(e.key === 'ArrowLeft'){
        prevNosotros(); startNosotrosAutoPlay();
      } else if(e.key === 'ArrowRight'){
        nextNosotros(); startNosotrosAutoPlay();
      }
    };
    document.addEventListener('keydown', keyHandler);

    // Pointer-based swipe (mouse/touch)
    let pointerDown = false;
    let startX = 0;
    const threshold = parseInt(container.dataset.swipeThreshold || '40', 10) || 40; // px to consider swipe
    container.addEventListener('pointerdown', (ev)=>{
      pointerDown = true;
      startX = ev.clientX;
      container.setPointerCapture(ev.pointerId);
      stopNosotrosAutoPlay();
    });
    container.addEventListener('pointerup', (ev)=>{
      if(!pointerDown) return;
      pointerDown = false;
      const dx = ev.clientX - startX;
      if(Math.abs(dx) > threshold){
        if(dx > 0) prevNosotros(); else nextNosotros();
      }
      startNosotrosAutoPlay();
    });
    container.addEventListener('pointercancel', ()=>{ pointerDown=false; startNosotrosAutoPlay(); });
  }
  startNosotrosAutoPlay();
}

