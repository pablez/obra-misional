// ==================== COMPONENTE: LOADER/ANIMACIÓN DE CARGA ====================

const LoaderComponent = {
  // Mostrar loader
  show() {
    let loader = document.getElementById('appLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'appLoader';
      loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #f8fbff 0%, #e0eeff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        flex-direction: column;
        gap: 20px;
      `;

      loader.innerHTML = `
        <div style="text-align: center;">
          <div style="
            width: 60px;
            height: 60px;
            border: 4px solid #dbeafe;
            border-top: 4px solid #0b60d1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          "></div>
          <p style="
            margin: 20px 0 0;
            color: #0b60d1;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
          ">Cargando datos...</p>
          <p style="
            margin: 8px 0 0;
            color: #64748b;
            font-size: 14px;
          ">Espera un momento</p>
        </div>

        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  },

  // Ocultar loader
  hide() {
    const loader = document.getElementById('appLoader');
    if (loader) {
      loader.style.display = 'none';
    }
  },

  // Eliminar loader completamente
  remove() {
    const loader = document.getElementById('appLoader');
    if (loader) {
      loader.remove();
    }
  },

  // Mostrar mensaje de progreso
  setMessage(message) {
    const loader = document.getElementById('appLoader');
    if (loader) {
      const p = loader.querySelector('p:last-of-type');
      if (p) p.textContent = message;
    }
  }
};
