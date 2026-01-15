# 🚀 Guía de Despliegue en Netlify

Esta guía te ayudará a desplegar tu aplicación de reportes en Netlify usando la arquitectura serverless.

## 📋 Pre-requisitos

1. **Cuenta de Netlify** - Crea una cuenta gratuita en [netlify.com](https://www.netlify.com)
2. **Cuenta de servicio de Google** - Para acceder a Google Sheets API
3. **Git instalado** - Para sincronizar tu código

## 🔑 Paso 1: Configurar Google Service Account

### 1.1 Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las APIs necesarias:
   - Google Sheets API
   - Google Drive API

### 1.2 Crear cuenta de servicio

1. En el menú lateral: **IAM y administración** → **Cuentas de servicio**
2. Click en **Crear cuenta de servicio**
3. Completa el formulario:
   - Nombre: `reportes-netlify`
   - Descripción: `Cuenta de servicio para acceder a Google Sheets`
4. Click en **Crear y continuar**
5. Click en **Listo**

### 1.3 Generar credenciales JSON

1. Click en la cuenta de servicio recién creada
2. Ve a la pestaña **Claves**
3. Click en **Agregar clave** → **Crear clave nueva**
4. Selecciona formato **JSON**
5. Se descargará un archivo JSON con las credenciales

### 1.4 Compartir Google Sheets

1. Abre tu Google Spreadsheet
2. Click en **Compartir**
3. Agrega el email de la cuenta de servicio (está en el JSON: `client_email`)
4. Dale permisos de **Editor**
5. Copia el ID del spreadsheet (está en la URL entre `/d/` y `/edit`)

## 📦 Paso 2: Preparar el Proyecto

### 2.1 Instalar dependencias

```bash
npm install
```

### 2.2 Instalar Netlify CLI (opcional, para desarrollo local)

```bash
npm install -g netlify-cli
```

### 2.3 Probar localmente

```bash
# Configurar variables de entorno locales
cp .env.example .env

# Editar .env con tus credenciales
# SHEET_ID=tu_id_de_spreadsheet
# GOOGLE_CLIENT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Ejecutar en modo desarrollo
netlify dev
```

## 🌐 Paso 3: Desplegar en Netlify

### Opción A: Despliegue desde GitHub (Recomendado)

#### 3.1 Subir código a GitHub

```bash
git init
git add .
git commit -m "Migración a arquitectura Netlify Functions"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

#### 3.2 Conectar con Netlify

1. Inicia sesión en [Netlify](https://app.netlify.com)
2. Click en **Add new site** → **Import an existing project**
3. Selecciona **GitHub** y autoriza
4. Selecciona tu repositorio
5. Configuración de build:
   - **Build command**: `npm run build` (o deja vacío)
   - **Publish directory**: `public`
   - Click en **Show advanced** → **New variable**

#### 3.3 Configurar variables de entorno

En la configuración avanzada, agrega estas variables:

| Variable | Valor |
|----------|-------|
| `SHEET_ID` | El ID de tu Google Spreadsheet |
| `GOOGLE_CLIENT_EMAIL` | El email de la cuenta de servicio (del JSON) |
| `GOOGLE_PRIVATE_KEY` | La clave privada COMPLETA (del JSON, campo `private_key`) |

⚠️ **IMPORTANTE para `GOOGLE_PRIVATE_KEY`**:
- Copia el valor COMPLETO incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Los `\n` deben mantenerse como `\n` literales
- Ejemplo: `"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"`

#### 3.4 Desplegar

Click en **Deploy site** y espera a que termine el proceso (2-3 minutos).

### Opción B: Despliegue Manual (CLI)

```bash
# Autenticar con Netlify
netlify login

# Inicializar sitio
netlify init

# Desplegar
netlify deploy --prod
```

## ✅ Paso 4: Verificar el Despliegue

1. Netlify te dará una URL única: `https://tu-sitio.netlify.app`
2. Abre la URL en tu navegador
3. Verifica que:
   - ✅ La página carga correctamente
   - ✅ Los reportes se muestran desde Google Sheets
   - ✅ Puedes agregar nuevos reportes
   - ✅ Las imágenes se cargan

## 🔧 Paso 5: Configuración Adicional (Opcional)

### Dominio personalizado

1. En Netlify: **Site settings** → **Domain management**
2. Click en **Add custom domain**
3. Sigue las instrucciones para configurar DNS

### Variables de entorno adicionales

Puedes agregar más variables en: **Site settings** → **Environment variables**

## 🐛 Solución de Problemas

### Error: "SHEET_ID no está configurado"

- Verifica que configuraste las variables de entorno en Netlify
- Redespliega el sitio después de agregar las variables

### Error: "Error de autenticación con Google"

- Verifica que `GOOGLE_CLIENT_EMAIL` y `GOOGLE_PRIVATE_KEY` están correctos
- Asegúrate de que la cuenta de servicio tiene acceso al spreadsheet
- Verifica que la clave privada incluye `\n` como caracteres literales

### Error: "No se encontraron hojas"

- Verifica que el `SHEET_ID` es correcto
- Confirma que la cuenta de servicio tiene permisos de Editor

### Las functions no responden

- Ve a **Functions** en el dashboard de Netlify
- Revisa los logs para ver errores específicos
- Verifica que las rutas en [netlify.toml](netlify.toml) están correctas

## 📊 Monitoreo

### Ver logs de las functions

1. Dashboard de Netlify → **Functions**
2. Click en una function para ver sus logs
3. Los errores aparecerán aquí en tiempo real

### Analytics

Netlify ofrece analytics básicos gratis:
- Visitas
- Requests a functions
- Errores

## 🔄 Actualizaciones Continuas

Cada vez que hagas `git push` a la rama principal:
1. Netlify detectará el cambio automáticamente
2. Ejecutará el build
3. Desplegará la nueva versión
4. Tu sitio se actualizará en ~2 minutos

## 📚 Recursos Adicionales

- [Documentación de Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Netlify CLI Docs](https://docs.netlify.com/cli/get-started/)

## 🎉 ¡Listo!

Tu aplicación ahora está en producción con:
- ✅ Arquitectura serverless
- ✅ CDN global
- ✅ HTTPS automático
- ✅ Despliegues continuos
- ✅ Escalabilidad automática

---

**Contacto**: Si tienes problemas, revisa los logs en Netlify o consulta la documentación oficial.
