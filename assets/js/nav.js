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
    // initialize mobile menu if present (header may be injected dynamically)
    try{
      if(typeof window.setupMobileMenu === 'function') window.setupMobileMenu();
    }catch(e){console.warn('setupMobileMenu failed', e)}
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

// mobile menu setup (safe to call multiple times)
window.setupMobileMenu = function(){
  try{
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if(!btn || !menu){ return; }

    // Rebuild mobile links from the desktop nav so both stay in sync
    const desktopNav = document.querySelector('nav .hidden.md\\:flex');
    const mobileList = menu.querySelector('.flex.flex-col');
    if(desktopNav && mobileList){
      mobileList.innerHTML = '';
      desktopNav.querySelectorAll('a[href]').forEach(a=>{
        const href = a.getAttribute('href');
        const text = (a.textContent || '').trim();
        const ma = document.createElement('a');
        ma.href = href || '#';
        ma.className = 'block px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800';
        ma.textContent = text;
        mobileList.appendChild(ma);
      });

      // attach click handlers to mobile links
      mobileList.querySelectorAll('a[href]').forEach(a=> a.addEventListener('click', ()=>{
        const navEl = document.getElementById('top-nav'); if(navEl) navEl.classList.remove('mobile-open');
        document.documentElement.style.overflow = '';
        if(typeof activateNavLinks==='function') activateNavLinks();
      }));
      // ensure close button is wired (may be installed by other initializers)
      const closeBtnInline = document.getElementById('mobile-menu-close');
      if(closeBtnInline && !window.__mobile_menu_close_installed){
        closeBtnInline.addEventListener('click', ()=>{ const navEl = document.getElementById('top-nav'); if(navEl) navEl.classList.remove('mobile-open'); document.documentElement.style.overflow = ''; });
        window.__mobile_menu_close_installed = true;
      }
    }

    // install toggle listener once
    if(!window.__mobile_menu_toggle_installed){
      btn.addEventListener('click', ()=>{
        const navEl = document.getElementById('top-nav');
        if(navEl) navEl.classList.toggle('mobile-open');
        if(navEl && navEl.classList.contains('mobile-open')) document.documentElement.style.overflow = 'hidden';
        else document.documentElement.style.overflow = '';
      });
      // wire close button (in case header inline script didn't run)
      const closeBtn = document.getElementById('mobile-menu-close');
      if(closeBtn){
        closeBtn.addEventListener('click', ()=>{ const navEl = document.getElementById('top-nav'); if(navEl) navEl.classList.remove('mobile-open'); document.documentElement.style.overflow = ''; });
      }
      btn.style.cursor = 'pointer';
      window.__mobile_menu_toggle_installed = true;
    }

    window.__mobile_menu_installed = true;
  }catch(e){ console.warn('mobile menu init error', e); }
};

// Auto-initialize mobile menu if header is injected dynamically later
(function autoInitMobile(){
  try{
    if(document.getElementById('mobile-menu-btn') && document.getElementById('mobile-menu')){
      setupMobileMenu();
      return;
    }
    if(window.MutationObserver && (document.body || document.documentElement)){
      const root = document.body || document.documentElement;
      const obs = new MutationObserver((mutations, o)=>{
        if(document.getElementById('mobile-menu-btn') && document.getElementById('mobile-menu')){
          try{ setupMobileMenu(); }catch(e){console.warn('setupMobileMenu failed', e)}
          o.disconnect();
        }
      });
      obs.observe(root, {childList:true, subtree:true});
    }
  }catch(e){ console.warn('autoInitMobile error', e); }
})();
