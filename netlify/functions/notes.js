// Función eliminada: creación de recordatorios deshabilitada
// Este archivo ha sido vaciado porque la funcionalidad de notas fue removida

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
      // Obtener notas de Hoja 3
      const range = 'Hoja 3!A1:F1000';
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
    }

    if (event.httpMethod === 'POST') {
      // Agregar nota a Hoja 3
      const body = JSON.parse(event.body);
      const { fecha, tipo, nota, relacionadoA, prioridad } = body;

      const values = [[fecha, tipo, nota, relacionadoA, prioridad, 'No']];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Hoja 3!A:F',
        valueInputOption: 'RAW',
        requestBody: { values }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Nota agregada' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  } catch (err) {
    console.error('Error en /notes:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
