// Define activateNavLinks globally if not already defined
if (typeof window.activateNavLinks !== 'function') {
  window.activateNavLinks = function(){
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
  };
}

// Ensure nav link clicks always navigate (fallback for odd environments)
if (!window.__nav_click_delegate_installed) {
  window.__nav_click_delegate_installed = true;
  document.addEventListener('click', (ev)=>{
    const a = ev.target.closest && ev.target.closest('nav a[href]');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    if(!href || href.startsWith('#')) return;
    // allow normal behavior for external targets, but force navigation as a fallback
    ev.preventDefault();
    // tiny delay to allow other handlers to run
    setTimeout(()=>{ location.href = href; }, 10);
  }, {capture: true});
}

// Update active link on history navigation
window.addEventListener('popstate', ()=>{ if(typeof activateNavLinks === 'function') activateNavLinks(); });
