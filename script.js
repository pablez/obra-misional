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

const $reports = document.getElementById('reports');
const $search = document.getElementById('search');
const $eldersGrid = document.getElementById('eldersGrid');

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

// inicializa
render(reports);
renderElders(elders);

// UI elements added for CRUD
const refreshBtn = document.getElementById('refreshBtn');
const newBtn = document.getElementById('newBtn');
const formPanel = document.getElementById('formPanel');
const reportForm = document.getElementById('reportForm');
const cancelForm = document.getElementById('cancelForm');

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
      const res = await fetch('/datos');
      if(res.ok){
        const data = await res.json();
        if(Array.isArray(data) && data.length){
          reports.length = 0; data.forEach(r => reports.push(r));
          render(reports);
          return;
        }
      }
      // fallback: mostrar mensaje si no hay datos
      render(reports);
    }catch(err){ console.warn('Refresh error', err); render(reports); }
  });
}

if(newBtn){ newBtn.addEventListener('click', () => { reportForm.dataset.mode='create'; reportForm.reset(); toggleForm(true); }); }
if(cancelForm){ cancelForm.addEventListener('click', () => toggleForm(false)); }

if(reportForm){
  reportForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(reportForm);
    const payload = { title: fd.get('title'), description: fd.get('description'), date: fd.get('date'), link: fd.get('link') };
    // intentar POST al backend; si no responde, añadir localmente
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
  });
}

  /* ------------------ Google Sheets loader (GViz) ------------------ */
  // Opcional: usa Google Sheets pública como base de datos.
  // Pasos rápidos para usar:
  // 1) Crea una Google Sheet con dos pestañas: 'reports' y 'elders'.
  // 2) En cada pestaña la primera fila debe ser cabeceras: por ejemplo
  //    reports: id,title,description,date,link
  //    elders: name,role,img
  // 3) Haz la hoja visible: Compartir -> Cualquiera con el enlace -> Ver (o publica en web).
  // 4) Copia el ID de la hoja (parte entre /d/ y /edit) y ponlo en SHEET_ID abajo.

  const SHEET_ID = ''; // poner aquí el ID si quieres cargar desde Sheets
  const REPORTS_SHEET = 'reports';
  const ELDERS_SHEET = 'elders';

  function parseGvizText(text){
    // El endpoint devuelve: google.visualization.Query.setResponse({...});
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
    if(!SHEET_ID) return; // no configurado
    try{
      const [rdata, edata] = await Promise.all([
        fetchSheet(SHEET_ID, REPORTS_SHEET),
        fetchSheet(SHEET_ID, ELDERS_SHEET)
      ]);
      // Normalizar y asignar
      if(Array.isArray(rdata) && rdata.length) {
        // mapear campos mínimos
        reports.length = 0;
        rdata.forEach(row => {
          reports.push({
            id: row.id || (reports.length+1),
            title: row.title || row.titulo || '',
            description: row.description || row.desc || '',
            date: row.date || row.fecha || '',
            link: row.link || row.enlace || ''
          });
        });
        render(reports);
      }
      if(Array.isArray(edata) && edata.length){
        elders.length = 0;
        edata.forEach(row => {
          elders.push({
            name: row.name || row.nombre || '',
            role: row.role || row.rol || '',
            img: row.img || row.imagen || ''
          });
        });
        renderElders(elders);
      }
    }catch(err){
      console.warn('Error cargando Sheets:', err);
    }
  }

  // intenta cargar si se configuró SHEET_ID
  loadFromSheets();
