# 🧪 GUÍA DE PRUEBAS - Sistema de Alertas y Auditoría

## 📝 Cómo Probar Cada Función

### **Test 1: Crear Entrevista y Verificar Auditoría**

**Pasos:**
1. Abre la aplicación
2. Haz click en "➕ Nueva Entrevista"
3. Completa el formulario:
   - Nombre: "Test Persona"
   - Fecha: Hoy (15/01/2026)
   - Hora: 14:30
   - Entrevistador: Cualquiera
   - Estado: Pendiente
4. Click "Guardar"
5. Abre consola (F12 → Console)
6. Verifica que aparezca: `✓ Auditoría registrada: CREATE`
7. Click en "📋 Historial"
8. Deberías ver la entrada con ➕ CREATE

**Resultado esperado:** ✅ Entrada aparece en historial

---

### **Test 2: Actualizar Entrevista**

**Pasos:**
1. Encuentra la entrevista creada en el calendario
2. Click derecho → "Editar"
3. Cambia algo (ej: la hora a 15:00)
4. Click "Guardar"
5. Abre consola → Verifica: `✓ Auditoría registrada: UPDATE`
6. Click "📋 Historial"
7. Deberías ver una nueva entrada con ✏️ UPDATE

**Resultado esperado:** ✅ UPDATE registrado correctamente

---

### **Test 3: Eliminar Entrevista**

**Pasos:**
1. En el calendario, haz click en la entrevista que creaste
2. En el modal, click en "🗑️ Eliminar"
3. Confirma la acción
4. Abre consola → Verifica: `✓ Auditoría registrada: DELETE`
5. Click "📋 Historial"
6. Deberías ver entrada con 🗑️ DELETE

**Resultado esperado:** ✅ DELETE registrado con detalles

---

### **Test 4: Crear Recordatorio (Nota)**

**Pasos:**
1. Ve a la sección "Recordatorios"
2. Click "➕ Nuevo Recordatorio"
3. Completa:
   - Nota: "Test recordatorio importante"
   - Prioridad: URGENTE
   - Fecha: Hoy
4. Click "Guardar"
5. Abre consola → Verifica: `✓ Auditoría registrada: CREATE`
6. En "📋 Historial" deberías ver la entrada con Note

**Resultado esperado:** ✅ Nota creada y registrada

---

### **Test 5: Panel de Alertas**

**Pasos:**
1. Crea un recordatorio con prioridad URGENTE
2. Crea una entrevista para hoy (si no existe)
3. Recarga la página (F5)
4. Al cargar, debe aparecer un panel en la esquina inferior derecha

**Qué deberías ver:**
```
⚠️ Tienes X recordatorio(s) URGENTE(S)
📅 Entrevistas para hoy: X
⏰ Próximas 3 días: X
⏳ Tareas vencidas: X
```

5. El panel desaparece después de 8 segundos
6. Verifica que la campana 🔔 tenga un número

**Resultado esperado:** ✅ Alertas detectadas y mostradas

---

### **Test 6: Contador de Alertas**

**Pasos:**
1. Crea 1 recordatorio URGENTE
2. Mira el header en la esquina superior derecha
3. Deberías ver la campana 🔔 con un badge rojo con número

**Qué probar:**
- Crea más recordatorios URGENTES
- El número en el badge aumenta
- Crear recordatorio normal (baja prioridad) no aumenta el contador
- Solo recordatorios URGENTES se cuentan

**Resultado esperado:** ✅ Contador actualiza correctamente

---

### **Test 7: Ver Historial Completo**

**Pasos:**
1. Después de todas las pruebas anteriores
2. Click "📋 Historial"
3. Deberías ver un modal con:
   - Título: "📋 Historial de Auditoría"
   - Botón cerrar [✕]
   - Lista de cambios recientes (últimos 50)
   - Cada entrada con:
     - Icono (➕ ✏️ 🗑️)
     - Tipo de acción
     - Entidad afectada
     - ID
     - Timestamp
     - Detalles

**Verificar:**
- [x] Las entradas están en orden inverso (más recientes primero)
- [x] Los colores son correctos:
  - ➕ CREATE = Verde (#4caf50)
  - ✏️ UPDATE = Azul (#2196f3)
  - 🗑️ DELETE = Rojo (#f44336)
- [x] Los timestamps son correctos
- [x] Click [Cerrar] o click afuera cierra el modal

**Resultado esperado:** ✅ Historial se muestra correctamente

---

### **Test 8: Persistencia en Google Sheets**

**Pasos:**
1. Realiza varios cambios (crear, editar, eliminar)
2. Recarga la página (F5)
3. El array `auditLog` debe mantener los registros
4. (Opcional) Ve a Google Sheets → "Hoja 4"
5. Deberías ver columnas:
   - A: Timestamp (ISO format)
   - B: Action (CREATE, UPDATE, DELETE)
   - C: Entity (Interview, Note)
   - D: EntityId
   - E: Details

**Resultado esperado:** ✅ Datos persisten en Hoja 4

---

### **Test 9: Sin Errores de Consola**

**Pasos:**
1. Abre Herramientas de Desarrollador (F12)
2. Ve a la pestaña "Console"
3. Realiza todas las pruebas anteriores
4. Verifica que NO aparezcan errores rojos
5. Los warnings (amarillos) son normales

**Resultado esperado:** ✅ Sin errores críticos

---

### **Test 10: Interfaz Responsiva**

**Pasos:**
1. Redimensiona la ventana a móvil (375px)
2. El botón "📋 Historial" debe verse
3. El modal debe ser legible
4. El panel de alertas debe verse correctamente

**Resultado esperado:** ✅ Funciona en todos los tamaños

---

## 🎯 Checklist de Verificación Final

### ✅ Sistema de Auditoría
- [ ] CREATE registra correctamente
- [ ] UPDATE registra correctamente
- [ ] DELETE registra correctamente
- [ ] Botón "📋 Historial" funciona
- [ ] Modal muestra todos los registros
- [ ] Datos persisten en Hoja 4
- [ ] Sin errores en consola

### ✅ Sistema de Alertas
- [ ] Panel aparece al cargar página
- [ ] Detecta recordatorios URGENTES
- [ ] Detecta entrevistas hoy
- [ ] Contador en campana actualiza
- [ ] Panel se cierra después de 8 segundos
- [ ] Estilos aplicados correctamente

### ✅ Integración General
- [ ] Todas las funciones existentes siguen funcionando
- [ ] Sin conflictos entre sistemas
- [ ] Rendimiento aceptable
- [ ] Interfaz limpia y profesional

---

## 📞 Si Encuentras Problemas

### Problema: "Error al guardar auditoría"
**Solución:**
1. Verifica que `/audit` endpoint está configurado en netlify.toml
2. Comprueba que netlify/functions/audit.js existe
3. Revisa los logs de Netlify

### Problema: Histórico no se carga
**Solución:**
1. Abre F12 → Console
2. Escribe: `console.log(auditLog)`
3. Verifica que hay datos
4. Si está vacío: Verifica conexión a Google Sheets

### Problema: Panel de alertas no aparece
**Solución:**
1. Crea un recordatorio URGENTE
2. Recarga la página
3. Abre F12 → Console
4. Busca mensaje: "✓ Historial cargado"
5. Verifica que `checkAlerts()` retorna datos

### Problema: Modal no se abre
**Solución:**
1. Verifica que `auditHistoryBtn` elemento existe en HTML
2. Abre F12 → Console
3. Escribe: `showAuditHistory()`
4. Debería abrirse el modal

---

## 🔍 Comandos de Consola para Debugging

```javascript
// Ver todos los registros de auditoría
console.table(auditLog)

// Contar registros por tipo
auditLog.reduce((acc, e) => ({...acc, [e.action]: (acc[e.action] || 0) + 1}), {})

// Ver alertas detectadas
checkAlerts()

// Mostrar historial manual
showAuditHistory()

// Limpiar logs locales (CUIDADO)
auditLog.length = 0

// Cargar historial de servidor
loadAuditLog()
```

---

**Estado de pruebas:** 🟢 LISTO PARA PROBAR
**Última actualización:** 2026-01-15

