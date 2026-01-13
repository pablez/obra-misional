# Reportes — La Chimba

Pequeña página responsiva para presentar enlaces a documentos de Google Drive (servir como vitrina de reportes).

Uso rápido

- Abrir `index.html` en un navegador. Para evitar restricciones de CORS al usar `fetch`, es recomendable servir con un servidor HTTP simple.

Comandos para servir localmente:

Windows (PowerShell):

```powershell
python -m http.server 5500
```

Luego abrir http://localhost:5500 en el navegador.

Cómo añadir reportes

- Edita `script.js` y agrega objetos al array `reports` con las propiedades: `title`, `description`, `date`, `link`.

Notas

- Esta página sólo muestra enlaces; la gestión de permisos en Google Drive debe configurarse en Drive para que otros puedan abrir los documentos.
- Puedo extenderla para cargar los enlaces desde un archivo JSON externo o desde Google Sheets si lo deseas.
 
## Agregar el logo

- Coloca el archivo de imagen del logo en la raíz del proyecto con el nombre `logo.png`.
- Tamaño recomendado: 200x200 px (se ajustará a 56x56 px en el header). Usa PNG con fondo transparente si es posible.
- Si prefieres usar una URL pública para el logo, edita `index.html` cambiando `src="logo.png"` por la URL.

Nota: He añadido un `logo.svg` placeholder en la carpeta del proyecto y actualicé `index.html` para usarlo. Si quieres que use exactamente la imagen que subiste (PNG), puedes subirla con el nombre `logo.png` en esta carpeta o indicarme que la guarde por ti y la nombro `logo.png`.

## Backend opcional: usar Google Sheets privado (cuenta de servicio)

He añadido un servidor Express (`server.js`) que puede leer hojas de cálculo privadas usando una cuenta de servicio y exponer endpoints JSON.

Pasos para usarlo:

- Coloca tu archivo de credenciales de cuenta de servicio (JSON) en la raíz del proyecto. Nombre sugerido: `reportes-484212-42020a60e8a9.json`.
- Asegúrate de compartir la Google Sheet con el `client_email` que aparece en el JSON (por ejemplo: `obra-misional@reportes-484212.iam.gserviceaccount.com`) con permiso de lectura.
- Añade el ID de la hoja de cálculo al entorno o en `server.js` (variable `SHEET_ID`). El ID es la parte entre `/d/` y `/edit` en la URL de la hoja.

Ejecutar servidor (instala dependencias primero si no lo hiciste):

```powershell
npm install
setx SHEET_ID "TU_SHEET_ID_AQUI"  # (opcional) o exporta en PowerShell
npm start
```

Endpoints disponibles:

- `GET /datos` — devuelve la primera hoja como JSON.
- `GET /sheet?name=reports` — devuelve la hoja con título `reports` como JSON.

Notas de seguridad:

- El archivo de credenciales contiene claves privadas: no lo subas a repositorios públicos.
- Si prefieres no poner el JSON en la raíz, usa variables de entorno u otro método seguro.

