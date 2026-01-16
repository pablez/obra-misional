# 🎯 GUÍA DE ARQUITECTURA MODULAR V2

## ¿Qué Cambió?

Se refactorizó la arquitectura de `script.js` (2239 líneas gigante) a una **arquitectura modular basada en componentes**.

### Antes ❌
- Un archivo `script.js` con todo
- Difícil de mantener y escalar
- Duro de testear

### Ahora ✅
- 7 componentes especializados
- Cada componente una responsabilidad clara
- Fácil de mantener, escalar y testear

---

## 📁 Estructura de Carpetas

```
components/
├── core.js              (🟢 ORQUESTADOR - Inicia todo)
├── loader.js            (Spinner de carga)
├── dashboard.js         (KPIs y gráficos)
├── audit.js             (Historial de cambios)
├── alerts.js            (Notificaciones)
├── templates.js         (Plantillas de notas)
└── missionaries.js      (Gestión de misioneros)
```

---

## 🔄 Orden de Inicialización

### 1️⃣ Página carga HTML

```html
<script src="script.js"></script>                    <!-- Datos globales -->
<script src="components/loader.js"></script>         <!-- Loader UI -->
<script src="components/dashboard.js"></script>      <!-- Dashboard -->
<script src="components/audit.js"></script>          <!-- Auditoría -->
<script src="components/alerts.js"></script>         <!-- Alertas -->
<script src="components/templates.js"></script>      <!-- Plantillas -->
<script src="components/missionaries.js"></script>   <!-- Misioneros -->
<script src="components/core.js"></script>           <!-- 🚀 INICIA AQUÍ -->
```

### 2️⃣ core.js se ejecuta

```javascript
AppCore.init()
  ├─ LoaderComponent.show()
  ├─ loadDataFromBackend()  (desde script.js)
  ├─ LoaderComponent.setMessage("Cargando...")
  ├─ AppCore.initializeComponents()
  │  ├─ DashboardComponent.init()
  │  ├─ AuditComponent.init()
  │  ├─ AlertsComponent.init()
  │  ├─ TemplatesComponent.init()
  │  └─ MissionariesComponent.init()
  └─ LoaderComponent.hide()
```

### 3️⃣ Aplicación lista

- Usuario ve spinner mientras se cargan datos
- Cuando termina, aparece la UI completa
- Componentes responden a interacciones

---

## 🎛️ Componentes Explicados

### 🟢 **core.js** - AppCore (Orquestador)
**Responsabilidad:** Inicializar y coordinar todo

```javascript
// Métodos principales
AppCore.init()              // Inicia la app
AppCore.loadData()          // Carga datos
AppCore.initializeComponents() // Inicia componentes
AppCore.reload()            // Recarga datos manualmente
```

**¿Cuándo se usa?**
- Cuando la página carga
- Cuando el usuario hace clic en "Actualizar"

---

### 🔄 **loader.js** - LoaderComponent (Carga)
**Responsabilidad:** Mostrar animación while cargan datos

```javascript
// Métodos
LoaderComponent.show()           // Mostrar spinner
LoaderComponent.hide()           // Ocultar spinner
LoaderComponent.setMessage(msg)  // Cambiar mensaje
```

**¿Cuándo se usa?**
- Al inicio de la app (AppCore)
- Cuando se recargan datos

---

### 📊 **dashboard.js** - DashboardComponent
**Responsabilidad:** Mostrar KPIs y gráficos

```javascript
DashboardComponent.init()   // Configurar botón
DashboardComponent.render() // Dibujar dashboard
DashboardComponent.drawChart() // Gráfico entrevistas
```

**Datos que usa:**
- `reports.length`
- `interviews` (by state)
- `notes` (by priority)
- `missionaries` (by status)

---

### 📋 **audit.js** - AuditComponent
**Responsabilidad:** Mostrar historial de auditoría

```javascript
AuditComponent.init()          // Setup
AuditComponent.showModal()     // Mostrar modal
AuditComponent.renderAuditLog() // Llenar datos
```

**Datos que usa:**
- `auditLog[]` (from script.js)

---

### 🔔 **alerts.js** - AlertsComponent
**Responsabilidad:** Notificaciones en tiempo real

```javascript
AlertsComponent.init()        // Setup y verificación automática
AlertsComponent.getAlerts()   // Obtener alertas pendientes
AlertsComponent.showAlertsModal() // Mostrar modal
```

**Alertas que genera:**
- Entrevistas urgentes
- Entrevistas para hoy
- Notas urgentes

**Actualización:** Cada 5 minutos automático

---

### ⭐ **templates.js** - TemplatesComponent
**Responsabilidad:** Gestión de plantillas de notas

```javascript
TemplatesComponent.init()              // Setup
TemplatesComponent.showNewTemplateModal() // Crear
TemplatesComponent.showTemplatesModal()   // Ver todas
```

**Endpoints que usa:**
- `GET /templates` (cargar)
- `POST /templates` (crear)

---

### 👥 **missionaries.js** - MissionariesComponent
**Responsabilidad:** Gestión de misioneros

```javascript
MissionariesComponent.init()           // Setup
MissionariesComponent.showNewMissionaryModal() // Crear
MissionariesComponent.filterByStatus() // Filtrar
MissionariesComponent.searchMissionaries() // Buscar
MissionariesComponent.exportToExcel()  // Exportar
```

**Endpoints que usa:**
- `GET /missionaries` (listar)
- `POST /missionaries` (crear)
- `PUT /missionaries` (editar)
- `DELETE /missionaries` (eliminar)

---

## 🧠 script.js - Funciones Principales

script.js sigue siendo el **núcleo** con lógica compartida:

### Datos Globales
```javascript
const reports = [];        // Hoja 1
const interviews = [];     // Hoja 2
const notes = [];          // Hoja 3
const auditLog = [];       // Hoja 4
const templates = [];      // Hoja 5
const missionaries = [];   // Hoja 6
```

### Funciones de Carga
```javascript
loadDataFromBackend()  // Carga principal
loadNotes()
loadAuditLog()
loadTemplates()
loadMissionaries()
```

### Funciones de Renderizado
```javascript
render(reports)
renderInterviews(interviews, date)
renderCalendar(year, month)
renderTemplates(list)
renderMissionaries(list)
renderDashboard()
```

### Funciones de Lógica
```javascript
saveNote(note)
useTemplate(templateId)
duplicateNote(noteId)
saveMissionary(...)
updateMissionary(...)
deleteMissionary(...)
logAudit(action, entity, id, details)
```

---

## 🔗 Flujo de Datos

```
Google Sheets (API)
    ↓
netlify/functions/* (Backend)
    ↓
script.js (loadDataFromBackend)
    ↓
Global Arrays (reports[], interviews[], etc.)
    ↓
Componentes (leen datos, los usan)
    ├── DashboardComponent → muestra stats
    ├── AuditComponent → muestra historial
    ├── AlertsComponent → verifica alertas
    ├── TemplatesComponent → gestiona plantillas
    └── MissionariesComponent → gestiona misioneros
    ↓
UI actualizada
```

---

## ⚡ Ventajas

| Característica | Antes | Ahora |
|---|---|---|
| **Tamaño script.js** | 2239 líneas | ~1600 líneas |
| **Componentes** | 0 | 7 |
| **Mantenibilidad** | Difícil | Fácil |
| **Testing** | No | Sí (aislado) |
| **UX Carga** | Sin feedback | Loader animado |
| **Escalabilidad** | Limitada | Excelente |

---

## 🚀 Cómo Agregar un Nuevo Componente

### 1. Crear archivo en `public/components/feature.js`

```javascript
const FeatureComponent = {
  init() {
    console.log('Feature initialized');
    // Setup event listeners
    document.getElementById('featureBtn')?.addEventListener('click', () => {
      this.render();
    });
  },

  render() {
    // Renderizar UI
    console.log('Feature rendered');
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  FeatureComponent.init();
});
```

### 2. Importar en `index.html`

```html
<script src="components/feature.js"></script>
<!-- ANTES de components/core.js -->
```

### 3. Llamar desde `AppCore.initializeComponents()`

```javascript
// En core.js, agregar:
if (typeof FeatureComponent !== 'undefined') {
  FeatureComponent.init();
  console.log('✓ Feature inicializado');
}
```

### 4. ✅ Listo!

El componente se inicializará automáticamente cuando cargue la página.

---

## 📊 Monitoreo de Rendimiento

```javascript
// En la consola:
console.log(AppCore.getState());

// Retorna:
{
  isLoading: false,
  isInitialized: true,
  dataReady: true
}
```

---

## 🐛 Debugging

### Ver logs de inicialización
```javascript
// Abre DevTools → Console
// Verás mensajes como:
// ✅ Dashboard inicializado
// ✓ Auditoría inicializada
// ✓ Alertas inicializadas
```

### Recargar datos manualmente
```javascript
AppCore.reload();
```

### Ver estado de componente
```javascript
console.log('Reportes:', reports);
console.log('Entrevistas:', interviews);
console.log('Notas:', notes);
```

---

## 📝 Resumen

| Archivo | Líneas | Responsabilidad |
|---------|--------|-----------------|
| script.js | ~1600 | Lógica core + datos |
| core.js | ~200 | Orquestación |
| loader.js | ~60 | Carga UI |
| dashboard.js | ~150 | Estadísticas |
| audit.js | ~150 | Historial |
| alerts.js | ~200 | Notificaciones |
| templates.js | ~180 | Plantillas |
| missionaries.js | ~180 | Misioneros |

**Total:** ~2700 líneas (bien organizadas vs 2239 sin organizar)

---

## 🎯 Próximos Pasos

- [ ] Optimizar componentes no críticos (lazy loading)
- [ ] Agregar tests unitarios
- [ ] Documentar cada función con JSDoc
- [ ] Implementar caché con localStorage
- [ ] Convertir a PWA
- [ ] Agregar temas oscuro/claro por componente
