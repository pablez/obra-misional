// ==================== COMPONENTE: DASHBOARD DE ESTADÍSTICAS ====================

const DashboardComponent = {
  // Inicializar dashboard
  init() {
    this.setupEventListeners();
  },

  // Configurar event listeners
  setupEventListeners() {
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (dashboardBtn) {
      dashboardBtn.addEventListener('click', () => this.render());
    }
  },

  // Renderizar dashboard
  render() {
    const $container = document.getElementById('dashboard');
    if (!$container) return;

    const totalReports = reports.length;
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.Estado === 'Completada').length;
    const pendingInterviews = interviews.filter(i => i.Estado === 'Pendiente').length;
    const urgentNotes = notes.filter(n => n.prioridad === 'URGENTE').length;
    const totalNotes = notes.length;
    const activeMissionaries = missionaries.filter(m => m.Estado === 'Activo').length;
    const totalMissionaries = missionaries.length;

    $container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
        <div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);padding:20px;border-radius:12px;border-left:4px solid #0b60d1;">
          <div style="font-size:0.9rem;color:#064e3b;font-weight:600;">REPORTES</div>
          <div style="font-size:2rem;font-weight:700;color:#0b60d1;margin:8px 0;">${totalReports}</div>
        </div>

        <div style="background:linear-gradient(135deg,#fecaca,#fca5a5);padding:20px;border-radius:12px;border-left:4px solid #dc2626;">
          <div style="font-size:0.9rem;color:#7c2d12;font-weight:600;">ENTREVISTAS</div>
          <div style="font-size:2rem;font-weight:700;color:#dc2626;margin:8px 0;">${totalInterviews}</div>
          <div style="font-size:0.85rem;color:#7c2d12;margin-top:8px;">✓ ${completedInterviews} completadas | ⏳ ${pendingInterviews} pendientes</div>
        </div>

        <div style="background:linear-gradient(135deg,#fed7aa,#fdba74);padding:20px;border-radius:12px;border-left:4px solid #ea580c;">
          <div style="font-size:0.9rem;color:#7c2d12;font-weight:600;">NOTAS</div>
          <div style="font-size:2rem;font-weight:700;color:#ea580c;margin:8px 0;">${totalNotes}</div>
          <div style="font-size:0.85rem;color:#7c2d12;margin-top:8px;">🔴 ${urgentNotes} urgentes</div>
        </div>

        <div style="background:linear-gradient(135deg,#dcfce7,#bbf7d0);padding:20px;border-radius:12px;border-left:4px solid #16a34a;">
          <div style="font-size:0.9rem;color:#15803d;font-weight:600;">MISIONEROS</div>
          <div style="font-size:2rem;font-weight:700;color:#16a34a;margin:8px 0;">${totalMissionaries}</div>
          <div style="font-size:0.85rem;color:#15803d;margin-top:8px;">✓ ${activeMissionaries} activos</div>
        </div>
      </div>

      <div style="background:var(--card);border:2px solid #dbeafe;padding:20px;border-radius:12px;">
        <h3 style="margin:0 0 16px;color:var(--accent-dark);">📊 Gráfico de Entrevistas</h3>
        <canvas id="interviewChart" style="max-height:300px;"></canvas>
      </div>
    `;

    // Dibujar gráfico
    this.drawChart();
  },

  // Dibujar gráfico
  drawChart() {
    const canvas = document.getElementById('interviewChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const states = ['Pendiente', 'Completada', 'Cancelada'];
    const counts = states.map(s => interviews.filter(i => i.Estado === s).length);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: states,
        datasets: [{
          data: counts,
          backgroundColor: ['#fbbf24', '#4ade80', '#f87171'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
};

// Inicializado por core.js cuando todos los datos estén listos
