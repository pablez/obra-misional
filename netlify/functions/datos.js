const { google } = require('googleapis');

async function getAuthorizedClient() {
  const SHEET_ID = process.env.SHEET_ID;
  if (!SHEET_ID) {
    throw new Error('SHEET_ID no está configurado en las variables de entorno');
  }

  // Credenciales desde variables de entorno
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
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { auth, SHEET_ID } = await getAuthorizedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Obtener título de la primera hoja
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const firstSheet = meta.data.sheets?.[0]?.properties?.title;
    
    if (!firstSheet) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No se encontraron hojas en el documento' })
      };
    }

    const range = `${firstSheet}!A1:Z1000`;
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

    const rawHeaders = values[0];
    const headersList = rawHeaders.map(h => String(h).trim());
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
    console.error('Error en /datos:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
