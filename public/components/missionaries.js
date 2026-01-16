// ==================== COMPONENTE: GESTIÓN DE MISIONEROS ====================

const MissionariesComponent = {
  // Inicializar eventos
  init() {
    const newMissionaryBtn = document.getElementById('newMissionaryBtn');
    const showStatsBtn = document.getElementById('showMissionaryStatsBtn');

    if (newMissionaryBtn) {
      newMissionaryBtn.addEventListener('click', () => this.showNewMissionaryModal());
    }

    if (showStatsBtn) {
      showStatsBtn.addEventListener('click', () => showMissionaryStats());
    }
  },

  // Mostrar modal para crear nuevo misionero
  showNewMissionaryModal() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;';

    const content = document.createElement('div');
    content.style.cssText = 'background:var(--card);padding:24px;border-radius:12px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);';

    content.innerHTML = `
      <h3 style="margin-top:0;color:var(--accent-dark);">➕ Nuevo Misionero</h3>
      <form id="newMissionaryForm" style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;">Nombre *</label>
          <input type="text" id="missionaryName" placeholder="Nombre completo" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;">
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;">Teléfono</label>
          <input type="tel" id="missionaryPhone" placeholder="+591-XXX-XXXX" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;">
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;">Área *</label>
          <select id="missionaryArea" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;">
            <option value="">-- Seleccionar área --</option>
            <option value="Obra Misional">Obra Misional</option>
            <option value="Evangelización">Evangelización</option>
            <option value="Administración">Administración</option>
            <option value="Servicio Social">Servicio Social</option>
            <option value="Educación">Educación</option>
            <option value="Capacitación">Capacitación</option>
            <option value="Otra">Otra</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;">Fecha de Inicio</label>
          <input type="date" id="missionaryDate" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;">
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;">Estado</label>
          <select id="missionaryStatus" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;">Notas</label>
          <textarea id="missionaryNotes" placeholder="Información adicional" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;min-height:80px;"></textarea>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button type="button" onclick="this.closest('div').parentElement.parentElement.remove()" class="btn btn-secondary" style="flex:1;">Cancelar</button>
          <button type="submit" class="btn btn-primary" style="flex:1;">Crear Misionero</button>
        </div>
      </form>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('newMissionaryForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('missionaryName').value;
      const telefono = document.getElementById('missionaryPhone').value;
      const area = document.getElementById('missionaryArea').value;
      const fechaInicio = document.getElementById('missionaryDate').value;
      const estado = document.getElementById('missionaryStatus').value;
      const notas = document.getElementById('missionaryNotes').value;

      const success = await saveMissionary(nombre, telefono, area, fechaInicio, estado, notas);
      if (success) {
        alert('✓ Misionero creado exitosamente');
        modal.remove();
        renderMissionaries(missionaries);
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  // Filtrar misioneros por estado
  filterByStatus(status) {
    if (status === 'todos') {
      renderMissionaries(missionaries);
    } else {
      const filtered = missionaries.filter(m => m.Estado === status);
      renderMissionaries(filtered);
    }
  },

  // Buscar misionero
  searchMissionaries(query) {
    const q = query.toLowerCase();
    const filtered = missionaries.filter(m =>
      m.Nombre.toLowerCase().includes(q) ||
      m.Área.toLowerCase().includes(q) ||
      m.Teléfono.toLowerCase().includes(q)
    );
    renderMissionaries(filtered);
  },

  // Exportar misioneros a Excel
  exportToExcel() {
    if (missionaries.length === 0) {
      alert('No hay misioneros para exportar');
      return;
    }

    const data = missionaries.map(m => ({
      'Nombre': m.Nombre,
      'Teléfono': m.Teléfono,
      'Área': m.Área,
      'Fecha Inicio': m['Fecha Inicio'],
      'Estado': m.Estado,
      'Notas': m.Notas
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Misioneros');

    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 30 }
    ];

    XLSX.writeFile(wb, `Misioneros_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};

// Inicializado por core.js cuando todos los datos estén listos
