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
  await loadComponentTo('component-nosotros','content.html');
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

  // initialize carousel for nosotros
  initNosotrosCarousel();
}

document.addEventListener('DOMContentLoaded', init);

// --- Carousel Nosotros ---
let _nc = { images: [], current: 0, timer: null, transitioning: false };

async function initNosotrosCarousel(){
  // fetch images
  try{
    const res = await fetch('../../assets/data/nosotros-images.json');
    const json = await res.json();
    _nc.images = json.images || [];
  }catch(e){
    console.warn('nosotros-images.json no disponible', e);
  }
  if(_nc.images.length === 0) return;

  const slidesEl = document.getElementById('nosotros-slides');
  const dotsEl   = document.getElementById('nosotros-dots');
  const prevBtn  = document.getElementById('nosotros-prev');
  const nextBtn  = document.getElementById('nosotros-next');
  const wrap     = document.getElementById('nosotros-carousel');
  if(!slidesEl || !dotsEl) return;

  // Build slides
  _nc.images.forEach((img, i) => {
    const slide = document.createElement('div');
    slide.className = 'absolute inset-0 w-full h-full';
    slide.style.cssText = `opacity:${i===0?'1':'0'};transition:opacity 0.5s ease;pointer-events:none;`;
    slide.dataset.index = i;
    const el = document.createElement('img');
    el.src = img.url;
    el.alt = img.alt || '';
    el.className = 'w-full h-full object-cover';
    if(i > 0) el.loading = 'lazy';
    slide.appendChild(el);
    // caption
    if(img.alt){
      const cap = document.createElement('div');
      cap.className = 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 pt-8 pb-12 text-white text-sm font-medium';
      cap.textContent = img.alt;
      slide.appendChild(cap);
    }
    slidesEl.appendChild(slide);
  });
  // make first slide visible
  if(slidesEl.firstElementChild) slidesEl.firstElementChild.style.opacity = '1';

  // Build dots
  _nc.images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = _dotClass(i === 0);
    dot.setAttribute('aria-label', `Ir a imagen ${i+1}`);
    dot.addEventListener('click', () => _ncGoto(i));
    dotsEl.appendChild(dot);
  });

  // Controls
  if(prevBtn) prevBtn.addEventListener('click', () => _ncStep(-1));
  if(nextBtn) nextBtn.addEventListener('click', () => _ncStep(1));

  // Pause on hover + swipe (never capture pointer so buttons still fire)
  if(wrap){
    wrap.addEventListener('mouseenter', _ncStop);
    wrap.addEventListener('mouseleave', _ncPlay);
    // Swipe — skip if the down target is a button so clicks are not hijacked
    let sx = 0, swiping = false;
    wrap.addEventListener('pointerdown', ev => {
      if(ev.target.closest('button')) return;
      sx = ev.clientX;
      swiping = true;
      _ncStop();
    });
    wrap.addEventListener('pointerup', ev => {
      if(!swiping) return;
      swiping = false;
      const dx = ev.clientX - sx;
      if(Math.abs(dx) > 40) _ncStep(dx > 0 ? -1 : 1);
      _ncPlay();
    });
    wrap.addEventListener('pointercancel', () => { swiping = false; _ncPlay(); });
  }

  // Keyboard
  document.addEventListener('keydown', ev => {
    if(ev.key==='ArrowLeft')  _ncStep(-1);
    if(ev.key==='ArrowRight') _ncStep(1);
  });

  _ncPlay();
}

function _dotClass(active){
  return `w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${active ? 'bg-white scale-110 shadow-md' : 'bg-white/50 hover:bg-white/80'}`;
}

function _ncGoto(idx){
  if(_nc.transitioning || idx === _nc.current) return;
  _nc.transitioning = true;
  const slides = document.querySelectorAll('#nosotros-slides > div');
  const dots   = document.querySelectorAll('#nosotros-dots > button');
  if(dots[_nc.current]) dots[_nc.current].className = _dotClass(false);
  if(slides[_nc.current]) slides[_nc.current].style.opacity = '0';
  _nc.current = idx;
  if(slides[_nc.current]) slides[_nc.current].style.opacity = '1';
  if(dots[_nc.current]) dots[_nc.current].className = _dotClass(true);
  // release lock after transition
  setTimeout(() => { _nc.transitioning = false; }, 520);
}

function _ncStep(dir){
  const n = _nc.images.length;
  _ncGoto((_nc.current + dir + n) % n);
}

function _ncPlay(){
  _ncStop();
  _nc.timer = setInterval(() => _ncStep(1), 5000);
}

function _ncStop(){
  if(_nc.timer){ clearInterval(_nc.timer); _nc.timer = null; }
}
