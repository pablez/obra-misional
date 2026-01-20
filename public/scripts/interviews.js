(function(){
  // Inicializador de UI para la sección de entrevistas (safe, no rompe si ya existen listeners)
  function safeAttach(el, ev, fn, opts){
    if(!el) return;
    const key = 'listener_' + ev;
    if(el.dataset && el.dataset[key]) return;
    el.addEventListener(ev, fn, opts || false);
    if(el.dataset) el.dataset[key] = '1';
  }

  function init(){
    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    const filtersPanel = document.getElementById('filtersPanel');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const exportInterviewsBtn = document.getElementById('exportInterviewsBtn');
    const exportNotesBtn = document.getElementById('exportNotesBtn');
    const auditHistoryBtn = document.getElementById('auditHistoryBtn');
    const globalSearchInput = document.getElementById('globalSearch');
    const refreshBtn = document.getElementById('refreshBtn');
    const newBtn = document.getElementById('newBtn');
    const cancelForm = document.getElementById('cancelForm');
    const newInterviewBtn = document.getElementById('newInterviewBtn');
    const cancelInterviewForm = document.getElementById('cancelInterviewForm');

    // Toggle filters
    safeAttach(toggleFiltersBtn, 'click', () => {
      if(!filtersPanel) return;
      filtersPanel.classList.toggle('hidden');
      filtersPanel.setAttribute('aria-hidden', filtersPanel.classList.contains('hidden'));
    });

    // Apply filters - delegate to existing applyInterviewFilters/renderInterviews if present
    safeAttach(applyFiltersBtn, 'click', async () => {
      try{
        console.log('🔄 [interviews.js] Iniciando aplicación de filtros...');
        
        // Recopilar valores
        const states = Array.from(document.querySelectorAll('.filter-state:checked')).map(el => el.value);
        const entrevistador = document.getElementById('filterEntrevistador')?.value || '';
        const fechaDesde = document.getElementById('filterFechaDesde')?.value || '';
        const fechaHasta = document.getElementById('filterFechaHasta')?.value || '';
        if(window.activeFilters){
          window.activeFilters.states = states;
          window.activeFilters.entrevistador = entrevistador;
          window.activeFilters.fechaDesde = fechaDesde;
          window.activeFilters.fechaHasta = fechaHasta;
        }
        
        console.log('🔍 [interviews.js] Filtros configurados:', window.activeFilters);
        console.log('🔍 [interviews.js] Entrevistas totales:', window.interviews?.length || 0);
        
        const filtered = (typeof applyInterviewFilters === 'function') ? applyInterviewFilters(window.interviews || []) : (window.interviews || []);
        // Store filtered set for calendar rendering and exports
        window.interviewsFiltered = filtered.slice();
        
        console.log('📋 [interviews.js] Resultado filtrado:', filtered.length, 'entrevistas');
        
        if(typeof renderInterviews === 'function') renderInterviews(filtered, (typeof getTodayDateStr === 'function') ? getTodayDateStr() : null);
        // Re-render calendar with filtered interviews
        if(typeof renderCalendar === 'function') {
          console.log('📅 [interviews.js] Actualizando calendario...');
          renderCalendar(typeof currentYear === 'number' ? currentYear : new Date().getFullYear(), typeof currentMonth === 'number' ? currentMonth : new Date().getMonth());
        }
        if(filtersPanel) { filtersPanel.classList.add('hidden'); }
        
        // Verificar resultado en el DOM
        setTimeout(() => {
          const calendarDays = document.querySelectorAll('.calendar-day.has-interview');
          console.log('📅 [interviews.js] Días con entrevistas en calendario después del filtro:', calendarDays.length);
        }, 100);
        
      }catch(e){ 
        console.error('❌ [interviews.js] Error aplicando filtros:', e); 
        alert('Error al aplicar filtros: ' + e.message);
      }
    });

    // Clear filters
    safeAttach(clearFiltersBtn, 'click', () => {
      document.querySelectorAll('.filter-state').forEach(el => el.checked = true);
      const fe = document.getElementById('filterEntrevistador'); if(fe) fe.value='';
      const fd = document.getElementById('filterFechaDesde'); if(fd) fd.value='';
      const fh = document.getElementById('filterFechaHasta'); if(fh) fh.value='';
      if(window.activeFilters){
        window.activeFilters = { states:['Pendiente','Completada','Cancelada'], entrevistador:'', fechaDesde:'', fechaHasta:'' };
      }
      // Clear filtered set
      window.interviewsFiltered = null;
      if(typeof renderInterviews === 'function') renderInterviews(window.interviews || [], (typeof getTodayDateStr === 'function') ? getTodayDateStr() : null);
      // Re-render full calendar
      if(typeof renderCalendar === 'function') renderCalendar(typeof currentYear === 'number' ? currentYear : new Date().getFullYear(), typeof currentMonth === 'number' ? currentMonth : new Date().getMonth());
    });

    // Print button (generates detailed interview report)
    const printBtn = document.getElementById('printBtn');
    safeAttach(printBtn, 'click', () => {
      try{
        if(typeof generateDetailedInterviewReport === 'function') {
          generateDetailedInterviewReport();
        } else {
          console.error('generateDetailedInterviewReport function not found');
          alert('Error: función de reporte no disponible');
        }
      }catch(e){ 
        console.warn('print detailed report error', e); 
        alert('Error al generar reporte: ' + e.message);
      }
    });

    // Audit history
    safeAttach(auditHistoryBtn, 'click', () => { if(typeof showAuditHistory === 'function') showAuditHistory(); });

    // Global search
    safeAttach(globalSearchInput, 'input', (e) => {
      try{
        const results = (typeof globalSearch === 'function') ? globalSearch(e.target.value) : [];
        if(typeof renderGlobalSearchResults === 'function') renderGlobalSearchResults(results);
      }catch(err){ console.warn('globalSearch error', err); }
    });

    // Refresh
    safeAttach(refreshBtn, 'click', async () => {
      try{ 
        const res = await fetch('/sheet?name=Hoja 1');
        if(res.ok){ const data = await res.json(); if(Array.isArray(data) && data.length){ window.reports.length=0; data.forEach(r=>window.reports.push(r)); if(typeof render==='function') render(window.reports); return; } }
        console.warn('No se pudieron cargar datos'); if(typeof render==='function') render(window.reports);
      }catch(err){ console.warn('Refresh error', err); if(typeof render==='function') render(window.reports);}    
    });

    // New report form
    safeAttach(newBtn, 'click', () => { if(window.reportForm){ reportForm.dataset.mode='create'; reportForm.reset(); if(typeof toggleForm === 'function') toggleForm(true); }});
    safeAttach(cancelForm, 'click', () => { if(typeof toggleForm === 'function') toggleForm(false); });

    // Interview form handlers
    safeAttach(newInterviewBtn, 'click', () => { if(window.interviewForm){ interviewForm.dataset.mode='create'; interviewForm.reset(); const t = document.getElementById('interviewFormTitle'); if(t) t.textContent='Agregar entrevista'; if(typeof toggleInterviewForm === 'function') toggleInterviewForm(true); }});
    safeAttach(cancelInterviewForm, 'click', () => { if(typeof toggleInterviewForm === 'function') toggleInterviewForm(false); });

    // Notes creation UI removed from this page — creation/edition handled elsewhere or disabled

    // Delegate edit/delete listeners are present in script.js; no-op here
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Mark module loaded for other scripts
window.__interviewsModuleLoaded = true;

// Delegated fallback for filter toggle in case direct binding didn't attach
(function(){
  if(window.__toggleFiltersDelegatedSet) return;
  window.__toggleFiltersDelegatedSet = true;
  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('#toggleFiltersBtn');
    if(!btn) return;
    const panel = document.getElementById('filtersPanel');
    if(!panel) return;
    panel.classList.toggle('hidden');
    panel.setAttribute('aria-hidden', panel.classList.contains('hidden'));
  });
})();

// Delegated handlers for edit/delete and form submissions
(function(){
  function handleDelegatedClick(e){
    const editBtn = e.target.closest('.btn-edit-interview');
    if(editBtn){
      const id = editBtn.dataset.id;
      const interview = (window.interviews || []).find(i => String(i.id) === String(id));
      if(interview){
        const interviewForm = document.getElementById('interviewForm');
        if(interviewForm){
          interviewForm.dataset.mode = 'edit';
          interviewForm.dataset.editId = id;
          interviewForm.nombre.value = interview.nombre || '';
          interviewForm.fecha.value = interview.fecha || '';
          interviewForm.hora.value = interview.hora || '';
          interviewForm.entrevistador.value = interview.entrevistador || '';
          interviewForm.notas.value = interview.notas || '';
          interviewForm.estado.value = interview.estado || 'Pendiente';
          const t = document.getElementById('interviewFormTitle'); if(t) t.textContent='Editar entrevista';
          if(typeof toggleInterviewForm === 'function') toggleInterviewForm(true);
        }
      }
      return;
    }

    const delBtn = e.target.closest('.btn-delete-interview');
    if(delBtn){
      const id = delBtn.dataset.id;
      const interview = (window.interviews || []).find(i => String(i.id) === String(id));
      if(interview && confirm(`¿Eliminar la entrevista de ${interview.nombre}?`)){
        if(typeof deleteInterview === 'function') deleteInterview(id);
      }
      return;
    }
  }

  // Submit handlers for interview and notes forms
  function handleForms(){
    const interviewForm = document.getElementById('interviewForm');
    if(interviewForm){
      interviewForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        if(typeof saveInterviewForm === 'function'){
          try{ saveInterviewForm(new FormData(interviewForm)); }catch(err){ console.warn('saveInterviewForm error', err); }
        }
      });
    }

    // Notes form submit handling removed (crear recordatorio deshabilitado)
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ document.addEventListener('click', handleDelegatedClick); handleForms(); });
  } else { document.addEventListener('click', handleDelegatedClick); handleForms(); }
})();
