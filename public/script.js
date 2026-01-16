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

// Notas/Recordatorios
const notes = [];

// Plantillas de Notas
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
let viewMode = 'calendar'; // 'calendar' o 'list'

// Historial de auditoría
const auditLog = [];

// Filtros activos
let activeFilters = {
  states: ['Pendiente', 'Completada', 'Cancelada'],
  entrevistador: '',
  fechaDesde: '',
  fechaHasta: '',
  priorities: ['URGENTE', 'Alta', 'Media', 'Baja']
};

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
  return list.filter(i => {
    // Filtro de estado
    if(!activeFilters.states.includes(i.estado)) return false;
    
    // Filtro de entrevistador
    if(activeFilters.entrevistador && 
       !i.entrevistador?.toLowerCase().includes(activeFilters.entrevistador.toLowerCase())) {
      return false;
    }
    
    // Filtro de rango de fechas
    if(activeFilters.fechaDesde && i.fecha < activeFilters.fechaDesde) return false;
    if(activeFilters.fechaHasta && i.fecha > activeFilters.fechaHasta) return false;
    
    return true;
  });
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
  
  // Buscar en notas
  notes.forEach(n => {
    if(n.nota?.toLowerCase().includes(q) ||
       n.tipo?.toLowerCase().includes(q) ||
       n.relacionadoA?.toLowerCase().includes(q)) {
      results.push({
        type: 'note',
        id: n.fecha + n.nota.substring(0,10),
        title: n.tipo,
        subtitle: `${n.fecha} - Prioridad: ${n.prioridad}`,
        text: n.nota.substring(0, 60) + (n.nota.length > 60 ? '...' : ''),
        data: n
      });
    }
  });
  
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
function applyNotesFilters(list) {
  return list.filter(n => {
    // Filtro de prioridad
    if(!activeFilters.priorities.includes(n.prioridad)) return false;
    return true;
  });
}

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

// Mostrar estadísticas en el dashboard
function renderDashboard() {
  const stats = calculateStatistics();
  
  // Actualizar KPIs
  document.getElementById('kpiTotalEntrevistas').textContent = stats.total;
  document.getElementById('kpiCompletadas').textContent = stats.completadas;
  document.getElementById('kpiPendientes').textContent = stats.pendientes;
  document.getElementById('kpiPorcentaje').textContent = stats.porcentaje + '%';
  
  // Gráfico de estado
  renderChartEstado(stats);
  
  // Gráfico de entrevistadores
  renderChartEntrevistadores(stats);
  
  // Gráfico de meses
  renderChartMeses(stats);
  
  // Top entrevistadores
  renderTopInterviewers(stats);
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

// Renderizar calendario
function renderCalendar(year, month) {
  const calendarDays = document.getElementById('calendarDays');
  const currentMonthEl = document.getElementById('currentMonth');
  
  if(!calendarDays || !currentMonthEl) return;
  
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
  
  // Buscar entrevistas para este día
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  const dayInterviews = interviews.filter(i => i.fecha === dateStr);
  
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
  
  if(prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentMonth--;
      if(currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentYear, currentMonth);
    });
  }
  
  if(nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentMonth++;
      if(currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentYear, currentMonth);
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
        renderInterviews(interviews, getTodayDateStr());
      }
    });
  }
}

// Funciones para manejar notas/recordatorios
function renderNotes(list) {
  if(!$notesList) return;
  
  // Aplicar filtros
  const filtered = applyNotesFilters(list);
  
  // Actualizar contador en la campana
  const counterEl = document.getElementById('notificationCounter');
  if(counterEl) {
    counterEl.textContent = filtered.length;
    counterEl.classList.toggle('hidden', filtered.length === 0);
  }
  
  $notesList.innerHTML = '';
  
  if(!filtered.length) {
    $notesList.innerHTML = '<p>No hay recordatorios.</p>';
    return;
  }
  
  // Agrupar notas por prioridad
  const priorityOrder = { 'URGENTE': 0, 'Alta': 1, 'Media': 2, 'Baja': 3 };
  const sorted = [...filtered].sort((a, b) => {
    const priorityA = priorityOrder[a.prioridad] || 4;
    const priorityB = priorityOrder[b.prioridad] || 4;
    return priorityA - priorityB;
  });
  
  sorted.forEach(n => {
    const card = document.createElement('article');
    card.className = `note-card priority-${(n.prioridad || 'Media').toLowerCase()}`;
    
    // Colores por prioridad
    let priorityColor = '#10b981'; // Baja
    if(n.prioridad === 'Media') priorityColor = '#f59e0b'; // Naranja
    if(n.prioridad === 'Alta') priorityColor = '#ef4444'; // Rojo
    if(n.prioridad === 'URGENTE') priorityColor = '#dc2626'; // Rojo oscuro
    
    card.style.borderLeftColor = priorityColor;
    
    card.innerHTML = `
      <div class="note-header">
        <span class="note-type">${escapeHtml(n.tipo || '')}</span>
        <span class="note-date">📅 ${n.fecha || ''}</span>
      </div>
      <div class="note-content">
        <p>${escapeHtml(n.nota || '')}</p>
        ${n.relacionadoA ? `<div class="note-related">👤 ${escapeHtml(n.relacionadoA)}</div>` : ''}
      </div>
      <div class="note-footer">
        <span class="note-priority" style="background: ${priorityColor};">${escapeHtml(n.prioridad || '')}</span>
      </div>
    `;
    $notesList.appendChild(card);
  });
}

// Cargar notas del backend
async function loadNotes() {
  try {
    const res = await fetch('/notes');
    if(res.ok) {
      const data = await res.json();
      console.log('Notas recibidas:', data);
      if(Array.isArray(data)) {
        notes.length = 0;
        data.forEach(n => notes.push(n));
        renderNotes(notes);
      }
    }
  } catch(err) {
    console.warn('Error cargando notas:', err);
  }
}

// Guardar nota
async function saveNote(payload) {
  try {
    const noteId = payload.id || Date.now();
    const res = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: noteId,
        fecha: payload.fecha,
        tipo: payload.tipo,
        nota: payload.nota,
        relacionadoA: payload.relacionadoA,
        prioridad: payload.prioridad
      })
    });
    
    if(res.ok) {
      console.log('Nota guardada');
      
      // Registrar en auditoría
      await logAudit('CREATE', 'Note', noteId, 
        `Nueva: ${payload.nota.substring(0, 50)}... (${payload.prioridad})`);
      
      notes.push(payload);
      renderNotes(notes);
      return true;
    }
  } catch(err) {
    console.error('Error guardando nota:', err);
    // Fallback local
    notes.push(payload);
    renderNotes(notes);
  }
}

// Exportar entrevistas a Excel
function exportInterviewsToExcel() {
  const data = interviews.map(i => ({
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

// Exportar notas a PDF
function exportNotesToPDF() {
  const element = document.createElement('div');
  element.style.padding = '20px';
  element.innerHTML = `
    <h1 style="color:#0b60d1;margin-bottom:20px;">Recordatorios — ${new Date().toLocaleDateString('es-ES')}</h1>
    ${notes.map(n => `
      <div style="margin-bottom:20px;padding:15px;border-left:4px solid ${n.prioridad === 'URGENTE' ? '#dc2626' : n.prioridad === 'Alta' ? '#ef4444' : n.prioridad === 'Media' ? '#f59e0b' : '#10b981'};background:#f9fafb;">
        <h3 style="margin:0 0 10px;color:#083f9a;">${escapeHtml(n.tipo)}</h3>
        <p style="margin:0 0 8px;"><strong>Fecha:</strong> ${escapeHtml(n.fecha)}</p>
        <p style="margin:0 0 8px;"><strong>Prioridad:</strong> ${escapeHtml(n.prioridad)}</p>
        <p style="margin:0 0 8px;"><strong>Nota:</strong> ${escapeHtml(n.nota)}</p>
        ${n.relacionadoA ? `<p style="margin:0;"><strong>Relacionado a:</strong> ${escapeHtml(n.relacionadoA)}</p>` : ''}
      </div>
    `).join('')}
  `;
  
  const opt = {
    margin: 10,
    filename: `Recordatorios_${new Date().toLocaleDateString('es-ES')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
  console.log('Recordatorios exportados a PDF');
}

// Sistema de Alertas y Notificaciones
function checkAlerts() {
  const today = getTodayDateStr();
  const alerts = [];
  
  // Alertas de recordatorios URGENTES
  const urgentNotes = notes.filter(n => n.prioridad === 'URGENTE');
  if(urgentNotes.length > 0) {
    alerts.push({
      type: 'urgent-reminder',
      count: urgentNotes.length,
      message: `⚠️ Tienes ${urgentNotes.length} recordatorio(s) URGENTE(S)`,
      items: urgentNotes.slice(0, 3)
    });
  }
  
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
  
  // Alertas de notas de Alta prioridad vencidas
  const overduePriority = notes.filter(n => n.prioridad === 'Alta' && n.fecha < today);
  if(overduePriority.length > 0) {
    alerts.push({
      type: 'overdue-priority',
      count: overduePriority.length,
      message: `⏰ ${overduePriority.length} tarea(s) de alta prioridad vencida(s)`,
      items: overduePriority.slice(0, 3)
    });
  }
  
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

// Duplicar nota existente
function duplicateNote(noteId) {
  const note = notes.find(n => String(n.id) === String(noteId));
  if (!note) return;

  const newNote = {
    id: Date.now(),
    fecha: note.fecha,
    tipo: note.tipo,
    nota: note.nota + ' (copia)',
    relacionadoA: note.relacionadoA,
    prioridad: note.prioridad
  };

  saveNote(newNote);
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

// Notes elements
const newNotesBtn = document.getElementById('newNotesBtn');
const notesFormPanel = document.getElementById('notesFormPanel');
const notesForm = document.getElementById('notesForm');
const cancelNotesForm = document.getElementById('cancelNotesForm');
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
  applyFiltersBtn.addEventListener('click', () => {
    // Recopilar valores de filtros
    activeFilters.states = Array.from(document.querySelectorAll('.filter-state:checked')).map(el => el.value);
    activeFilters.entrevistador = document.getElementById('filterEntrevistador').value || '';
    activeFilters.fechaDesde = document.getElementById('filterFechaDesde').value || '';
    activeFilters.fechaHasta = document.getElementById('filterFechaHasta').value || '';
    activeFilters.priorities = Array.from(document.querySelectorAll('.filter-priority:checked')).map(el => el.value);
    
    // Re-renderizar con filtros aplicados
    const filteredInterviews = applyInterviewFilters(interviews);
    renderInterviews(filteredInterviews, getTodayDateStr());
    renderNotes(notes);
    
    filtersPanel.classList.add('hidden');
  });
}

// Event listener para limpiar filtros
if(clearFiltersBtn) {
  clearFiltersBtn.addEventListener('click', () => {
    // Reset filters
    document.querySelectorAll('.filter-state').forEach(el => el.checked = true);
    document.querySelectorAll('.filter-priority').forEach(el => el.checked = true);
    document.getElementById('filterEntrevistador').value = '';
    document.getElementById('filterFechaDesde').value = '';
    document.getElementById('filterFechaHasta').value = '';
    
    activeFilters = {
      states: ['Pendiente', 'Completada', 'Cancelada'],
      entrevistador: '',
      fechaDesde: '',
      fechaHasta: '',
      priorities: ['URGENTE', 'Alta', 'Media', 'Baja']
    };
    
    // Re-renderizar sin filtros
    renderInterviews(interviews, getTodayDateStr());
    renderNotes(notes);
  });
}

// Botones de exportación
const exportInterviewsBtn = document.getElementById('exportInterviewsBtn');
const exportNotesBtn = document.getElementById('exportNotesBtn');

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
    if(notes.length === 0) {
      alert('No hay recordatorios para exportar');
      return;
    }
    exportNotesToPDF();
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

function toggleNotesForm(show=false){
  if(!notesFormPanel) return;
  notesFormPanel.classList.toggle('hidden', !show);
  notesFormPanel.setAttribute('aria-hidden', String(!show));
}

if(newInterviewBtn){ 
  newInterviewBtn.addEventListener('click', () => { 
    interviewForm.dataset.mode='create'; 
    interviewForm.reset(); 
    document.getElementById('interviewFormTitle').textContent = 'Agregar entrevista';
    toggleInterviewForm(true); 
  }); 
}
if(cancelInterviewForm){ cancelInterviewForm.addEventListener('click', () => toggleInterviewForm(false)); }

if(newNotesBtn){
  newNotesBtn.addEventListener('click', () => {
    notesForm.dataset.mode = 'create';
    notesForm.reset();
    // Establecer la fecha de hoy por defecto
    notesForm.fecha.value = getTodayDateStr();
    document.getElementById('notesFormTitle').textContent = 'Agregar Recordatorio';
    toggleNotesForm(true);
  });
}
if(cancelNotesForm){ cancelNotesForm.addEventListener('click', () => toggleNotesForm(false)); }

// Manejar clic en botón editar (delegación de eventos)
document.addEventListener('click', e => {
  if(e.target.closest('.btn-edit')){
    const btn = e.target.closest('.btn-edit');
    const id = btn.dataset.id;
    const report = reports.find(r => String(r.id) === String(id));
    if(report){
      reportForm.dataset.mode = 'edit';
      reportForm.dataset.editId = id;
      reportForm.title.value = report.title || '';
      reportForm.description.value = report.description || '';
      reportForm.date.value = report.date || '';
      reportForm.link.value = report.link || '';
      document.getElementById('formTitle').textContent = 'Editar reporte';
      toggleForm(true);
    }
  }
  
  // Edit interview
  if(e.target.closest('.btn-edit-interview')){
    const btn = e.target.closest('.btn-edit-interview');
    const id = btn.dataset.id;
    const interview = interviews.find(i => String(i.id) === String(id));
    if(interview){
      interviewForm.dataset.mode = 'edit';
      interviewForm.dataset.editId = id;
      interviewForm.nombre.value = interview.nombre || '';
      interviewForm.fecha.value = interview.fecha || '';
      interviewForm.hora.value = interview.hora || '';
      interviewForm.entrevistador.value = interview.entrevistador || '';
      interviewForm.notas.value = interview.notas || '';
      interviewForm.estado.value = interview.estado || 'Pendiente';
      document.getElementById('interviewFormTitle').textContent = 'Editar entrevista';
      toggleInterviewForm(true);
    }
  }

  // Delete interview
  if(e.target.closest('.btn-delete-interview')){
    const btn = e.target.closest('.btn-delete-interview');
    const id = btn.dataset.id;
    const interview = interviews.find(i => String(i.id) === String(id));
    if(interview && confirm(`¿Eliminar la entrevista de ${interview.nombre}?`)){
      deleteInterview(id);
    }
  }
});

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

if(notesForm){
  notesForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(notesForm);
    const payload = {
      fecha: fd.get('fecha'),
      tipo: fd.get('tipo'),
      nota: fd.get('nota'),
      relacionadoA: fd.get('relacionadoA'),
      prioridad: fd.get('prioridad')
    };
    
    await saveNote(payload);
    toggleNotesForm(false);
    notesForm.reset();
  });
}

  /* Google Sheets loader (GViz) */
  // Opcional: usa Google Sheets pública como base de datos.
  // Pasos rápidos para usar:
  // 1) Crea una Google Sheet con dos pestañas: 'reports' y 'elders'.
  // 2) En cada pestaña la primera fila debe ser cabeceras
  // 3) Haz la hoja visible: Compartir -> Cualquiera con el enlace -> Ver
  // 4) Copia el ID de la hoja (parte entre /d/ y /edit) y ponlo en SHEET_ID abajo.

  const SHEET_ID = '1LQL5cnyEynGWxrO-K4BtRjHonGUPjyam19wCziYqqzs';
  const REPORTS_SHEET = 'Hoja 1';
  const INTERVIEWS_SHEET = 'Hoja 2';

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
