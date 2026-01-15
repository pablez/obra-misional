# 📊 Reportes - La Chimba

Aplicación web para gestión de reportes misioneros usando Google Sheets como base de datos, desplegada en Netlify con arquitectura serverless.

## 🏗️ Arquitectura

```
📁 Proyecto/
├── 📁 public/              # Frontend estático (servido por CDN)
│   ├── index.html          # Interfaz principal
│   ├── script.js           # Lógica del cliente
│   ├── styles.css          # Estilos
│   └── 📁 images/          # Recursos gráficos
│
├── 📁 netlify/functions/   # Backend serverless
│   ├── datos.js            # GET /datos - Primera hoja
│   ├── sheet.js            # GET /sheet?name=X - Hoja específica
│   ├── append.js           # POST /sheet/append - Agregar fila
│   ├── update.js           # PUT /sheet/update - Actualizar fila
│   └── clear.js            # POST /sheet/clear - Limpiar rango
│
├── netlify.toml            # Configuración de Netlify
├── package.json            # Dependencias
├── .env.example            # Template de variables
└── DEPLOY.md               # Guía de despliegue
```

## ✨ Características

- ✅ **Serverless** - Sin servidor que mantener
- ✅ **CDN Global** - Contenido servido desde edge locations
- ✅ **Google Sheets API** - Base de datos en tiempo real
- ✅ **Responsive** - Funciona en móviles y desktop
- ✅ **CRUD Completo** - Crear, leer, actualizar reportes
- ✅ **Despliegue Continuo** - Auto-deploy desde Git

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

### Despliegue a Producción

Consulta [DEPLOY.md](DEPLOY.md) para instrucciones completas de despliegue en Netlify.

## 🔧 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Netlify Functions (Node.js)
- **Base de datos**: Google Sheets API
- **Hosting**: Netlify (JAMstack)
- **APIs**: googleapis ^170.0.0

## 📝 Configuración

### Variables de Entorno Requeridas

```env
SHEET_ID=tu_google_spreadsheet_id
GOOGLE_CLIENT_EMAIL=service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Estructura de Google Sheets

#### Hoja 1: Reportes
| id | title | description | date | link | name | role |
|----|-------|-------------|------|------|------|------|

#### Hoja 2: Entrevistas
| id | nombre | fecha | hora | lugar | notas | estado |
|----|--------|-------|------|-------|-------|--------|

## 📚 Documentación

- [Guía de Despliegue](DEPLOY.md) - Instrucciones paso a paso
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Google Sheets API](https://developers.google.com/sheets/api)

## 🔐 Seguridad

- ✅ Credenciales en variables de entorno
- ✅ `.gitignore` configurado para archivos sensibles
- ✅ CORS configurado en functions
- ✅ Headers de seguridad en Netlify

## 📄 Licencia

ISC

---

**Versión**: 2.0.0 (Arquitectura Netlify)

npm start
```

Endpoints disponibles:

- `GET /datos` — devuelve la primera hoja como JSON.
- `GET /sheet?name=reports` — devuelve la hoja con título `reports` como JSON.

Notas de seguridad:

- El archivo de credenciales contiene claves privadas: no lo subas a repositorios públicos.
- Si prefieres no poner el JSON en la raíz, usa variables de entorno u otro método seguro.

