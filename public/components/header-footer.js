// Inserta header y footer compartidos en cada página
(function(){
  const headerHtml = `
  <header class="site-header" role="banner">
    <div class="brand">
      <img src="./images/logo-180x348.png" alt="La Iglesia de Jesucristo - Logo" class="logo" />
      <div class="brand-text">
        <h1>Reportes — La Chimba</h1>
        <p class="subtitle">Seguimiento de entrevistas y reportes</p>
      </div>
    </div>
    <div class="header-actions">
      <button class="nav-toggle btn btn-ghost" aria-label="Abrir navegación" aria-expanded="false">☰</button>
      <nav class="main-nav" role="navigation" aria-hidden="true">
        <a href="index.html" class="btn btn-ghost nav-link" data-nav="home">🏠 Dashboard</a>
        <a href="interviews.html" class="btn btn-ghost nav-link" data-nav="interviews">📅 Entrevistas</a>
        <a href="reports.html" class="btn btn-ghost nav-link" data-nav="reports">📄 Reportes</a>
        <a href="notes.html" class="btn btn-ghost nav-link" data-nav="notes">📝 Recordatorios</a>
      </nav>

      <div class="header-utils">
        <button class="notification-bell btn btn-ghost" aria-label="Ver alertas">
          <span class="bell-icon">🔔</span>
        </button>
      </div>
    </div>
  </header>`;

  const footerHtml = `
  <footer class="site-footer">
    <p>Abre los documentos en una nueva pestaña. Esta página sólo presenta enlaces a Google Drive.</p>
  </footer>`;

  function inject(){
    // Header: si existe el contenedor, rellenarlo; si no, crearlo.
    const existingHeader = document.getElementById('siteHeader');
    if (existingHeader) {
      existingHeader.innerHTML = headerHtml;
    } else {
      const div = document.createElement('div');
      div.id = 'siteHeader';
      div.innerHTML = headerHtml;
      document.body.insertBefore(div, document.body.firstChild);
    }

    // Footer: similar lógica
    const existingFooter = document.getElementById('siteFooter');
    if (existingFooter) {
      existingFooter.innerHTML = footerHtml;
    } else {
      const divf = document.createElement('div');
      divf.id = 'siteFooter';
      divf.innerHTML = footerHtml;
      document.body.appendChild(divf);
    }

    // Activar enlace de navegación según path
    const path = (location.pathname || '').split('/').pop() || 'index.html';
    const map = {
      'index.html':'home',
      '':'home',
      'interviews.html':'interviews',
      'reports.html':'reports',
      'notes.html':'notes'
    };
    const key = map[path] || '';
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.nav === key);
    });

    // Toggle para navegación en móviles (scoped to injected header)
    const headerContainer = document.getElementById('siteHeader');
    if (headerContainer) {
      const toggle = headerContainer.querySelector('.nav-toggle');
      const nav = headerContainer.querySelector('.main-nav');
      if (toggle && nav) {
        // Prevent double initialization
        if (headerContainer.dataset.headerInitialized === 'true') return;
        headerContainer.dataset.headerInitialized = 'true';
        // Ensure initial closed state
        nav.classList.remove('open');
        nav.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');

        const toggleHandler = (ev) => {
          // For touch/pointer events, prevent accidental focus/scroll
          try { ev.stopPropagation(); } catch (e) {}
          const isOpen = nav.classList.toggle('open');
          toggle.classList.toggle('open', isOpen);
          toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          nav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
          console.debug('[header-footer] nav toggle:', isOpen);

          // Backdrop management
          let backdrop = document.querySelector('.nav-backdrop');
          if (isOpen) {
            if (!backdrop) {
              backdrop = document.createElement('div');
              backdrop.className = 'nav-backdrop';
              document.body.appendChild(backdrop);
            }
            // Make visible after insertion for transition
            requestAnimationFrame(() => backdrop.classList.add('visible'));
            // Close when clicking backdrop
            backdrop.onclick = () => {
              nav.classList.remove('open');
              toggle.classList.remove('open');
              toggle.setAttribute('aria-expanded', 'false');
              nav.setAttribute('aria-hidden', 'true');
              backdrop.classList.remove('visible');
              setTimeout(() => backdrop.remove(), 260);
            };
          } else {
            if (backdrop) {
              backdrop.classList.remove('visible');
              setTimeout(() => backdrop.remove(), 260);
            }
          }
        };

        // Attach multiple event types for broader device support
        toggle.addEventListener('click', toggleHandler);
        toggle.addEventListener('pointerdown', toggleHandler);
        toggle.addEventListener('touchstart', (ev) => { ev.preventDefault(); toggleHandler(ev); }, {passive:false});

        // Close menu when clicking outside the header container
        document.addEventListener('click', (e) => {
          if (!headerContainer.contains(e.target) && nav.classList.contains('open')) {
            nav.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            nav.setAttribute('aria-hidden', 'true');
          }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && nav.classList.contains('open')) {
            nav.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            nav.setAttribute('aria-hidden', 'true');
            toggle.focus();
          }
        });
      }
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else inject();
})();
