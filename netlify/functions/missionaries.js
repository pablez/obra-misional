const { google } = require('googleapis');

async function getAuthorizedClient() {
  const SHEET_ID = process.env.SHEET_ID;
  if (!SHEET_ID) {
    throw new Error('SHEET_ID no está configurado');
  }

  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  await auth.authorize();
  return { auth, SHEET_ID };
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { auth, SHEET_ID } = await getAuthorizedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // GET: Obtener todos los misioneros
    if (event.httpMethod === 'GET') {
      try {
        const range = "'Hoja 6'!A1:G1000";
        const resp = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range
        });

        const values = resp.data.values || [];
        if (values.length === 0) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify([])
          };
        }

        const headersList = values[0].map(h => String(h).trim());
        const data = values.slice(1).map(row => {
          const obj = {};
          headersList.forEach((h, i) => {
            obj[h] = row[i] !== undefined ? row[i] : '';
          });
          return obj;
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (err) {
        if (err.code === 400 || err.status === 400) {
          console.log('Hoja 6 no existe aún');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify([])
          };
        }
        throw err;
      }
    }

    // POST: Agregar nuevo misionero
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { nombre, telefono, area, fechaInicio, estado, notas } = body;

      const now = Date.now();
      const values = [[
        now,
        nombre || '',
        telefono || '',
        area || '',
        fechaInicio || '',
        estado || 'Activo',
        notas || ''
      ]];

      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "'Hoja 6'!A:G",
          valueInputOption: 'RAW',
          requestBody: { values }
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, id: now })
        };
      } catch (err) {
        if (err.code === 400 || err.status === 400) {
          console.log('Creando Hoja 6...');
          
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: { title: 'Hoja 6' }
                }
              }]
            }
          });

          const headerRow = [['ID', 'Nombre', 'Teléfono', 'Área', 'Fecha Inicio', 'Estado', 'Notas']];
          await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "'Hoja 6'!A:G",
            valueInputOption: 'RAW',
            requestBody: { values: headerRow }
          });

          await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "'Hoja 6'!A:G",
            valueInputOption: 'RAW',
            requestBody: { values }
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, id: now })
          };
        }
        throw err;
      }
    }

    // PUT: Actualizar misionero (buscar por ID y reemplazar fila)
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body);
      const { id, nombre, telefono, area, fechaInicio, estado, notas } = body;

      try {
        const range = "'Hoja 6'!A1:G1000";
        const resp = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range
        });

        const values = resp.data.values || [];
        const rowIndex = values.findIndex(row => String(row[0]) === String(id));

        if (rowIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Misionero no encontrado' })
          };
        }

        const updateRange = `'Hoja 6'!A${rowIndex + 1}:G${rowIndex + 1}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: updateRange,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[id, nombre, telefono, area, fechaInicio, estado, notas]]
          }
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      } catch (err) {
        throw err;
      }
    }

    // DELETE: Eliminar misionero
    if (event.httpMethod === 'DELETE') {
      // Soportar varias formas de recibir el id:
      // 1) En la ruta: /missionaries/:id (netlify/dev puede exponer event.path)
      // 2) En querystring: /missionaries?id=123
      // 3) En el body JSON: { id: 123 }
      let id;
      try {
        // 1) Intentar extraer de la ruta (último segmento si no es el nombre de la función)
        if (event.path) {
          const parts = event.path.split('/').filter(Boolean);
          const last = parts[parts.length - 1];
          if (last && !last.toLowerCase().includes('missionaries') && !last.toLowerCase().includes('functions')) {
            id = last;
          }
        }

        // 2) Query string
        if (!id && event.queryStringParameters && event.queryStringParameters.id) {
          id = event.queryStringParameters.id;
        }

        // 3) Body JSON
        if (!id && event.body) {
          const parsed = JSON.parse(event.body);
          if (parsed && parsed.id) id = parsed.id;
        }
      } catch (e) {
        console.warn('No se pudo extraer id de la petición DELETE:', e.message);
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Falta id para eliminar. Enviar id en la ruta, query o body.' })
        };
      }

      try {
        const range = "'Hoja 6'!A1:G1000";
        const resp = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range
        });

        const values = resp.data.values || [];
        // Buscar coincidencia estricta con trim para evitar espacios
        const rowIndex = values.findIndex(row => String(row[0]).trim() === String(id).trim());

        if (rowIndex === -1) {
          // Responder con detalle útil para debugging
          const existingIds = values.map(r => String(r[0] || '').trim()).filter(Boolean).slice(0, 10);
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Misionero no encontrado', idSearched: id, sampleExistingIds: existingIds })
          };
        }

        await sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: `'Hoja 6'!A${rowIndex + 1}:G${rowIndex + 1}`
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      } catch (err) {
        throw err;
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  } catch (err) {
    console.error('Error en /missionaries:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
