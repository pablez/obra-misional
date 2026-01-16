// TemplatesComponent: funcionalidad de plantillas eliminada (stub)
const TemplatesComponent = {
  init() { console.log('TemplatesComponent.init(): plantillas eliminadas'); },
  showNewTemplateModal() { alert('Plantillas deshabilitadas.'); },
  showTemplatesModal() { alert('Plantillas deshabilitadas.'); },
  duplicateTemplate() { console.log('duplicateTemplate(): plantillas eliminadas'); },
  renderTemplates() { const el = document.getElementById('templatesList'); if(el) el.innerHTML = '<p style="color:var(--muted);">Las Plantillas de Notas han sido eliminadas.</p>'; }
};
