// ==================== DEBUG HELPER ====================
// Este archivo ayuda a debuggear problemas de inicialización

// Esperar a que script.js cargue antes de verificar
setTimeout(() => {
  console.log('🔍 DEBUG: Verificando dependencias...');

  // Verificar script.js
  console.log('📝 script.js cargado:', typeof loadDataFromBackend !== 'undefined');

  // Verificar componentes
  console.log('🔄 loader.js cargado:', typeof LoaderComponent !== 'undefined');
  console.log('📊 dashboard.js cargado:', typeof DashboardComponent !== 'undefined');
  console.log('📋 audit.js cargado:', typeof AuditComponent !== 'undefined');
  console.log('🔔 alerts.js cargado:', typeof AlertsComponent !== 'undefined');
  console.log('⭐ templates.js cargado:', typeof TemplatesComponent !== 'undefined');
  console.log('👥 missionaries.js cargado:', typeof MissionariesComponent !== 'undefined');
  console.log('🟢 core.js cargado:', typeof AppCore !== 'undefined');

  // Verificar datos globales
  console.log('\n📦 Variables Globales:');
  console.log('- reports:', typeof reports, reports?.length);
  console.log('- interviews:', typeof interviews, interviews?.length);
  console.log('- notes:', typeof notes, notes?.length);
  console.log('- auditLog:', typeof auditLog, auditLog?.length);
  console.log('- templates:', typeof templates, templates?.length);
  console.log('- missionaries:', typeof missionaries, missionaries?.length);

  // Verificar fetch endpoints
  console.log('\n🌐 Verificando endpoints:');
  fetch('/sheet?name=Hoja 1')
    .then(r => console.log('✓ /sheet disponible'))
    .catch(e => console.log('✗ /sheet error:', e.message));

  fetch('/notes')
    .then(r => console.log('✓ /notes disponible'))
    .catch(e => console.log('✗ /notes error:', e.message));

  fetch('/audit')
    .then(r => console.log('✓ /audit disponible'))
    .catch(e => console.log('✗ /audit error:', e.message));

  console.log('\n✅ Debug helper cargado. Abre la consola para ver los resultados.');
}, 1000); // Esperar 1 segundo a que todo cargue
