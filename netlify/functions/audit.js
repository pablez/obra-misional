const { google } = require('googleapis');

async function getAuthorizedClient() {
  const SHEET_ID = process.env.SHEET_ID;
  if (!SHEET_ID) {
    throw new Error('SHEET_ID no está configurado en las variables de entorno');
  }

  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly'
    ]
  });

  await auth.authorize();
  return { auth, SHEET_ID };
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { auth, SHEET_ID } = await getAuthorizedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    if (event.httpMethod === 'GET') {
      // Obtener historial de auditoría de Hoja 4
      try {
        const range = "'Hoja 4'!A1:F1000";
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

        const headers_row = values[0];
        const headersList = headers_row.map(h => String(h).trim());
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
        // Si la hoja no existe, retornar array vacío
        if (err.code === 400 || err.status === 400) {
          console.log('Hoja 4 no existe aún, retornando array vacío');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify([])
          };
        }
        throw err;
      }
    }

    if (event.httpMethod === 'POST') {
      // Agregar entrada de auditoría a Hoja 4
      const body = JSON.parse(event.body);
      const { timestamp, action, entity, entityId, details } = body;

      const now = new Date();
      const dateTime = now.toISOString();
      
      const values = [[
        dateTime,
        action,
        entity,
        entityId || '',
        details || '',
        'Sistema'
      ]];

      try {
        // Intentar agregar a la hoja existente
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "'Hoja 4'!A:F",
          valueInputOption: 'RAW',
          requestBody: { values }
        });
      } catch (err) {
        // Si la hoja no existe, crearla primero
        if (err.code === 400 || err.status === 400) {
          console.log('Creando Hoja 4...');
          
          // Crear la hoja
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: 'Hoja 4'
                    }
                  }
                }
              ]
            }
          });

          // Agregar header
          const headers = [['Timestamp', 'Acción', 'Entidad', 'ID', 'Detalles', 'Usuario']];
          await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "'Hoja 4'!A:F",
            valueInputOption: 'RAW',
            requestBody: { values: headers }
          });

          // Agregar el dato
          await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "'Hoja 4'!A:F",
            valueInputOption: 'RAW',
            requestBody: { values }
          });

          console.log('Hoja 4 creada y dato agregado');
        } else {
          throw err;
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Entrada de auditoría agregada' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  } catch (err) {
    console.error('Error en /audit:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
