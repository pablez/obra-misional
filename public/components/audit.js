// ==================== COMPONENTE: AUDITORÍA/HISTORIAL ====================

const AuditComponent = {
  // Inicializar auditoría
  init() {
    this.setupEventListeners();
  },

  // Configurar event listeners
  setupEventListeners() {
    const auditBtn = document.getElementById('auditBtn');
    if (auditBtn) {
      auditBtn.addEventListener('click', () => this.showModal());
    }
  },

  // Mostrar modal de auditoría
  showModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: var(--card);
      padding: 24px;
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-height: 600px;
      overflow-y: auto;
    `;

    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;color:var(--accent-dark);">📋 Historial de Auditoría</h3>
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">✕</button>
      </div>

      <div id="auditList" style="display:flex;flex-direction:column;gap:12px;"></div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Llenar lista de auditoría
    this.renderAuditLog(content.querySelector('#auditList'));

    // Cerrar al hacer click afuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  // Renderizar log de auditoría
  renderAuditLog(container) {
    if (auditLog.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center;">No hay registros de auditoría</p>';
      return;
    }

    container.innerHTML = auditLog.slice().reverse().map((entry, idx) => `
      <div style="background:#f8faff;border-left:3px solid ${this.getActionColor(entry.action)};padding:12px;border-radius:4px;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">
          <span style="font-weight:600;color:var(--accent-dark);">${this.getActionLabel(entry.action)}</span>
          <span style="font-size:0.8rem;color:var(--muted);">${new Date(entry.timestamp).toLocaleString()}</span>
        </div>
        <div style="font-size:0.9rem;color:var(--muted);">
          ${entry.details}
        </div>
      </div>
    `).join('');
  },

  // Obtener color según acción
  getActionColor(action) {
    const colors = {
      'CREATE': '#4ade80',
      'UPDATE': '#fbbf24',
      'DELETE': '#f87171'
    };
    return colors[action] || '#0b60d1';
  },

  // Obtener etiqueta de acción
  getActionLabel(action) {
    const labels = {
      'CREATE': '✅ CREAR',
      'UPDATE': '✏️ ACTUALIZAR',
      'DELETE': '🗑️ ELIMINAR'
    };
    return labels[action] || action;
  }
};

// Inicializado por core.js cuando todos los datos estén listos
