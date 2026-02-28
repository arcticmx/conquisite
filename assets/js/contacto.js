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
  await loadComponentTo('component-contacto','components/contacto.html');
  await loadComponentTo('component-footer','components/footer.html');

  // dark mode sync
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  });

  // ensure nav helper exists (fallback) and activate nav
  // ensure nav helper is loaded and activate nav
  if(!window.activateNavLinks){
    const s = document.createElement('script'); s.src = 'assets/js/nav.js'; s.async = true; document.body.appendChild(s);
    await new Promise(r=>setTimeout(r,100));
  }
  if(typeof activateNavLinks === 'function') activateNavLinks();

  // Form handling: simple client-side validate + success message
  const form = document.getElementById('contact-form');
  const resultEl = document.getElementById('contact-form-result');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nombre = document.getElementById('nombre')?.value?.trim();
      const email = document.getElementById('email')?.value?.trim();
      const mensaje = document.getElementById('mensaje')?.value?.trim();
      if(!nombre || !email || !mensaje){
        if(resultEl) resultEl.innerHTML = '<span class="text-red-600 font-medium">Por favor completa los campos requeridos.</span>';
        return;
      }
      // Simulate send
      if(resultEl) resultEl.innerHTML = '<span class="text-green-600 font-medium">Mensaje enviado. Gracias, te contactaremos pronto.</span>';
      form.reset();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
