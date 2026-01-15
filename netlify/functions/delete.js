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
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { auth, SHEET_ID } = await getAuthorizedClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const body = JSON.parse(event.body);
    const { sheetName, rowIndex } = body;
    
    if (!sheetName || rowIndex === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'sheetName y rowIndex son requeridos' })
      };
    }

    // Obtener el ID de la hoja por nombre
    const sheetsMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });

    const sheetData = sheetsMetadata.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheetData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Hoja "${sheetName}" no encontrada` })
      };
    }

    const sheetId = sheetData.properties.sheetId;

    // Eliminar la fila
    const deleteRequest = {
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex - 1,
          endIndex: rowIndex
        }
      }
    };

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [deleteRequest]
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Fila eliminada exitosamente',
        data: response.data
      })
    };
  } catch (error) {
    console.error('Error eliminando fila:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
