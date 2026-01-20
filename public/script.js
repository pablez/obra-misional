// Datos de ejemplo: reemplaza o extiende este arreglo con tus reportes y enlaces de Drive
const reports = [
  {
    id: 1,
    title: 'Reporte Mensual - Enero 2026',
    description: 'Resumen de actividades y asistencia.',
    date: '2026-01-10',
    link: 'https://docs.google.com/spreadsheets/d/1FPi7bWIb-VmpotIxeG2LnemZuMo4gDP6/edit?usp=sharing&ouid=116404464103472182793&rtpof=true&sd=true'
  },
  {
    id: 2,
    title: 'Informe Financiero - 2025',
    description: 'Balance y detalles de gastos.',
    date: '2025-12-31',
    link: 'https://drive.google.com/file/d/YYYYYYYY/view?usp=sharing'
  }
];

// Lista de elders (usa la carpeta images/). Si cambias nombres de archivos, actualiza aquí.
const elders = [
  { name: 'Elder Llamas y Elder Fabel', role: 'Elder', img: 'images/elder fabel-elder Llamas.png' },
  { name: 'Elder Bunker', role: 'Elder', img: 'images/Elder-Bunker.png' },
  { name: 'Elder Moyes', role: 'Elder', img: 'images/Elder-Moyes.png' }
];

// Entrevistas
const interviews = [];

// Datos de prueba para verificar filtros
interviews.push({
  id: 'test1',
  nombre: 'Juan Pérez',
  fecha: '2026-01-15',
  hora: '10:00',
  entrevistador: 'Obispo',
  notas: 'Entrevista de membresía',
  estado: 'Pendiente'
});

interviews.push({
  id: 'test2', 
  nombre: 'María López',
  fecha: '2026-01-14',
  hora: '14:30',
  entrevistador: 'Mosiah',
  notas: 'Entrevista de llamamiento',
  estado: 'Pendiente'
});

interviews.push({
  id: 'test3',
  nombre: 'Carlos Ruiz',
  fecha: '2026-01-16',
  hora: '09:00', 
  entrevistador: 'Pablo',
  notas: 'Entrevista regular',
  estado: 'Completada'
});

interviews.push({
  id: 'test4',
  nombre: 'Ana Torres',
  fecha: '2026-01-13',
  hora: '16:00',
  entrevistador: 'Obispo', 
  notas: 'Entrevista de recomendación',
  estado: 'Pendiente'
});

interviews.push({
  id: 'test5',
  nombre: 'Pedro González',
  fecha: '2026-01-17',
  hora: '11:00',
  entrevistador: 'Mosiah',
  notas: 'Entrevista de progreso',
  estado: 'Pendiente'
});

// Sistema de notas/recordatorios eliminado (array vacío para evitar errores)
const notes = [];

// Plantillas de Notas eliminadas
const templates = [];

// Misioneros
const missionaries = [];

const $reports = document.getElementById('reports');
const $search = document.getElementById('search');
const $eldersGrid = document.getElementById('eldersGrid');
const $listView = document.getElementById('listView');
const $calendarView = document.getElementById('calendarView');
const $notesList = document.getElementById('notesList');

// Estado del calendario
let currentYear = 2026;
let currentMonth = 0; // Enero
let currentWeekStart = null; // Para vista semanal
let viewMode = 'calendar'; // 'calendar', 'list', o 'week'
let calendarViewMode = 'month'; // 'month' o 'week'
// Lista actualmente renderizada en la vista (se actualiza en renderInterviews)
let currentRenderedInterviews = [];

// Historial de auditoría
const auditLog = [];

// Filtros activos
let activeFilters = {
  states: ['Pendiente', 'Completada', 'Cancelada'],
  entrevistador: '',
  fechaDesde: '',
  fechaHasta: ''
};

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Google Sheets Configuration
const SHEET_ID = '1LQL5cnyEynGWxrO-K4BtRjHonGUPjyam19wCziYqqzs';
const REPORTS_SHEET = 'Hoja 1';
const INTERVIEWS_SHEET = 'Hoja 2';

function formatDate(d){
  try{ return new Date(d).toLocaleDateString(); }catch(e){return d}
}

// Función para sumar 1 día a una fecha YYYY-MM-DD considerando los días del mes
function addOneDayToDate(dateStr) {
  if(!dateStr || !dateStr.includes('-')) return dateStr;
  
  try {
    const parts = dateStr.split('-');
    let year = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    let day = parseInt(parts[2]);
    
    // Días por mes
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Ajustar por año bisiesto
    if(month === 2 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) {
      daysInMonth[1] = 29;
    }
    
    // Sumar 1 día
    day++;
    
    // Si el día excede el máximo del mes
    if(day > daysInMonth[month - 1]) {
      day = 1;
      month++;
      
      // Si el mes excede 12
      if(month > 12) {
        month = 1;
        year++;
      }
    }
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch(e) {
    return dateStr;
  }
}

function render(list){
  if(!$reports) return;
  $reports.innerHTML = '';
  if(!list.length){ $reports.innerHTML = '<p>No hay reportes que mostrar.</p>'; return }
  list.forEach(r => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${escapeHtml(r.title)}</h3>
      <div class="meta">${formatDate(r.date)}</div>
      <p>${escapeHtml(r.description || '')}</p>
      <div class="actions">
        <a class="btn btn-primary" href="${r.link}" target="_blank" rel="noopener">Ver documento</a>
        <a class="btn btn-ghost" href="${r.link}" target="_blank" rel="noopener">Abrir en Drive</a>
        <button class="btn btn-ghost btn-edit" data-id="${r.id}" title="Editar">✏️ Editar</button>
      </div>
    `;
    $reports.appendChild(card);
  });
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function filter(q){
  const term = (q||'').trim().toLowerCase();
  if(!term) return reports.slice();
  return reports.filter(r => r.title.toLowerCase().includes(term) || (r.description||'').toLowerCase().includes(term));
}

function renderElders(list){
  if(!$eldersGrid) return;
  $eldersGrid.innerHTML = '';
  list.forEach(e => {
    const card = document.createElement('div');
    card.className = 'elder-card';
    const img = document.createElement('img');
    img.className = 'elder-photo';
    // encodeURI convierte espacios a %20
    img.src = encodeURI(e.img);
    img.alt = e.name;
    const name = document.createElement('div');
    name.className = 'elder-name';
    name.textContent = e.name;
    const role = document.createElement('div');
    role.className = 'elder-role';
    role.textContent = e.role;
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(role);
    $eldersGrid.appendChild(card);
  });
}

function normalizeInterview(i) {
  // Convertir fecha a formato YYYY-MM-DD
  let fecha = i.fecha;
  
  // Si es string con formato "Date(...)" extraer los valores
  if(typeof fecha === 'string' && fecha.includes('Date(')) {
    try {
      const matches = fecha.match(/Date\((\d+),(\d+),(\d+)/);
      if(matches) {
        const year = parseInt(matches[1]);
        const month = parseInt(matches[2]) + 1; // JavaScript months are 0-indexed
        const day = parseInt(matches[3]);
        fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    } catch(e) {}
  }
  
  // Si es string en formato DD/M/YYYY o D/M/YYYY (lo que devuelve Google Sheets)
  if(typeof fecha === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
    try {
      const parts = fecha.split('/');
      const day = String(parts[0]).padStart(2, '0');
      const month = String(parts[1]).padStart(2, '0');
      const year = parts[2];
      fecha = `${year}-${month}-${day}`;
    } catch(e) {
      console.warn('Error parseando fecha:', fecha);
    }
  }
  
  // Si ya está en formato YYYY-MM-DD, dejarlo como está
  if(typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    // Ya está bien formateado, no hacer nada
  }
  // Para Date objects, usar zona horaria local
  else if(fecha instanceof Date) {
    fecha = fecha.getFullYear() + '-' + 
            String(fecha.getMonth() + 1).padStart(2, '0') + '-' + 
            String(fecha.getDate()).padStart(2, '0');
  } else if(typeof fecha === 'string' && !fecha.includes('-')) {
    // Parsear si viene en otro formato - EVITAR new Date() para no tener problemas de zona horaria
    try {
      // Intentar parsear como YYYY, MM, DD separados
      const matches = fecha.match(/(\d{4})[\/-]?(\d{2})[\/-]?(\d{2})/);
      if(matches) {
        fecha = `${matches[1]}-${matches[2]}-${matches[3]}`;
      }
    } catch(e) {}
  }
  
  // Convertir hora a formato HH:MM
  let hora = i.hora;
  
  // Si es string con formato "Date(...)" extraer la hora
  if(typeof hora === 'string' && hora.includes('Date(')) {
    try {
      const matches = hora.match(/Date\(\d+,\d+,\d+,(\d+),(\d+),(\d+)/);
      if(matches) {
        const h = parseInt(matches[1]);
        const m = parseInt(matches[2]);
        hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    } catch(e) {}
  }
  
  // Si es string en formato HH:MM o H:MM (lo que devuelve Google Sheets en algunas versiones)
  if(typeof hora === 'string' && /^\d{1,2}:\d{2}$/.test(hora)) {
    // Ya está en el formato correcto o casi
    const parts = hora.split(':');
    hora = `${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}`;
  }
  
  if(hora instanceof Date) {
    hora = String(hora.getHours()).padStart(2,'0') + ':' + String(hora.getMinutes()).padStart(2,'0');
  } else if(typeof hora === 'string' && !hora.includes(':')) {
    // Si es número o formato sin :
    try {
      // Evitar new Date() por problema de zona horaria
      const matches = hora.match(/(\d{1,2})[\.:_-]?(\d{2})/);
      if(matches) {
        hora = `${String(matches[1]).padStart(2, '0')}:${String(matches[2]).padStart(2, '0')}`;
      }
    } catch(e) {}
  }
  
  return {
    id: i.id || Date.now(),
    nombre: i.nombre || '',
    fecha: fecha || '',
    hora: hora || '',
    entrevistador: i.entrevistador || i.lugar || '',
    notas: i.notas || '',
    estado: i.estado || 'Pendiente'
  };
}

function renderInterviews(list, dateFilter = null){
  if(!$listView) return;
  $listView.innerHTML = '';
  
  // Filtrar por fecha si se especifica
  let filtered = list;
  if(dateFilter) {
    filtered = list.filter(i => i.fecha === dateFilter);
  }

  // Guardar la lista actualmente renderizada (útil para exportaciones)
  currentRenderedInterviews = filtered.slice();
  
  if(!filtered.length){ 
    const msg = dateFilter ? 'No hay entrevistas para este día.' : 'No hay entrevistas programadas.';
    $listView.innerHTML = '<p>' + msg + '</p>'; 
    return;
  }
  
  filtered.forEach(i => {
    const card = document.createElement('article');
    card.className = `interview-card ${(i.estado || '').toLowerCase()}`;
    const statusClass = (i.estado || 'pendiente').toLowerCase();
    // Sumar +1 día para mostrar (ajuste de zona horaria)
    const displayDate = addOneDayToDate(i.fecha);
    card.innerHTML = `
      <h4>${escapeHtml(i.nombre || 'Sin nombre')}</h4>
      <div class="interview-meta">
        <span>📅 ${formatDate(displayDate)}</span>
        <span>🕐 ${escapeHtml(i.hora || '')}</span>
        <span>👤 ${escapeHtml(i.entrevistador || 'Por definir')}</span>
      </div>
      <p>${escapeHtml(i.notas || '')}</p>
      <span class="interview-status ${statusClass}">${escapeHtml(i.estado || 'Pendiente')}</span>
      <div class="interview-actions">
        <button class="btn btn-ghost btn-edit-interview" data-id="${i.id}" title="Editar">✏️</button>
        <button class="btn btn-ghost btn-delete-interview" data-id="${i.id}" title="Eliminar">🗑️</button>
      </div>
    `;
    $listView.appendChild(card);
  });
}

// Obtener fecha de hoy en formato YYYY-MM-DD
function getTodayDateStr() {
  const today = new Date();
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0');
}

// Filtrar entrevistas según filtros activos
function applyInterviewFilters(list) {
  console.log('🔍 Aplicando filtros a', list.length, 'entrevistas con filtros:', activeFilters);
  
  const filtered = list.filter(i => {
    // Filtro de estado
    if(!activeFilters.states.includes(i.estado)) {
      return false;
    }
    
    // Filtro de entrevistador (select con opciones específicas)
    if(activeFilters.entrevistador && activeFilters.entrevistador !== '' && 
       i.entrevistador !== activeFilters.entrevistador) {
      return false;
    }
    
    // Filtro de rango de fechas
    if(activeFilters.fechaDesde && i.fecha < activeFilters.fechaDesde) {
      return false;
    }
    if(activeFilters.fechaHasta && i.fecha > activeFilters.fechaHasta) {
      return false;
    }
    
    return true;
  });
  
  console.log('✅ Resultado:', filtered.length, 'entrevistas filtradas');
  if(filtered.length > 0) {
    console.log('📋 Entrevistas que pasaron el filtro:', filtered.map(i => `${i.nombre} (${i.estado}, ${i.entrevistador}, ${i.fecha})`));
  }
  return filtered;
}

// Búsqueda global
function globalSearch(query) {
  if(!query || query.trim().length < 2) return [];
  
  const q = query.toLowerCase().trim();
  const results = [];
  
  // Buscar en entrevistas
  interviews.forEach(i => {
    if(i.nombre?.toLowerCase().includes(q) || 
       i.entrevistador?.toLowerCase().includes(q) ||
       i.notas?.toLowerCase().includes(q)) {
      results.push({
        type: 'interview',
        id: i.id,
        title: i.nombre,
        subtitle: `${i.fecha} - ${i.hora} | ${i.entrevistador || 'Sin entrevistador'}`,
        data: i
      });
    }
  });
  
  // Búsqueda en notas eliminada - sistema de recordatorios deshabilitado
  
  // Buscar en reportes
  reports.forEach(r => {
    if(r.title?.toLowerCase().includes(q) ||
       r.description?.toLowerCase().includes(q)) {
      results.push({
        type: 'report',
        id: r.id,
        title: r.title,
        subtitle: r.date || 'Sin fecha',
        text: r.description?.substring(0, 60) + (r.description?.length > 60 ? '...' : ''),
        data: r
      });
    }
  });
  
  return results;
}

// Renderizar resultados de búsqueda global
function renderGlobalSearchResults(results) {
  const resultsPanel = document.getElementById('globalSearchResults');
  if(!resultsPanel) return;
  
  if(results.length === 0) {
    resultsPanel.innerHTML = '<div style="padding:16px;color:var(--muted);text-align:center;">No se encontraron resultados</div>';
    resultsPanel.classList.remove('hidden');
    return;
  }
  
  resultsPanel.innerHTML = '';
  
  results.forEach(result => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    
    const typeLabel = result.type === 'interview' ? 'Entrevista' : 
                     result.type === 'note' ? 'Recordatorio' : 'Reporte';
    
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="search-result-type ${result.type}">${typeLabel}</span>
        <strong>${escapeHtml(result.title)}</strong>
      </div>
      <div style="color:var(--muted);font-size:0.9rem;margin-top:4px;">${escapeHtml(result.subtitle)}</div>
      ${result.text ? `<span class="search-result-text">${escapeHtml(result.text)}</span>` : ''}
    `;
    
    item.addEventListener('click', () => {
      // Hacer scroll y mostrar el resultado
      if(result.type === 'interview') {
        document.querySelector('.interviews-section').scrollIntoView({ behavior: 'smooth' });
      } else if(result.type === 'note') {
        document.querySelector('.notes-section').scrollIntoView({ behavior: 'smooth' });
      }
      resultsPanel.classList.add('hidden');
      document.getElementById('globalSearch').value = '';
    });
    
    resultsPanel.appendChild(item);
  });
  
  resultsPanel.classList.remove('hidden');
}

// Filtrar notas según filtros activos
// applyNotesFilters removed (prioridad de recordatorio ya no existe)

// Calcular estadísticas de entrevistas
function calculateStatistics() {
  const stats = {
    total: interviews.length,
    completadas: interviews.filter(i => i.estado === 'Completada').length,
    pendientes: interviews.filter(i => i.estado === 'Pendiente').length,
    canceladas: interviews.filter(i => i.estado === 'Cancelada').length,
    porcentaje: 0,
    porMes: {},
    porEntrevistador: {}
  };
  
  // Calcular porcentaje
  stats.porcentaje = stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0;
  
  // Contar por mes
  const monthsOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  monthsOrder.forEach(m => stats.porMes[m] = 0);
  
  interviews.forEach(i => {
    if(!i.fecha) return;
    const monthIndex = parseInt(i.fecha.split('-')[1]) - 1;
    if(monthIndex >= 0 && monthIndex < 12) {
      stats.porMes[monthsOrder[monthIndex]]++;
    }
  });
  
  // Contar por entrevistador
  interviews.forEach(i => {
    const name = i.entrevistador || 'Sin especificar';
    stats.porEntrevistador[name] = (stats.porEntrevistador[name] || 0) + 1;
  });
  
  return stats;
}

// Generar reporte detallado de entrevistas
function generateDetailedInterviewReport() {
  try {
    console.log('🖨️ Generando reporte detallado de entrevistas...');
    
    // Usar datos filtrados si están disponibles, o todos los datos
    const reportData = window.interviewsFiltered || interviews;
    const stats = calculateStatistics();
    const currentDate = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Obtener filtros activos para mostrar en el reporte
    const appliedFilters = [];
    if (activeFilters.entrevistador && activeFilters.entrevistador !== 'Todos') {
      appliedFilters.push(`Entrevistador: ${activeFilters.entrevistador}`);
    }
    if (activeFilters.estados && activeFilters.estados.length > 0) {
      appliedFilters.push(`Estados: ${activeFilters.estados.join(', ')}`);
    }
    if (activeFilters.fechaInicio) {
      appliedFilters.push(`Desde: ${activeFilters.fechaInicio}`);
    }
    if (activeFilters.fechaFin) {
      appliedFilters.push(`Hasta: ${activeFilters.fechaFin}`);
    }

    // Generar HTML del reporte
    let reportHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Detallado de Entrevistas - ${currentDate}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 30px; 
            background: #ffffff;
            color: #333;
            line-height: 1.6;
          }
          .report-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4CAF50;
          }
          .report-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c5282;
            margin: 0;
          }
          .report-subtitle {
            font-size: 16px;
            color: #666;
            margin: 10px 0;
          }
          .report-date {
            font-size: 14px;
            color: #999;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            margin: 0;
          }
          .stat-label {
            font-size: 14px;
            color: #666;
            margin: 5px 0 0 0;
          }
          .filters-section {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .filters-title {
            font-weight: bold;
            color: #1976d2;
            margin: 0 0 10px 0;
          }
          .interviews-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .interviews-table th {
            background: #4CAF50;
            color: white;
            padding: 15px 10px;
            text-align: left;
            font-weight: bold;
          }
          .interviews-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #ddd;
          }
          .interviews-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          .interviews-table tr:hover {
            background: #f1f8e9;
          }
          .estado {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .estado-pendiente { background: #fff3cd; color: #856404; }
          .estado-completada { background: #d4edda; color: #155724; }
          .estado-cancelada { background: #f8d7da; color: #721c24; }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c5282;
            margin: 30px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 20px 0;
          }
          .summary-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
          }
          .summary-section h4 {
            margin: 0 0 15px 0;
            color: #495057;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #dee2e6;
          }
          .summary-item:last-child {
            border-bottom: none;
          }
          @media print {
            body { padding: 20px; }
            .stat-card { break-inside: avoid; }
            .interviews-table { break-inside: avoid; }
            .summary-section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="report-title">REPORTE DETALLADO DE ENTREVISTAS</h1>
          <p class="report-subtitle">Iglesia de Jesucristo de los Santos de los Últimos Días</p>
          <p class="report-date">Generado el: ${currentDate}</p>
        </div>`;

    // Mostrar filtros aplicados
    if (appliedFilters.length > 0) {
      reportHTML += `
        <div class="filters-section">
          <h3 class="filters-title">🔍 Filtros Aplicados:</h3>
          <p>${appliedFilters.join(' | ')}</p>
        </div>`;
    }

    // Estadísticas generales
    reportHTML += `
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-value">${reportData.length}</p>
          <p class="stat-label">Total de Entrevistas</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">${reportData.filter(i => i.estado === 'Completada').length}</p>
          <p class="stat-label">Completadas</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">${reportData.filter(i => i.estado === 'Pendiente').length}</p>
          <p class="stat-label">Pendientes</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">${reportData.filter(i => i.estado === 'Cancelada').length}</p>
          <p class="stat-label">Canceladas</p>
        </div>
      </div>`;

    // Resúmenes por categoría
    const entrevistadorCounts = {};
    const estadoCounts = {};
    reportData.forEach(interview => {
      entrevistadorCounts[interview.entrevistador] = (entrevistadorCounts[interview.entrevistador] || 0) + 1;
      estadoCounts[interview.estado] = (estadoCounts[interview.estado] || 0) + 1;
    });

    reportHTML += `
      <div class="summary-grid">
        <div class="summary-section">
          <h4>📊 Por Entrevistador</h4>`;
    Object.entries(entrevistadorCounts).forEach(([entrevistador, count]) => {
      reportHTML += `
          <div class="summary-item">
            <span>${entrevistador}</span>
            <span><strong>${count}</strong></span>
          </div>`;
    });
    reportHTML += `
        </div>
        
        <div class="summary-section">
          <h4>📈 Por Estado</h4>`;
    Object.entries(estadoCounts).forEach(([estado, count]) => {
      reportHTML += `
          <div class="summary-item">
            <span>${estado}</span>
            <span><strong>${count}</strong></span>
          </div>`;
    });
    reportHTML += `
        </div>
      </div>`;

    // Tabla detallada de entrevistas
    reportHTML += `
      <h2 class="section-title">📋 Detalle de Entrevistas</h2>
      <table class="interviews-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Entrevistador</th>
            <th>Estado</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>`;

    // Ordenar entrevistas por fecha
    const sortedInterviews = [...reportData].sort((a, b) => {
      const dateA = new Date(a.fecha || '1970-01-01');
      const dateB = new Date(b.fecha || '1970-01-01');
      return dateA - dateB;
    });

    sortedInterviews.forEach(interview => {
      const estadoClass = `estado-${interview.estado?.toLowerCase() || 'pendiente'}`;
      const fechaFormatted = interview.fecha ? 
        new Date(interview.fecha + 'T00:00:00').toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) : 'Sin fecha';
      
      reportHTML += `
        <tr>
          <td><strong>${interview.nombre || 'Sin nombre'}</strong></td>
          <td>${fechaFormatted}</td>
          <td>${interview.hora || 'Sin hora'}</td>
          <td>${interview.entrevistador || 'Sin asignar'}</td>
          <td><span class="estado ${estadoClass}">${interview.estado || 'Pendiente'}</span></td>
          <td>${interview.notas || 'Sin notas'}</td>
        </tr>`;
    });

    reportHTML += `
        </tbody>
      </table>
    </body>
    </html>`;

    // Abrir en nueva ventana e imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para generar el reporte.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHTML);
    printWindow.document.close();

    // Auto-imprimir después de cargar
    printWindow.onload = () => {
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (err) {
          console.warn('Error al imprimir automáticamente:', err);
        }
      }, 500);
    };

    console.log('✅ Reporte detallado generado exitosamente');

  } catch (error) {
    console.error('❌ Error al generar reporte detallado:', error);
    alert('Error al generar el reporte: ' + error.message);
  }
}

// Mostrar estadísticas en el dashboard
function renderDashboard() {
  const stats = calculateStatistics();
  
  // Actualizar KPIs
  const kpiTotal = document.getElementById('kpiTotalEntrevistas');
  const kpiCompletadas = document.getElementById('kpiCompletadas');
  const kpiPendientes = document.getElementById('kpiPendientes');
  const kpiPorcentaje = document.getElementById('kpiPorcentaje');

  if (kpiTotal) kpiTotal.textContent = stats.total;
  if (kpiCompletadas) kpiCompletadas.textContent = stats.completadas;
  if (kpiPendientes) kpiPendientes.textContent = stats.pendientes;
  if (kpiPorcentaje) kpiPorcentaje.textContent = stats.porcentaje + '%';
  
  // Gráfico de estado
  renderChartEstado(stats);
  
  // Gráfico de entrevistadores
  renderChartEntrevistadores(stats);
  
  // Gráfico de meses
  renderChartMeses(stats);
  
  // Top entrevistadores (sólo si existe el contenedor)
  if (document.getElementById('topInterviewersList')) {
    renderTopInterviewers(stats);
  }
}

// Gráfico: Estado de Entrevistas
function renderChartEstado(stats) {
  const ctx = document.getElementById('chartEstado');
  if(!ctx) return;
  
  // Destruir gráfico anterior si existe
  if(window.chartEstadoInstance) window.chartEstadoInstance.destroy();
  
  const colors = ['#ef4444', '#10b981', '#f59e0b'];
  window.chartEstadoInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cancelada', 'Completada', 'Pendiente'],
      datasets: [{
        data: [stats.canceladas, stats.completadas, stats.pendientes],
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// Gráfico: Top Entrevistadores
function renderChartEntrevistadores(stats) {
  const ctx = document.getElementById('chartEntrevistadores');
  if(!ctx) return;
  
  // Obtener top 5
  const sorted = Object.entries(stats.porEntrevistador)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if(window.chartEntrevistadoresInstance) window.chartEntrevistadoresInstance.destroy();
  
  window.chartEntrevistadoresInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(e => e[0]),
      datasets: [{
        label: 'Entrevistas',
        data: sorted.map(e => e[1]),
        backgroundColor: '#60a5fa',
        borderColor: '#0b60d1',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

// Gráfico: Entrevistas por Mes
function renderChartMeses(stats) {
  const ctx = document.getElementById('chartMeses');
  if(!ctx) return;
  
  if(window.chartMesesInstance) window.chartMesesInstance.destroy();
  
  window.chartMesesInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(stats.porMes),
      datasets: [{
        label: 'Entrevistas',
        data: Object.values(stats.porMes),
        borderColor: '#0b60d1',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#0b60d1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Top Entrevistadores (tabla)
function renderTopInterviewers(stats) {
  const list = document.getElementById('topInterviewersList');
  if(!list) return;
  
  const sorted = Object.entries(stats.porEntrevistador)
    .sort((a, b) => b[1] - a[1]);
  
  list.innerHTML = '';
  sorted.forEach(([name, count]) => {
    const div = document.createElement('div');
    div.className = 'interviewer-item';
    div.innerHTML = `
      <div class="interviewer-name">👤 ${escapeHtml(name)}</div>
      <div class="interviewer-stat">
        <span>Total:</span>
        <strong>${count}</strong>
      </div>
      <div class="interviewer-stat">
        <span>Completadas:</span>
        <strong>${interviews.filter(i => i.entrevistador === name && i.estado === 'Completada').length}</strong>
      </div>
      <div class="interviewer-stat">
        <span>Pendientes:</span>
        <strong>${interviews.filter(i => i.entrevistador === name && i.estado === 'Pendiente').length}</strong>
      </div>
    `;
    list.appendChild(div);
  });
}

// Renderizar calendario (mensual o semanal según el modo)
function renderCalendar(year, month) {
  console.log('📅 Renderizando calendario para:', year, monthNames[month]);
  console.log('📅 Entrevistas filtradas disponibles:', window.interviewsFiltered?.length || 'ninguna');
  
  if(calendarViewMode === 'week') {
    renderWeekCalendar();
    return;
  }
  
  const calendarDays = document.getElementById('calendarDays');
  const currentMonthEl = document.getElementById('currentMonth');
  
  if(!calendarDays || !currentMonthEl) {
    console.error('❌ Elementos del calendario no encontrados');
    return;
  }
  
  // Remover clase week-view si existe
  calendarDays.classList.remove('week-view');
  
  currentMonthEl.textContent = `${monthNames[month]} ${year}`;
  calendarDays.innerHTML = '';
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Días del mes anterior
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for(let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dayEl = createDayElement(dayNum, true);
    calendarDays.appendChild(dayEl);
  }
  
  // Días del mes actual
  const today = new Date();
  for(let day = 1; day <= daysInMonth; day++) {
    const isToday = year === today.getFullYear() && 
                    month === today.getMonth() && 
                    day === today.getDate();
    const dayEl = createDayElement(day, false, isToday, year, month);
    calendarDays.appendChild(dayEl);
  }
  
  // Días del mes siguiente
  const remainingDays = 42 - calendarDays.children.length; // 6 semanas x 7 días
  for(let day = 1; day <= remainingDays; day++) {
    const dayEl = createDayElement(day, true);
    calendarDays.appendChild(dayEl);
  }
}

function createDayElement(dayNum, isOtherMonth, isToday = false, year = currentYear, month = currentMonth) {
  const dayEl = document.createElement('div');
  dayEl.className = 'calendar-day';
  
  if(isOtherMonth) {
    dayEl.classList.add('other-month');
  }
  if(isToday) {
    dayEl.classList.add('today');
  }
  
  // Buscar entrevistas para este día (usar filtros aplicados si existen)
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  const sourceInterviews = (window.interviewsFiltered && Array.isArray(window.interviewsFiltered)) ? window.interviewsFiltered : interviews;
  const dayInterviews = sourceInterviews.filter(i => i.fecha === dateStr);
  
  if(!isOtherMonth) {
    console.log(`📅 Día ${dateStr}: usando ${sourceInterviews === window.interviewsFiltered ? 'filtradas' : 'todas'}, encontradas: ${dayInterviews.length}`);
    if(dayInterviews.length > 0) {
      console.log(`📅 Entrevistas del día ${dateStr}:`, dayInterviews.map(i => `${i.nombre} (${i.entrevistador})`));
    }
  }
  
  if(dayInterviews.length > 0 && !isOtherMonth) {
    dayEl.classList.add('has-interview');
    
    // Agregar clase según estado
    const firstStatus = (dayInterviews[0].estado || 'pendiente').toLowerCase();
    dayEl.classList.add(firstStatus);
    
    // Tooltip con info de entrevistas
    const tooltip = document.createElement('div');
    tooltip.className = 'day-tooltip';
    tooltip.innerHTML = dayInterviews.map(i => 
      `${i.nombre} - ${i.hora || 'Sin hora'}`
    ).join('<br>');
    dayEl.appendChild(tooltip);
  }
  
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = dayNum;
  dayEl.appendChild(dayNumber);
  
  if(dayInterviews.length > 0 && !isOtherMonth) {
    dayInterviews.forEach(interview => {
      const interviewInfo = document.createElement('div');
      interviewInfo.className = 'day-interview-item';
      interviewInfo.innerHTML = `
        <div class="interview-name">${escapeHtml(interview.nombre || 'Sin nombre')}</div>
        <div class="interview-time">🕐 ${escapeHtml(interview.hora || 'Sin hora')}</div>
      `;
      dayEl.appendChild(interviewInfo);
    });
  }
  
  // Click para ver detalles o crear entrevista
  if(!isOtherMonth) {
    dayEl.style.cursor = 'pointer';
    dayEl.addEventListener('click', () => {
      showDayInterviews(dateStr, dayInterviews);
    });
  }
  
  return dayEl;
}

function showDayInterviews(date, dayInterviews) {
  const hours = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'];
  const hourLabels = ['3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM'];
  
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;';
  
  const content = document.createElement('div');
  content.style.cssText = 'background:var(--card);padding:24px;border-radius:12px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
  
  // Sumar +1 día para mostrar (ajuste de zona horaria)
  const displayDate = addOneDayToDate(date);
  const dateObj = new Date(displayDate + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('es-ES', {day:'numeric',month:'long',year:'numeric'});
  
  let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h3 style="margin:0;color:var(--accent-dark);">📅 ' + dateStr + '</h3><button class="close-modal" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--muted);">✕</button></div>';
  html += '<div style="font-weight:600;color:var(--accent-dark);margin-bottom:12px;font-size:1.1rem;">⏰ Horarios (3:00 PM - 11:00 PM):</div>';
  
  hours.forEach((hour, idx) => {
    const interview = dayInterviews.find(i => i.hora === hour);
    const isOccupied = !!interview;
    const color = isOccupied ? '#ef4444' : '#10b981';
    const bg = isOccupied ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)';
    const btnBg = isOccupied ? '#ff6b6b' : '#60a5fa';
    const btnText = isOccupied ? 'Editar' : 'Crear';
    
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;margin-bottom:8px;background:' + bg + ';border-left:4px solid ' + color + ';border-radius:8px;"><div style="flex:1;"><div style="font-weight:600;color:var(--accent-dark);">' + hourLabels[idx] + '</div>';
    if(isOccupied) {
      html += '<strong style="color:#ef4444;">' + escapeHtml(interview.nombre) + '</strong><div style="color:var(--muted);font-size:0.8rem;">👤 ' + escapeHtml(interview.entrevistador || 'Sin asignar') + '</div>';
    } else {
      html += '<div style="color:#10b981;font-weight:500;">✓ Disponible</div>';
    }
    html += '</div><div style="display:flex;gap:6px;"><button class="btn-edit-time" data-hour="' + hour + '" data-interview-id="' + (isOccupied ? interview.id : '') + '" style="padding:6px 12px;font-size:0.75rem;background:' + btnBg + ';color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;">' + (isOccupied ? '✏️ ' : '➕ ') + btnText + '</button>';
    if(isOccupied) {
      html += '<button class="btn-delete-time" data-interview-id="' + interview.id + '" style="padding:6px 12px;font-size:0.75rem;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;">🗑️ Eliminar</button>';
    }
    html += '</div></div>';
  });
  
  html += '<div style="margin-top:20px;padding-top:12px;border-top:1px solid rgba(11,96,209,0.1);"><button class="btn btn-primary" id="closeModalBtn" style="width:100%;">Cerrar</button></div>';
  content.innerHTML = html;
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const closeBtn = content.querySelector('.close-modal');
  const closeBtnPrimary = content.querySelector('#closeModalBtn');
  closeBtn.addEventListener('click', () => modal.remove());
  closeBtnPrimary.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove(); });
  
  content.querySelectorAll('.btn-edit-time').forEach(btn => {
    btn.addEventListener('click', () => {
      const hour = btn.dataset.hour;
      const interviewId = btn.dataset.interviewId;
      if(interviewId) {
        const interview = interviews.find(i => String(i.id) === String(interviewId));
        if(interview) {
          modal.remove();
          interviewForm.dataset.mode = 'edit';
          interviewForm.dataset.editId = interviewId;
          interviewForm.nombre.value = interview.nombre || '';
          interviewForm.fecha.value = interview.fecha || '';
          interviewForm.hora.value = interview.hora || '';
          interviewForm.entrevistador.value = interview.entrevistador || '';
          interviewForm.notas.value = interview.notas || '';
          interviewForm.estado.value = interview.estado || 'Pendiente';
          document.getElementById('interviewFormTitle').textContent = 'Editar entrevista';
          toggleInterviewForm(true);
        }
      } else {
        modal.remove();
        interviewForm.dataset.mode = 'create';
        interviewForm.reset();
        interviewForm.fecha.value = date;
        interviewForm.hora.value = hour;
        document.getElementById('interviewFormTitle').textContent = 'Agregar entrevista';
        toggleInterviewForm(true);
      }
    });
  });

  content.querySelectorAll('.btn-delete-time').forEach(btn => {
    btn.addEventListener('click', async () => {
      const interviewId = btn.dataset.interviewId;
      const interview = interviews.find(i => String(i.id) === String(interviewId));
      if(interview && confirm(`¿Eliminar la entrevista de ${interview.nombre}?`)) {
        modal.remove();
        await deleteInterview(interviewId);
      }
    });
  });
}

async function deleteInterview(interviewId) {
  const interview = interviews.find(i => String(i.id) === String(interviewId));
  if(!interview) return;
  
  const rowIndex = interviews.indexOf(interview) + 2;
  
  // 1. ELIMINAR INMEDIATAMENTE DEL UI (UX rápida)
  interviews.splice(interviews.indexOf(interview), 1);
  renderInterviews(interviews, getTodayDateStr());
  renderCalendar(currentYear, currentMonth);
  renderDashboard();
  console.log('✓ Entrevista eliminada del UI');
  
  // 2. PROCESAR EN BACKGROUND (sin bloquear UI)
  (async () => {
    try {
      const res = await fetch('/sheet/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName: 'Hoja 2',
          rowIndex: rowIndex
        })
      });
      
      if(res.ok) {
        console.log('✓ Eliminada del backend');
        await logAudit('DELETE', 'Interview', interview.id, 
          `Eliminada: ${interview.nombre} (${interview.fecha}, ${interview.hora})`);
      } else {
        console.error('⚠️ Error:', res.status, await res.text());
        await logAudit('DELETE', 'Interview', interview.id, 
          `Eliminada (local): ${interview.nombre} (${interview.fecha}, ${interview.hora})`);
      }
    } catch(err) {
      console.error('Error sincronizando eliminación:', err);
      // No restaurar porque ya fue eliminado (optimista)
    }
  })();
  
  console.log('Entrevista eliminada localmente (offline mode)');
}

// Navegación del calendario
function initCalendarNavigation() {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const toggleViewBtn = document.getElementById('toggleViewBtn');
  const toggleWeekViewBtn = document.getElementById('toggleWeekViewBtn');
  
  if(prevBtn) {
    prevBtn.addEventListener('click', () => {
      if(calendarViewMode === 'week') {
        // Retroceder una semana
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeekCalendar();
      } else {
        currentMonth--;
        if(currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
      }
    });
  }
  
  if(nextBtn) {
    nextBtn.addEventListener('click', () => {
      if(calendarViewMode === 'week') {
        // Avanzar una semana
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeekCalendar();
      } else {
        currentMonth++;
        if(currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
      }
    });
  }
  
  if(toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      viewMode = viewMode === 'calendar' ? 'list' : 'calendar';
      
      if(viewMode === 'calendar') {
        $calendarView.classList.remove('hidden');
        $listView.classList.add('hidden');
        document.getElementById('viewIcon').textContent = '📋';
        document.getElementById('viewText').textContent = 'Vista Lista';
        renderCalendar(currentYear, currentMonth);
      } else {
        $calendarView.classList.add('hidden');
        $listView.classList.remove('hidden');
        document.getElementById('viewIcon').textContent = '📅';
        document.getElementById('viewText').textContent = 'Vista Calendario';
        // Usar entrevistas filtradas si existen, sino usar todas
        const sourceInterviews = (window.interviewsFiltered && Array.isArray(window.interviewsFiltered)) ? window.interviewsFiltered : interviews;
        renderInterviews(sourceInterviews, getTodayDateStr());
      }
    });
  }
  
  if(toggleWeekViewBtn) {
    toggleWeekViewBtn.addEventListener('click', () => {
      if(calendarViewMode === 'week') {
        // Cambiar a vista mensual
        calendarViewMode = 'month';
        document.getElementById('weekViewIcon').textContent = '📆';
        document.getElementById('weekViewText').textContent = 'Vista Semanal';
        renderCalendar(currentYear, currentMonth);
      } else {
        // Cambiar a vista semanal
        calendarViewMode = 'week';
        // Inicializar con la semana actual
        if(!currentWeekStart) {
          currentWeekStart = new Date();
          // Ajustar al domingo de esta semana
          const day = currentWeekStart.getDay();
          currentWeekStart.setDate(currentWeekStart.getDate() - day);
        }
        document.getElementById('weekViewIcon').textContent = '📅';
        document.getElementById('weekViewText').textContent = 'Vista Mensual';
        renderWeekCalendar();
      }
    });
  }
}

// ==================== VISTA SEMANAL ====================

function renderWeekCalendar() {
  const calendarDays = document.getElementById('calendarDays');
  const currentMonthEl = document.getElementById('currentMonth');
  
  if(!calendarDays || !currentMonthEl) return;
  
  // Agregar clase para vista semanal
  calendarDays.classList.add('week-view');
  
  // Calcular rango de la semana
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const monthStart = monthNames[currentWeekStart.getMonth()];
  const monthEnd = monthNames[weekEnd.getMonth()];
  const yearStart = currentWeekStart.getFullYear();
  const yearEnd = weekEnd.getFullYear();
  
  let titleText = '';
  if(monthStart === monthEnd && yearStart === yearEnd) {
    titleText = `${currentWeekStart.getDate()}-${weekEnd.getDate()} ${monthStart} ${yearStart}`;
  } else if(yearStart === yearEnd) {
    titleText = `${currentWeekStart.getDate()} ${monthStart} - ${weekEnd.getDate()} ${monthEnd} ${yearStart}`;
  } else {
    titleText = `${currentWeekStart.getDate()} ${monthStart} ${yearStart} - ${weekEnd.getDate()} ${monthEnd} ${yearEnd}`;
  }
  
  currentMonthEl.textContent = `📆 Semana: ${titleText}`;
  calendarDays.innerHTML = '';
  
  // Generar 7 días
  for(let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const today = new Date();
    const isToday = year === today.getFullYear() && 
                    month === today.getMonth() && 
                    day === today.getDate();
    
    const dayEl = createDayElement(day, false, isToday, year, month);
    calendarDays.appendChild(dayEl);
  }
}

// ==================== FILTRADO POR RANGO DE FECHAS ====================

// Obtener entrevistas entre dos fechas
function getInterviewsByDateRange(startDate, endDate) {
  return interviews.filter(i => {
    if(!i.fecha) return false;
    return i.fecha >= startDate && i.fecha <= endDate;
  });
}

// Obtener las próximas N entrevistas
function getNextNInterviews(n = 5) {
  const today = getTodayDateStr();
  const upcoming = interviews
    .filter(i => i.fecha >= today && i.estado !== 'Cancelada')
    .sort((a, b) => {
      // Ordenar por fecha y luego por hora
      if(a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return (a.hora || '').localeCompare(b.hora || '');
    })
    .slice(0, n);
  
  return upcoming;
}

// Obtener entrevistas de esta semana
function getThisWeekInterviews() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Obtener domingo de esta semana
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  
  // Obtener sábado de esta semana
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const startStr = formatDateToYYYYMMDD(weekStart);
  const endStr = formatDateToYYYYMMDD(weekEnd);
  
  return getInterviewsByDateRange(startStr, endStr);
}

// Obtener entrevistas de la próxima semana
function getNextWeekInterviews() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Obtener domingo de la próxima semana
  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() - dayOfWeek + 7);
  nextWeekStart.setHours(0, 0, 0, 0);
  
  // Obtener sábado de la próxima semana
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
  nextWeekEnd.setHours(23, 59, 59, 999);
  
  const startStr = formatDateToYYYYMMDD(nextWeekStart);
  const endStr = formatDateToYYYYMMDD(nextWeekEnd);
  
  return getInterviewsByDateRange(startStr, endStr);
}

// Helper: formatear fecha a YYYY-MM-DD
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Mostrar entrevistas filtradas en vista lista
function showFilteredInterviews(filteredInterviews, title = 'Entrevistas Filtradas') {
  // Guardar entrevistas filtradas para el calendario
  window.interviewsFiltered = filteredInterviews.slice();
  
  viewMode = 'list';
  $calendarView.classList.add('hidden');
  $listView.classList.remove('hidden');
  document.getElementById('viewIcon').textContent = '📅';
  document.getElementById('viewText').textContent = 'Vista Calendario';
  
  // Actualizar título temporal si existe un elemento para ello
  const sectionTitle = document.querySelector('.interviews-section h2');
  if(sectionTitle) {
    sectionTitle.textContent = `📅 ${title}`;
    setTimeout(() => {
      sectionTitle.textContent = '📅 Agenda de Entrevistas 2026';
    }, 5000);
  }
  
  renderInterviews(filteredInterviews);
}

// Funciones manejadoras para los botones de filtrado rápido
function initQuickFilters() {
  const showNextInterviewsBtn = document.getElementById('showNextInterviewsBtn');
  const showThisWeekBtn = document.getElementById('showThisWeekBtn');
  const showNextWeekBtn = document.getElementById('showNextWeekBtn');
  
  if(showNextInterviewsBtn) {
    showNextInterviewsBtn.addEventListener('click', () => {
      const nextInterviews = getNextNInterviews(5);
      showFilteredInterviews(nextInterviews, 'Próximas 5 Entrevistas');
      document.getElementById('filtersPanel').classList.add('hidden');
    });
  }
  
  if(showThisWeekBtn) {
    showThisWeekBtn.addEventListener('click', () => {
      const thisWeek = getThisWeekInterviews();
      showFilteredInterviews(thisWeek, 'Entrevistas de Esta Semana');
      document.getElementById('filtersPanel').classList.add('hidden');
    });
  }
  
  if(showNextWeekBtn) {
    showNextWeekBtn.addEventListener('click', () => {
      const nextWeek = getNextWeekInterviews();
      showFilteredInterviews(nextWeek, 'Entrevistas de la Próxima Semana');
      document.getElementById('filtersPanel').classList.add('hidden');
    });
  }
}

// renderNotes eliminada - sistema de recordatorios deshabilitado
function renderNotes(list) {
  const $notesList = document.getElementById('notesList');
  if (!$notesList) return;
  $notesList.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;">Sistema de recordatorios deshabilitado.</p>';
}

// loadNotes eliminada - sistema de recordatorios deshabilitado
async function loadNotes() {
  console.log('loadNotes(): sistema de recordatorios deshabilitado');
  return;
}

// Guardar nota: funcionalidad de creación de recordatorios eliminada
async function saveNote(payload) {
  console.log('saveNote(): creación de recordatorios deshabilitada. Payload recibido:', payload);
  return false;
}

// Exportar entrevistas a Excel
function exportInterviewsToExcel() {
  const listToExport = (currentRenderedInterviews && currentRenderedInterviews.length) ? currentRenderedInterviews : applyInterviewFilters(interviews);
  const data = listToExport.map(i => ({
    'Nombre': i.nombre,
    'Fecha': i.fecha,
    'Hora': i.hora,
    'Entrevistador': i.entrevistador,
    'Lugar': i.lugar,
    'Notas': i.notas,
    'Estado': i.estado
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Entrevistas');
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 20 }, // Nombre
    { wch: 12 }, // Fecha
    { wch: 10 }, // Hora
    { wch: 20 }, // Entrevistador
    { wch: 20 }, // Lugar
    { wch: 30 }, // Notas
    { wch: 12 }  // Estado
  ];
  
  const now = new Date().toLocaleDateString('es-ES');
  XLSX.writeFile(wb, `Entrevistas_${now}.xlsx`);
  console.log('Entrevistas exportadas a Excel');
}

// exportNotesToPDF eliminada - sistema de recordatorios deshabilitado
function exportNotesToPDF() {
  console.log('exportNotesToPDF(): función deshabilitada - sistema de recordatorios eliminado');
  return false;
}

// Exportar entrevistas a PDF
function exportInterviewsToPDF() {
  const listToExport = (currentRenderedInterviews && currentRenderedInterviews.length) ? currentRenderedInterviews : applyInterviewFilters(interviews);
  const element = document.createElement('div');
  element.style.padding = '20px';
  element.innerHTML = `
    <h1 style="color:#0b60d1;margin-bottom:20px;">Entrevistas — ${new Date().toLocaleDateString('es-ES')}</h1>
    ${listToExport.map(it => `
      <div style="margin-bottom:16px;padding:12px;border-left:4px solid ${it.estado === 'Cancelada' ? '#ef4444' : it.estado === 'Completada' ? '#10b981' : '#0b60d1'};background:#f9fafb;">
        <h3 style="margin:0 0 6px;color:#083f9a;">${escapeHtml(it.nombre || it.titulo || 'Entrevista')}</h3>
        <p style="margin:0 0 6px;"><strong>Fecha:</strong> ${escapeHtml(it.fecha || '')} ${it.hora ? ' - ' + escapeHtml(it.hora) : ''}</p>
        <p style="margin:0 0 6px;"><strong>Entrevistador:</strong> ${escapeHtml(it.entrevistador || '')}</p>
        <p style="margin:0 0 6px;"><strong>Lugar:</strong> ${escapeHtml(it.lugar || '')}</p>
        <p style="margin:0 0 6px;"><strong>Notas:</strong> ${escapeHtml(it.notas || it.descripcion || '')}</p>
        <p style="margin:0;"><strong>Estado:</strong> ${escapeHtml(it.estado || '')}</p>
      </div>
    `).join('')}
  `;

  const opt = {
    margin: 10,
    filename: `Entrevistas_${new Date().toLocaleDateString('es-ES')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };

  html2pdf().set(opt).from(element).save();
  console.log('Entrevistas exportadas a PDF');
}

// Sistema de Alertas y Notificaciones
function checkAlerts() {
  const today = getTodayDateStr();
  const alerts = [];
  
  // Alertas de recordatorios eliminadas - sistema deshabilitado
  
  // Alertas de entrevistas de hoy
  const todayInterviews = interviews.filter(i => i.fecha === today && i.estado !== 'Cancelada');
  if(todayInterviews.length > 0) {
    alerts.push({
      type: 'today-interviews',
      count: todayInterviews.length,
      message: `📅 Tienes ${todayInterviews.length} entrevista(s) hoy`,
      items: todayInterviews.slice(0, 3)
    });
  }
  
  // Alertas de entrevistas próximas (próximos 3 días)
  const nextDays = [];
  for(let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    nextDays.push(date.getFullYear() + '-' + 
                  String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(date.getDate()).padStart(2, '0'));
  }
  
  const upcomingInterviews = interviews.filter(i => 
    nextDays.includes(i.fecha) && i.estado !== 'Cancelada'
  );
  
  if(upcomingInterviews.length > 0) {
    alerts.push({
      type: 'upcoming-interviews',
      count: upcomingInterviews.length,
      message: `🔔 ${upcomingInterviews.length} entrevista(s) próxima(s) en los próximos 3 días`,
      items: upcomingInterviews.slice(0, 3)
    });
  }
  
  // Alertas de notas eliminadas - sistema de recordatorios deshabilitado
  
  return alerts;
}

// Mostrar alertas en notificación flotante
function showAlertsNotification() {
  const alerts = checkAlerts();
  
  if(alerts.length === 0) return;
  
  // Actualizar contador en la campana
  const urgentCount = alerts.reduce((sum, a) => sum + (a.type.includes('urgent') || a.type.includes('overdue') ? a.count : 0), 0);
  const counterEl = document.getElementById('notificationCounter');
  if(counterEl && urgentCount > 0) {
    counterEl.textContent = urgentCount;
    counterEl.classList.remove('hidden');
  }
  
  // Crear panel de alertas
  let existingPanel = document.getElementById('alertsPanel');
  if(existingPanel) existingPanel.remove();
  
  const alertsPanel = document.createElement('div');
  alertsPanel.id = 'alertsPanel';
  alertsPanel.style.cssText = `
    position:fixed;
    bottom:20px;
    right:20px;
    background:#fff;
    border-radius:12px;
    box-shadow:0 10px 40px rgba(0,0,0,0.2);
    max-width:400px;
    z-index:1000;
    animation:slideIn 0.3s ease-out;
    border-left:5px solid #ef4444;
  `;
  
  let html = '<div style="padding:16px;">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
  html += '<strong style="color:#dc2626;font-size:1.1rem;">🔔 Alertas</strong>';
  html += '<button onclick="this.closest(\'#alertsPanel\').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">✕</button>';
  html += '</div>';
  
  alerts.forEach(alert => {
    const icon = alert.type === 'urgent-reminder' ? '⚠️' :
                alert.type === 'today-interviews' ? '📅' :
                alert.type === 'upcoming-interviews' ? '🔔' : '⏰';
    
    html += `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;">
              <div style="color:#374151;font-weight:600;margin-bottom:6px;">${icon} ${alert.message}</div>
              <div style="font-size:0.9rem;color:#6b7280;">
                ${alert.items.map(item => {
                  const text = item.nombre || item.tipo || item.title;
                  return `• ${text}`;
                }).join('<br>')}
              </div>
            </div>`;
  });
  
  html += '</div>';
  alertsPanel.innerHTML = html;
  
  // Agregar animación CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(450px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(alertsPanel);
  
  // Auto-cerrar después de 8 segundos
  setTimeout(() => {
    alertsPanel.style.transition = 'opacity 0.3s ease-out';
    alertsPanel.style.opacity = '0';
    setTimeout(() => alertsPanel.remove(), 300);
  }, 8000);
}

// ==================== FUNCIONES DE AUDITORÍA ====================

// Registrar cambios en el historial
async function logAudit(action, entity, entityId, details) {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: action,
    entity: entity,
    entityId: entityId,
    details: details
  };
  
  auditLog.push(auditEntry);
  
  // Guardar en el backend
  try {
    const res = await fetch('/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditEntry)
    });
    
    if(res.ok) {
      console.log('✓ Auditoría registrada:', action);
    }
  } catch(err) {
    console.warn('⚠️ Error guardando auditoría:', err);
  }
}

// Cargar historial de auditoría
async function loadAuditLog() {
  try {
    const res = await fetch('/audit');
    if(res.ok) {
      const data = await res.json();
      auditLog.length = 0;
      data.forEach(entry => auditLog.push(entry));
      console.log('✓ Historial cargado:', auditLog.length, 'entradas');
    }
  } catch(err) {
    console.warn('⚠️ Error cargando historial:', err);
  }
}

// Mostrar modal del historial de auditoría
function showAuditHistory() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;';
  
  const content = document.createElement('div');
  content.style.cssText = 'background:var(--card);padding:24px;border-radius:12px;max-width:700px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
  
  let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
  html += '<h3 style="margin:0;color:var(--accent-dark);">📋 Historial de Auditoría</h3>';
  html += '<button onclick="this.closest(\'div\').parentElement.parentElement.remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--muted);">✕</button>';
  html += '</div>';
  
  if(auditLog.length === 0) {
    html += '<p style="color:var(--muted);">No hay registros de auditoría</p>';
  } else {
    // Mostrar los últimos 50 registros
    const recent = auditLog.slice(-50).reverse();
    html += '<div style="font-size:0.9rem;">';
    
    recent.forEach((entry, idx) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
      
      const actionIcon = entry.action === 'CREATE' ? '➕' :
                        entry.action === 'UPDATE' ? '✏️' :
                        entry.action === 'DELETE' ? '🗑️' : '📝';
      
      const bgColor = entry.action === 'CREATE' ? 'rgba(76, 175, 80, 0.05)' :
                      entry.action === 'UPDATE' ? 'rgba(33, 150, 243, 0.05)' :
                      entry.action === 'DELETE' ? 'rgba(244, 67, 54, 0.05)' : 'rgba(11, 96, 209, 0.05)';
      
      const borderColor = entry.action === 'CREATE' ? '#4caf50' :
                         entry.action === 'UPDATE' ? '#2196f3' :
                         entry.action === 'DELETE' ? '#f44336' : 'var(--accent)';
      
      html += `<div style="padding:12px;margin-bottom:8px;background:${bgColor};border-radius:6px;border-left:3px solid ${borderColor};">
                <div style="font-weight:600;color:${borderColor};">${actionIcon} ${entry.action}</div>
                <div style="color:var(--muted);font-size:0.85rem;margin-top:4px;">
                  <div><strong>Entidad:</strong> ${escapeHtml(entry.entity)} ${entry.entityId ? '(' + entry.entityId + ')' : ''}</div>
                  <div><strong>Hora:</strong> ${dateStr}</div>
                  ${entry.details ? `<div><strong>Detalles:</strong> ${escapeHtml(entry.details)}</div>` : ''}
                </div>
              </div>`;
    });
    
    html += '</div>';
  }
  
  html += '<div style="margin-top:20px;padding-top:12px;border-top:1px solid rgba(11,96,209,0.1);"><button onclick="this.closest(\'div\').parentElement.parentElement.remove()" class="btn btn-primary" style="width:100%;">Cerrar</button></div>';
  
  content.innerHTML = html;
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if(e.target === modal) modal.remove();
  });
}

// Cargar datos desde el backend al iniciar
async function loadDataFromBackend(){
  // Intentar cargar desde servidor local primero
  let useLocalServer = false;
  try {
    const testRes = await fetch('/sheet?name=Hoja 1');
    if(testRes.ok) useLocalServer = true;
  } catch(e) { /* Servidor local no disponible */ }
  
  if(useLocalServer) {
    // Cargar reportes desde servidor local
    try{
      const res = await fetch('/sheet?name=Hoja 1');
      if(res.ok){
        const data = await res.json();
        console.log('Datos recibidos del backend (Hoja 1):', data);
        if(Array.isArray(data) && data.length){
          reports.length = 0;
          data.forEach(r => reports.push(r));
          console.log('Reportes cargados:', reports.length);
        }
      }
    }catch(err){ console.warn('Error cargando datos iniciales:', err); }
    
    // Cargar entrevistas desde servidor local
    try{
      console.log('Intentando cargar entrevistas desde Hoja 2...');
      const res = await fetch('/sheet?name=Hoja 2');
      if(res.ok){
        const data = await res.json();
        console.log('Entrevistas recibidas (Hoja 2):', data);
        if(Array.isArray(data)){
          interviews.length = 0;
          data.forEach(i => {
            const normalized = normalizeInterview(i);
            interviews.push(normalized);
          });
          console.log('Entrevistas cargadas:', interviews.length, interviews);
        }
      }
    }catch(err){ 
      console.error('Error al hacer fetch de entrevistas:', err); 
    }
  } else {
    // Usar Google Sheets público (GViz)
    console.log('Usando Google Sheets público (GViz)');
    await loadFromSheets();
  }
  
  render(reports);
  renderCalendar(currentYear, currentMonth);
  renderInterviews(interviews, getTodayDateStr());
  renderElders(elders);
  await loadNotes();
  await loadAuditLog();
  await loadTemplates();
  await loadMissionaries();
  
  // Renderizar solo si las funciones existen y hay datos válidos
  if (typeof renderTemplates === 'function' && Array.isArray(templates)) {
    try {
      renderTemplates(templates);
    } catch (err) {
      console.warn('Error renderizando plantillas:', err);
    }
  }
  if (typeof renderMissionaries === 'function' && Array.isArray(missionaries)) {
    try {
      renderMissionaries(missionaries);
    } catch (err) {
      console.warn('Error renderizando misioneros:', err);
    }
  }
  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
  if (typeof showAlertsNotification === 'function') {
    showAlertsNotification();
  }
  if (typeof initCalendarNavigation === 'function') {
    initCalendarNavigation();
  }
  if (typeof initQuickFilters === 'function') {
    initQuickFilters();
  }
}

// ==================== FUNCIONES DE PLANTILLAS ====================

// Plantillas de notas: funcionalidad eliminada (stubs seguros)
async function loadTemplates() {
  console.log('loadTemplates(): plantillas eliminadas — no se cargan plantillas');
  templates.length = 0;
  return;
}

async function saveTemplate(tipo, nombre, contenido) {
  console.log('saveTemplate(): plantillas eliminadas — operación no disponible');
  return false;
}

function deleteTemplate(templateId) {
  console.log('deleteTemplate(): plantillas eliminadas — operación no disponible (id=', templateId, ')');
  return false;
}

function useTemplate(templateId) {
  console.log('useTemplate(): plantillas eliminadas — operación no disponible (id=', templateId, ')');
  return false;
}

// Duplicar nota deshabilitado (creación de recordatorios eliminada)
function duplicateNote(noteId) {
  console.log('duplicateNote(): operación deshabilitada para noteId=', noteId);
  return false;
}

// Renderizar lista de plantillas
function renderTemplates(list) {
  const $templatesList = document.getElementById('templatesList');
  if (!$templatesList) return;
  $templatesList.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px;">Las Plantillas de Notas han sido eliminadas.</p>';
  return;
}

// ==================== FUNCIONES DE MISIONEROS ====================

// Cargar misioneros desde el servidor (gestor eliminado — stub)
async function loadMissionaries() {
  console.log('loadMissionaries(): gestor de misioneros eliminado — no se cargan misioneros');
  // Mantener array vacío
  missionaries.length = 0;
  return;
}

// Helper para obtener el id de una entidad (soporta 'ID', 'Id', 'id', y variantes)
function getEntityId(obj) {
  if (!obj) return null;
  if (obj.ID !== undefined && obj.ID !== null && String(obj.ID).trim() !== '') return obj.ID;
  if (obj.id !== undefined && obj.id !== null && String(obj.id).trim() !== '') return obj.id;
  // Buscar claves cuyo nombre sea 'id' ignorando mayúsculas/espacios
  for (const k of Object.keys(obj)) {
    if (k && String(k).trim().toLowerCase() === 'id') {
      return obj[k];
    }
  }
  return null;
}

// Crear nuevo misionero (gestor eliminado — stub)
async function saveMissionary(nombre, telefono, area, fechaInicio, estado, notas) {
  console.log('saveMissionary(): gestor de misioneros eliminado — operación no disponible');
  return false;
}

// Actualizar misionero (gestor eliminado — stub)
async function updateMissionary(id, nombre, telefono, area, fechaInicio, estado, notas) {
  console.log('updateMissionary(): gestor de misioneros eliminado — operación no disponible');
  return false;
}

// Eliminado gestor de misioneros: funciones seguras (no-op) y render defensivo
function deleteMissionary(id) {
  console.log('deleteMissionary(): gestor de misioneros eliminado — operación no disponible (id=', id, ')');
  // No realizar ninguna acción para evitar errores en runtime
  return false;
}

// Renderizar lista de misioneros (no-op seguro)
function renderMissionaries(list) {
  const $missionariesList = document.getElementById('missionariesList');
  if (!$missionariesList) return;
  $missionariesList.innerHTML = '<p style="color:var(--muted);">El gestor de misioneros ha sido eliminado.</p>';
}

// Abrir modal de edición de misionero (no-op)
function editMissionary(id) {
  console.log('editMissionary(): gestor de misioneros eliminado — operación no disponible (id=', id, ')');
  return false;
}

// Mostrar estadísticas de misioneros (no-op)
function showMissionaryStats() {
  console.log('showMissionaryStats(): gestor de misioneros eliminado — operación no disponible');
  alert('Estadísticas de misioneros deshabilitadas.');
}

// Función para cargar datos sin mostrar loader (se llamará desde core.js)
async function loadDataOnly() {
  await loadDataFromBackend();
}

// UI elements added for CRUD
const refreshBtn = document.getElementById('refreshBtn');
const newBtn = document.getElementById('newBtn');
const formPanel = document.getElementById('formPanel');
const reportForm = document.getElementById('reportForm');
const cancelForm = document.getElementById('cancelForm');

// Interview elements
const newInterviewBtn = document.getElementById('newInterviewBtn');
const interviewFormPanel = document.getElementById('interviewFormPanel');
const interviewForm = document.getElementById('interviewForm');
const cancelInterviewForm = document.getElementById('cancelInterviewForm');

// Notes elements (creation UI removed)
const notificationBell = document.getElementById('notificationBell');

// Filtros elements
const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
const filtersPanel = document.getElementById('filtersPanel');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

// Event listener para la campana de notificaciones
if(notificationBell) {
  notificationBell.addEventListener('click', () => {
    // Hacer scroll hacia la sección de notas
    const notesSection = document.querySelector('.notes-section');
    if(notesSection) {
      notesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Event listener para mostrar/ocultar filtros
if(toggleFiltersBtn) {
  toggleFiltersBtn.addEventListener('click', () => {
    filtersPanel.classList.toggle('hidden');
    filtersPanel.setAttribute('aria-hidden', filtersPanel.classList.contains('hidden'));
  });
}

// Event listener para aplicar filtros
if(applyFiltersBtn) {
  applyFiltersBtn.addEventListener('click', async () => {
    try {
      // Mostrar loader
      const loader = createFilterLoader();
      document.body.appendChild(loader);
      
      console.log('🔄 Iniciando aplicación de filtros...');
      
      // Recopilar valores de filtros
      activeFilters.states = Array.from(document.querySelectorAll('.filter-state:checked')).map(el => el.value);
      activeFilters.entrevistador = document.getElementById('filterEntrevistador').value || '';
      activeFilters.fechaDesde = document.getElementById('filterFechaDesde').value || '';
      activeFilters.fechaHasta = document.getElementById('filterFechaHasta').value || '';
      
      console.log('🔍 Filtros configurados:', activeFilters);
      
      // Simular pequeña pausa para mostrar el loader
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Re-renderizar con filtros aplicados
      console.log('🔍 Total entrevistas disponibles:', interviews.length);
      console.log('🔍 Array de entrevistas:', interviews);
      
      const filteredInterviews = applyInterviewFilters(interviews);
      
      // Guardar entrevistas filtradas para el calendario y otros componentes
      window.interviewsFiltered = filteredInterviews.slice();
      
      console.log('📅 Actualizando vista de lista...');
      renderInterviews(filteredInterviews, getTodayDateStr());
      
      console.log('📅 Actualizando calendario con filtros...');
      renderCalendar(currentYear, currentMonth); // Actualizar calendario con filtros
      
      // Verificar que el calendario se actualizó
      const calendarDays = document.querySelectorAll('.calendar-day.has-interview');
      console.log('📅 Días con entrevistas en calendario después del filtro:', calendarDays.length);
      
      filtersPanel.classList.add('hidden');
      
      // Mostrar mensaje si no hay resultados
      if(filteredInterviews.length === 0) {
        showNoResultsMessage();
      }
      
    } catch(error) {
      console.error('❌ Error aplicando filtros:', error);
      alert('Error al aplicar filtros: ' + error.message);
    } finally {
      // Ocultar loader
      const loader = document.querySelector('.filter-loader');
      if(loader) loader.remove();
    }
  });
}

// Event listener para limpiar filtros
if(clearFiltersBtn) {
  clearFiltersBtn.addEventListener('click', () => {
    // Reset filters
    document.querySelectorAll('.filter-state').forEach(el => el.checked = true);
    const filterEntrevistador = document.getElementById('filterEntrevistador');
    if(filterEntrevistador) filterEntrevistador.value = ''; // "Todos"
    document.getElementById('filterFechaDesde').value = '';
    document.getElementById('filterFechaHasta').value = '';
    
    activeFilters = {
      states: ['Pendiente', 'Completada', 'Cancelada'],
      entrevistador: '',
      fechaDesde: '',
      fechaHasta: '',
      // priorities removed
    };
    
    // Re-renderizar sin filtros
    window.interviewsFiltered = null; // Limpiar filtros guardados
    renderInterviews(interviews, getTodayDateStr());
    renderCalendar(currentYear, currentMonth); // Actualizar calendario sin filtros
  });
}

// Crear loader para filtros
function createFilterLoader() {
  const loader = document.createElement('div');
  loader.className = 'filter-loader';
  loader.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10000;
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 40px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: system-ui, sans-serif;
  `;
  
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  const text = document.createElement('span');
  text.textContent = 'Aplicando filtros...';
  text.style.color = '#374151';
  
  loader.appendChild(spinner);
  loader.appendChild(text);
  
  // Add CSS animation
  if(!document.querySelector('#spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
  
  return loader;
}

// Mostrar mensaje cuando no hay resultados
function showNoResultsMessage() {
  const message = document.createElement('div');
  message.className = 'no-results-message';
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    color: #92400e;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  message.innerHTML = '⚠️ No se encontraron entrevistas con los filtros aplicados';
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    if(message.parentNode) message.remove();
  }, 3000);
  
  // Add CSS animation
  if(!document.querySelector('#slideIn-style')) {
    const style = document.createElement('style');
    style.id = 'slideIn-style';
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(style);
  }
}

// Botón de prueba de filtros
const testFiltersBtn = document.getElementById('testFiltersBtn');
if(testFiltersBtn) {
  testFiltersBtn.addEventListener('click', async () => {
    console.log('🧪 Probando filtros automáticamente...');
    
    // Configurar filtros de prueba: Obispo, Pendiente, rango de fechas
    document.querySelector('.filter-state[value="Pendiente"]').checked = true;
    document.querySelector('.filter-state[value="Completada"]').checked = false;
    document.querySelector('.filter-state[value="Cancelada"]').checked = false;
    
    const filterEntrevistador = document.getElementById('filterEntrevistador');
    if(filterEntrevistador) filterEntrevistador.value = 'Obispo';
    
    document.getElementById('filterFechaDesde').value = '2026-01-12';
    document.getElementById('filterFechaHasta').value = '2026-01-18';
    
    console.log('🧪 Filtros configurados automáticamente. Aplicando...');
    
    // Simular click en aplicar filtros
    const applyBtn = document.getElementById('applyFiltersBtn');
    if(applyBtn) applyBtn.click();
  });
}

const exportNotesBtn = document.getElementById('exportNotesBtn');

// Manejar botón de imprimir reporte detallado
const printBtn = document.getElementById('printBtn');
if(printBtn) {
  printBtn.addEventListener('click', () => {
    generateDetailedInterviewReport();
  });
}

if(exportInterviewsBtn) {
  exportInterviewsBtn.addEventListener('click', () => {
    if(interviews.length === 0) {
      alert('No hay entrevistas para exportar');
      return;
    }
    exportInterviewsToExcel();
  });
}

if(exportNotesBtn) {
  exportNotesBtn.addEventListener('click', () => {
    if(interviews.length === 0) {
      alert('No hay entrevistas para exportar');
      return;
    }
    exportInterviewsToPDF();
  });
}

const auditHistoryBtn = document.getElementById('auditHistoryBtn');
if(auditHistoryBtn) {
  auditHistoryBtn.addEventListener('click', () => {
    showAuditHistory();
  });
}

function toggleForm(show=false){
  if(!formPanel) return;
  formPanel.classList.toggle('hidden', !show);
  formPanel.setAttribute('aria-hidden', String(!show));
}

if($search){
  $search.addEventListener('input', e => render(filter(e.target.value)));
}

// Búsqueda global
const globalSearchInput = document.getElementById('globalSearch');
if(globalSearchInput) {
  globalSearchInput.addEventListener('input', e => {
    const results = globalSearch(e.target.value);
    renderGlobalSearchResults(results);
  });
  
  // Cerrar resultados al hacer click fuera
  document.addEventListener('click', e => {
    if(!e.target.closest('.search-global-section')) {
      document.getElementById('globalSearchResults').classList.add('hidden');
    }
  });
}

if(refreshBtn){
  refreshBtn.addEventListener('click', async () => {
    // intenta recargar desde backend si está disponible
    try{
      const res = await fetch('/sheet?name=Hoja 1');
      if(res.ok){
        const data = await res.json();
        console.log('Datos refrescados:', data);
        if(Array.isArray(data) && data.length){
          reports.length = 0; data.forEach(r => reports.push(r));
          render(reports);
          return;
        }
      }
      // fallback: mostrar mensaje si no hay datos
      console.warn('No se pudieron cargar datos');
      render(reports);
    }catch(err){ console.warn('Refresh error', err); render(reports); }
  });
}

if(newBtn){ newBtn.addEventListener('click', () => { reportForm.dataset.mode='create'; reportForm.reset(); toggleForm(true); }); }
if(cancelForm){ cancelForm.addEventListener('click', () => toggleForm(false)); }

// Interview form handlers
function toggleInterviewForm(show=false){
  if(!interviewFormPanel) return;
  interviewFormPanel.classList.toggle('hidden', !show);
  interviewFormPanel.setAttribute('aria-hidden', String(!show));
}

// Notes creation form removed — no toggle function

if(newInterviewBtn){ 
  newInterviewBtn.addEventListener('click', () => { 
    interviewForm.dataset.mode='create'; 
    interviewForm.reset(); 
    document.getElementById('interviewFormTitle').textContent = 'Agregar entrevista';
    toggleInterviewForm(true); 
  }); 
}
if(cancelInterviewForm){ cancelInterviewForm.addEventListener('click', () => toggleInterviewForm(false)); }

// Notes creation UI removed — event handlers disabled

// Delegated interview edit/delete handlers moved to public/scripts/interviews.js

if(reportForm){
  reportForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(reportForm);
    const payload = { title: fd.get('title'), description: fd.get('description'), date: fd.get('date'), link: fd.get('link') };
    const mode = reportForm.dataset.mode || 'create';
    
    if(mode === 'edit'){
      // Actualizar reporte existente
      const editId = reportForm.dataset.editId;
      const report = reports.find(r => String(r.id) === String(editId));
      if(report){
        // Encontrar índice de fila en el Excel (asumiendo que el ID está en la primera columna)
        const rowIndex = reports.indexOf(report) + 2; // +2 porque fila 1 son headers y Excel es 1-indexed
        try{
          const res = await fetch('/sheet/update', { 
            method: 'PUT', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ 
              sheetName: 'Hoja 1', 
              range: `Hoja 1!A${rowIndex}:G${rowIndex}`, 
              values: [editId, payload.title, payload.description, payload.date, payload.link, '', ''] 
            }) 
          });
          if(res.ok){ toggleForm(false); document.getElementById('formTitle').textContent = 'Agregar reporte'; refreshBtn.click(); return; }
        }catch(err){ console.warn('Error actualizando', err); }
        // fallback local
        Object.assign(report, payload);
        render(reports);
      }
      toggleForm(false);
      document.getElementById('formTitle').textContent = 'Agregar reporte';
    } else {
      // Crear nuevo reporte
      // Excel tiene: id, title, description, date, link, name, role
      // Enviamos: id (auto), title, description, date, link, name (vacío), role (vacío)
      const newId = Date.now();
      try{
        const res = await fetch('/sheet/append', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ sheetName: 'Hoja 1', values: [newId, payload.title, payload.description, payload.date, payload.link, '', ''] }) });
        if(res.ok){ toggleForm(false); refreshBtn.click(); return; }
      }catch(err){ console.warn('No backend append', err); }
      // fallback local
      reports.push({ id: Date.now(), ...payload });
      render(reports);
      toggleForm(false);
    }
  });
}

// Interview form submission
if(interviewForm){
  interviewForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(interviewForm);
    const payload = { 
      nombre: fd.get('nombre'), 
      fecha: fd.get('fecha'), 
      hora: fd.get('hora'), 
      entrevistador: fd.get('entrevistador'),
      notas: fd.get('notas'),
      estado: fd.get('estado')
    };
    const mode = interviewForm.dataset.mode || 'create';
    
    if(mode === 'edit'){
      const editId = interviewForm.dataset.editId;
      const interview = interviews.find(i => String(i.id) === String(editId));
      if(interview){
        const rowIndex = interviews.indexOf(interview) + 2;
        try{
          const res = await fetch('/sheet/update', { 
            method: 'PUT', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ 
              sheetName: 'Hoja 2', 
              range: `Hoja 2!A${rowIndex}:G${rowIndex}`, 
              values: [editId, payload.nombre, payload.fecha, payload.hora, payload.entrevistador, payload.notas, payload.estado] 
            }) 
          });
          if(res.ok){ 
            console.log('Entrevista actualizada en Excel');
            
            // Registrar en auditoría
            await logAudit('UPDATE', 'Interview', editId, 
              `Actualizada: ${payload.nombre} (${payload.fecha}, ${payload.hora}) - Estado: ${payload.estado}`);
            
            toggleInterviewForm(false); 
            document.getElementById('interviewFormTitle').textContent = 'Agregar entrevista';
            await loadDataFromBackend();
            return; 
          } else {
            console.error('Error en respuesta del servidor:', res.status);
          }
        }catch(err){ 
          console.error('Error actualizando entrevista:', err); 
        }
        Object.assign(interview, payload);
        renderInterviews(interviews, getTodayDateStr());
        renderCalendar(currentYear, currentMonth);
      }
      toggleInterviewForm(false);
      document.getElementById('interviewFormTitle').textContent = 'Agregar entrevista';
    } else {
      const newId = Date.now();
      const newInterview = { id: newId, ...payload };
      try{
        console.log('Intentando guardar entrevista:', newInterview);
        const res = await fetch('/sheet/append', { 
          method: 'POST', 
          headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify({ 
            sheetName: 'Hoja 2', 
            values: [newId, payload.nombre, payload.fecha, payload.hora, payload.entrevistador, payload.notas, payload.estado] 
          }) 
        });
        if(res.ok){ 
          console.log('Entrevista guardada en Excel exitosamente');
          
          // Registrar en auditoría
          await logAudit('CREATE', 'Interview', newId, 
            `Nueva: ${payload.nombre} (${payload.fecha}, ${payload.hora})`);
          
          toggleInterviewForm(false);
          document.getElementById('interviewFormTitle').textContent = 'Agregar entrevista';
          await loadDataFromBackend();
          return; 
        } else {
          console.error('Error en respuesta del servidor:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('Error details:', errorText);
        }
      }catch(err){ 
        console.error('Error al guardar entrevista:', err); 
      }
      // Fallback local
      interviews.push(newInterview);
      renderInterviews(interviews, getTodayDateStr());
      renderCalendar(currentYear, currentMonth);
      renderDashboard();
      toggleInterviewForm(false);
      console.log('Entrevista guardada localmente (offline mode)');
    }
  });
}

// Notes creation form submit removed (crear recordatorio deshabilitado)

  /* Google Sheets loader (GViz) */
  // Opcional: usa Google Sheets pública como base de datos.
  // Pasos rápidos para usar:
  // 1) Crea una Google Sheet con dos pestañas: 'reports' y 'elders'.
  // 2) En cada pestaña la primera fila debe ser cabeceras
  // 3) Haz la hoja visible: Compartir -> Cualquiera con el enlace -> Ver
  // 4) Copia el ID de la hoja (parte entre /d/ y /edit) y ponlo en SHEET_ID abajo.

  function parseGvizText(text){
    const start = text.indexOf('(');
    const end = text.lastIndexOf(')');
    const jsonText = text.substring(start+1, end);
    return JSON.parse(jsonText);
  }

  function gvizToObjects(gviz){
    const cols = gviz.table.cols.map(c => c.label || c.id);
    const rows = gviz.table.rows || [];
    return rows.map(r => {
      const obj = {};
      r.c.forEach((cell, i) => {
        obj[cols[i]] = cell ? cell.v : '';
      });
      return obj;
    });
  }

  async function fetchSheet(sheetId, sheetName){
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&tqx=out:json`;
    const res = await fetch(url, {cache: 'no-store'});
    if(!res.ok) throw new Error('No se pudo cargar la hoja: ' + res.statusText);
    const text = await res.text();
    const parsed = parseGvizText(text);
    return gvizToObjects(parsed);
  }

  async function loadFromSheets(){
    if(!SHEET_ID) return;
    try{
      const [rdata, idata] = await Promise.all([
        fetchSheet(SHEET_ID, REPORTS_SHEET),
        fetchSheet(SHEET_ID, INTERVIEWS_SHEET)
      ]);
      // Normalizar reportes
      if(Array.isArray(rdata) && rdata.length) {
        reports.length = 0;
        rdata.forEach(row => {
          reports.push({
            id: row.id || (reports.length+1),
            title: row.title || '',
            description: row.description || '',
            date: row.date || '',
            link: row.link || ''
          });
        });
        render(reports);
      }
      // Normalizar entrevistas
      if(Array.isArray(idata) && idata.length){
        interviews.length = 0;
        idata.forEach(row => {
          const normalized = normalizeInterview(row);
          interviews.push(normalized);
        });
        renderInterviews(interviews, getTodayDateStr());
      }
    }catch(err){
      console.warn('Error cargando Sheets:', err);
    }
  }
