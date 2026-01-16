// ==================== APP CORE - ORQUESTADOR PRINCIPAL ====================

/**
 * AppCore es el punto de entrada principal de la aplicación
 * Maneja la inicialización, la carga de datos y la coordinación entre componentes
 */

const AppCore = {
  // Estado de la aplicación
  state: {
    isLoading: false,
    isInitialized: false,
    dataReady: false
  },

  // Inicializar aplicación
  async init() {
    if (this.state.isInitialized) return;

    try {
      // 1. Mostrar loader
      this.showLoader('Iniciando aplicación...');

      // 2. Esperar a que el DOM esté completamente listo
      await this.waitForDOM();

      // 3. Cargar datos principales
      this.showLoader('Cargando datos del servidor...');
      await this.loadData();

      // 4. Inicializar componentes
      this.showLoader('Preparando interfaz...');
      this.initializeComponents();

      // 5. Pequeña pausa para UX
      await this.delay(300);

      // 6. Ocultar loader y mostrar aplicación
      this.hideLoader();

      // Marcar como inicializado
      this.state.isInitialized = true;
      this.state.dataReady = true;

      console.log('✅ Aplicación inicializada correctamente');

    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
      console.error('Stack:', error.stack);
      this.hideLoader();
      // Mostrar error más detallado en la UI
      this.showDetailedError(error);
    }
  },

  // Esperar a que el DOM esté listo
  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  },

  // Cargar todos los datos
  async loadData() {
    try {
      // Verificar que la función existe
      if (typeof loadDataFromBackend !== 'function') {
        throw new Error('loadDataFromBackend() no está definida en script.js');
      }
      // Llamar a la función existente en script.js
      await loadDataFromBackend();
    } catch (error) {
      console.error('Error cargando datos:', error);
      throw error;
    }
  },

  // Inicializar componentes
  initializeComponents() {
    // Los componentes se auto-inicializan en su DOMContentLoaded
    // Pero aquí podemos hacer coordinación adicional si es necesario

    // Inicializar dashboard
    if (typeof DashboardComponent !== 'undefined') {
      DashboardComponent.init();
      console.log('✓ Dashboard inicializado');
    }

    // Inicializar auditoría
    if (typeof AuditComponent !== 'undefined') {
      AuditComponent.init();
      console.log('✓ Auditoría inicializada');
    }

    // Inicializar alertas
    if (typeof AlertsComponent !== 'undefined') {
      AlertsComponent.init();
      console.log('✓ Alertas inicializadas');
    }

    // Inicializar plantillas
    if (typeof TemplatesComponent !== 'undefined') {
      TemplatesComponent.init();
      console.log('✓ Plantillas inicializadas');
    }

    // Inicializar misioneros
    if (typeof MissionariesComponent !== 'undefined') {
      MissionariesComponent.init();
      console.log('✓ Misioneros inicializados');
    }
  },

  // Mostrar loader
  showLoader(message = 'Cargando...') {
    if (typeof LoaderComponent !== 'undefined') {
      LoaderComponent.show();
      if (message) {
        LoaderComponent.setMessage(message);
      }
      this.state.isLoading = true;
    }
  },

  // Ocultar loader
  hideLoader() {
    if (typeof LoaderComponent !== 'undefined') {
      LoaderComponent.hide();
      this.state.isLoading = false;
    }
  },

  // Mostrar error
  showError(message) {
    alert(`Error: ${message}`);
  },

  // Mostrar error detallado
  showDetailedError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    content.innerHTML = `
      <h2 style="margin-top: 0; color: #dc2626;">❌ Error de Inicialización</h2>
      <p style="color: #666; margin: 16px 0;">Ha ocurrido un error al cargar la aplicación:</p>
      
      <div style="
        background: #fee2e2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
        font-family: monospace;
        font-size: 12px;
        color: #991b1b;
        white-space: pre-wrap;
        word-break: break-word;
      ">${error.message || error.toString()}</div>

      <div style="
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 12px;
        margin: 16px 0;
        font-family: monospace;
        font-size: 11px;
        max-height: 200px;
        overflow-y: auto;
      "><strong>Stack:</strong><br>${error.stack || 'No disponible'}</div>

      <p style="color: #666; font-size: 14px; margin: 16px 0;">
        <strong>Soluciones:</strong>
        <ul>
          <li>Abre DevTools (F12) → Console para ver más detalles</li>
          <li>Verifica que Google Sheets API esté configurada</li>
          <li>Intenta recargar la página</li>
          <li>Comprueba la conexión a internet</li>
        </ul>
      </p>

      <button onclick="location.reload()" style="
        background: #0b60d1;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        width: 100%;
      ">🔄 Recargar Página</button>
    `;

    errorDiv.appendChild(content);
    document.body.appendChild(errorDiv);
  },

  // Delay para promesas
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Recargar datos
  async reload() {
    this.showLoader('Refresco de datos...');
    try {
      await loadDataFromBackend();
      this.hideLoader();
      console.log('✓ Datos recargados');
    } catch (error) {
      console.error('Error recargando datos:', error);
      this.hideLoader();
      this.showError('Error al recargar los datos');
    }
  },

  // Obtener estado de la aplicación
  getState() {
    return { ...this.state };
  }
};

// Inicializar cuando el script cargue
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AppCore.init();
  });
} else {
  AppCore.init();
}
