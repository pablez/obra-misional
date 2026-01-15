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

const $reports = document.getElementById('reports');
const $search = document.getElementById('search');
const $eldersGrid = document.getElementById('eldersGrid');
const $listView = document.getElementById('listView');
const $calendarView = document.getElementById('calendarView');

// Estado del calendario
let currentYear = 2026;
let currentMonth = 0; // Enero
let viewMode = 'calendar'; // 'calendar' o 'list'

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function formatDate(d){
  try{ return new Date(d).toLocaleDateString(); }catch(e){return d}
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
  
  if(fecha instanceof Date) {
    fecha = fecha.toISOString().split('T')[0];
  } else if(typeof fecha === 'string' && !fecha.includes('-')) {
    // Parsear si viene en otro formato
    try {
      const d = new Date(fecha);
      if(!isNaN(d.getTime())) fecha = d.toISOString().split('T')[0];
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
  
  if(hora instanceof Date) {
    hora = String(hora.getHours()).padStart(2,'0') + ':' + String(hora.getMinutes()).padStart(2,'0');
  } else if(typeof hora === 'string' && !hora.includes(':')) {
    // Si es número o formato sin :
    try {
      const d = new Date(hora);
      if(!isNaN(d.getTime())) hora = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    } catch(e) {}
  }
  
  return {
    id: i.id || Date.now(),
    nombre: i.nombre || '',
    fecha: fecha || '',
    hora: hora || '',
    lugar: i.lugar || '',
    notas: i.notas || '',
    estado: i.estado || 'Pendiente'
  };
}

function renderInterviews(list){
  if(!$listView) return;
  $listView.innerHTML = '';
  if(!list.length){ $listView.innerHTML = '<p>No hay entrevistas programadas.</p>'; return }
  list.forEach(i => {
    const card = document.createElement('article');
    card.className = `interview-card ${(i.estado || '').toLowerCase()}`;
    const statusClass = (i.estado || 'pendiente').toLowerCase();
    card.innerHTML = `
      <h4>${escapeHtml(i.nombre || 'Sin nombre')}</h4>
      <div class="interview-meta">
        <span>📅 ${formatDate(i.fecha)}</span>
        <span>🕐 ${escapeHtml(i.hora || '')}</span>
        <span>📍 ${escapeHtml(i.lugar || 'Por definir')}</span>
      </div>
      <p>${escapeHtml(i.notas || '')}</p>
      <span class="interview-status ${statusClass}">${escapeHtml(i.estado || 'Pendiente')}</span>
      <div class="interview-actions">
        <button class="btn btn-ghost btn-edit-interview" data-id="${i.id}" title="Editar">✏️</button>
      </div>
    `;
    $listView.appendChild(card);
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
  
  // Click para ver detalles
  if(dayInterviews.length > 0 && !isOtherMonth) {
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
  
  const dateObj = new Date(date + 'T12:00:00');
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
      html += '<strong style="color:#ef4444;">' + escapeHtml(interview.nombre) + '</strong><div style="color:var(--muted);font-size:0.8rem;">📍 ' + escapeHtml(interview.lugar || 'Sin lugar') + '</div>';
    } else {
      html += '<div style="color:#10b981;font-weight:500;">✓ Disponible</div>';
    }
    html += '</div><button class="btn-edit-time" data-hour="' + hour + '" data-interview-id="' + (isOccupied ? interview.id : '') + '" style="padding:6px 12px;font-size:0.75rem;background:' + btnBg + ';color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;">' + (isOccupied ? '✏️ ' : '➕ ') + btnText + '</button></div>';
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
          interviewForm.lugar.value = interview.lugar || '';
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
        renderInterviews(interviews);
      }
    });
  }
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
  renderInterviews(interviews);
  renderElders(elders);
  initCalendarNavigation();
}

// inicializa
loadDataFromBackend();

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

function toggleForm(show=false){
  if(!formPanel) return;
  formPanel.classList.toggle('hidden', !show);
  formPanel.setAttribute('aria-hidden', String(!show));
}

if($search){
  $search.addEventListener('input', e => render(filter(e.target.value)));
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

if(newInterviewBtn){ 
  newInterviewBtn.addEventListener('click', () => { 
    interviewForm.dataset.mode='create'; 
    interviewForm.reset(); 
    document.getElementById('interviewFormTitle').textContent = 'Agregar entrevista';
    toggleInterviewForm(true); 
  }); 
}
if(cancelInterviewForm){ cancelInterviewForm.addEventListener('click', () => toggleInterviewForm(false)); }

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
      interviewForm.lugar.value = interview.lugar || '';
      interviewForm.notas.value = interview.notas || '';
      interviewForm.estado.value = interview.estado || 'Pendiente';
      document.getElementById('interviewFormTitle').textContent = 'Editar entrevista';
      toggleInterviewForm(true);
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
      lugar: fd.get('lugar'),
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
              values: [editId, payload.nombre, payload.fecha, payload.hora, payload.lugar, payload.notas, payload.estado] 
            }) 
          });
          if(res.ok){ 
            console.log('Entrevista actualizada en Excel');
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
        renderInterviews(interviews);
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
            values: [newId, payload.nombre, payload.fecha, payload.hora, payload.lugar, payload.notas, payload.estado] 
          }) 
        });
        if(res.ok){ 
          console.log('Entrevista guardada en Excel exitosamente');
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
      renderInterviews(interviews);
      renderCalendar(currentYear, currentMonth);
      toggleInterviewForm(false);
      console.log('Entrevista guardada localmente (offline mode)');
    }
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
        renderInterviews(interviews);
      }
    }catch(err){
      console.warn('Error cargando Sheets:', err);
    }
  }
