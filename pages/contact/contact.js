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
  await loadComponentTo('component-contacto','content.html');
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

  // Form handling: construye mensaje y abre WhatsApp via WA.enviarFormulario()
  const form = document.getElementById('contact-form');
  const resultEl = document.getElementById('contact-form-result');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nombre  = document.getElementById('nombre')?.value?.trim();
      const email   = document.getElementById('email')?.value?.trim();
      const mensaje = document.getElementById('mensaje')?.value?.trim();
      const tel     = document.getElementById('telefono')?.value?.trim();
      const asunto  = document.getElementById('asunto')?.value;
      if(!nombre || !email || !mensaje){
        if(resultEl) resultEl.innerHTML = '<span class="text-red-600 font-medium">Por favor completa los campos requeridos.</span>';
        return;
      }
      window.WA.enviarFormulario(nombre, email, tel, asunto, mensaje);
      if(resultEl) resultEl.innerHTML = '<span class="text-green-600 font-medium">Redirigiendo a WhatsApp ✔</span>';
      form.reset();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
