// ==================== COMPONENTE: SISTEMA DE ALERTAS ====================

const AlertsComponent = {
  // Inicializar alertas
  init() {
    this.setupEventListeners();
    this.checkAlerts();
    // Verificar alertas cada 5 minutos
    setInterval(() => this.checkAlerts(), 300000);
  },

  // Configurar event listeners
  setupEventListeners() {
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
      notificationBell.addEventListener('click', () => this.showAlertsModal());
    }
  },

  // Verificar alertas pendientes
  checkAlerts() {
    const alerts = this.getAlerts();
    this.updateNotificationCounter(alerts.length);
  },

  // Obtener todas las alertas
  getAlerts() {
    const alerts = [];
    const today = this.getTodayDateStr();

    // Alertas de entrevistas urgentes
    const urgentInterviews = interviews.filter(i =>
      i.Prioridad === 'URGENTE' && i.Estado !== 'Completada'
    );

    urgentInterviews.forEach(i => {
      alerts.push({
        type: 'urgent',
        title: '🔴 Entrevista Urgente',
        message: `${i.Entrevistador} - ${i.Nombre}`,
        timestamp: i.Fecha
      });
    });

    // Alertas de entrevistas de hoy
    const todayInterviews = interviews.filter(i =>
      i.Fecha === today && i.Estado !== 'Completada'
    );

    todayInterviews.forEach(i => {
      alerts.push({
        type: 'today',
        title: '📅 Entrevista Hoy',
        message: `${i.Entrevistador} - ${i.Nombre}`,
        timestamp: i.Fecha
      });
    });

    // Alertas de notas urgentes
    const urgentNotes = notes.filter(n =>
      n.prioridad === 'URGENTE'
    );

    urgentNotes.forEach(n => {
      alerts.push({
        type: 'urgent',
        title: '🔴 Nota Urgente',
        message: n.nota.substring(0, 50) + '...',
        timestamp: n.fecha
      });
    });

    return alerts;
  },

  // Actualizar contador de notificaciones
  updateNotificationCounter(count) {
    const bell = document.querySelector('.notification-bell');
    if (!bell) {
      // Si no existe el contenedor de la campana, no hacemos más para evitar errores.
      return;
    }

    let counter = bell.querySelector('.notification-counter');
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'notification-counter';
      bell.appendChild(counter);
    }

    if (count > 0) {
      counter.textContent = count > 99 ? '99+' : count;
      counter.classList.remove('hidden');
    } else {
      counter.classList.add('hidden');
    }
  },

  // Mostrar modal de alertas
  showAlertsModal() {
    const alerts = this.getAlerts();

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
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-height: 500px;
      overflow-y: auto;
    `;

    if (alerts.length === 0) {
      content.innerHTML = `
        <h3 style="margin:0 0 16px;color:var(--accent-dark);">🔔 Alertas</h3>
        <p style="color:var(--muted);text-align:center;padding:20px;">No hay alertas pendientes</p>
      `;
    } else {
      content.innerHTML = `
        <h3 style="margin:0 0 16px;color:var(--accent-dark);">🔔 Alertas (${alerts.length})</h3>
        <div id="alertsList" style="display:flex;flex-direction:column;gap:12px;"></div>
      `;

      const alertsList = content.querySelector('#alertsList');
      alerts.forEach(alert => {
        const alertEl = document.createElement('div');
        alertEl.style.cssText = `
          background: ${this.getAlertBackground(alert.type)};
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid ${this.getAlertColor(alert.type)};
        `;
        alertEl.innerHTML = `
          <div style="font-weight:600;color:${this.getAlertColor(alert.type)};">${alert.title}</div>
          <div style="font-size:0.9rem;color:var(--muted);margin:4px 0;">${alert.message}</div>
          <div style="font-size:0.8rem;color:var(--muted);">${new Date(alert.timestamp).toLocaleString()}</div>
        `;
        alertsList.appendChild(alertEl);
      });
    }

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Cerrar al hacer click afuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  // Obtener color de alerta
  getAlertColor(type) {
    const colors = {
      'urgent': '#dc2626',
      'today': '#ea580c',
      'upcoming': '#fbbf24'
    };
    return colors[type] || '#0b60d1';
  },

  // Obtener fondo de alerta
  getAlertBackground(type) {
    const colors = {
      'urgent': '#fee2e2',
      'today': '#fed7aa',
      'upcoming': '#fef3c7'
    };
    return colors[type] || '#dbeafe';
  },

  // Obtener fecha de hoy en formato YYYY-MM-DD
  getTodayDateStr() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// Inicializado por core.js cuando todos los datos estén listos
