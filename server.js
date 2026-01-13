const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');
const ExcelJS = require('exceljs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir archivos estáticos como index.html

// CONFIG -----------------------------------------------------------
// Cambia estos valores según tu proyecto / credenciales
const CREDS_FILE = './reportes.json'; // archivo de credenciales de cuenta de servicio
const SHEET_ID = process.env.SHEET_ID || ''; // pon aquí el ID de la hoja o exporta SHEET_ID en el entorno

if (!fs.existsSync(CREDS_FILE)) {
  console.warn(`Advertencia: no se encontró el archivo de credenciales ${CREDS_FILE}. Coloca tu JSON de cuenta de servicio en la raíz del proyecto.`);
}

async function getAuthorizedClient(){
  if(!SHEET_ID) throw new Error('SHEET_ID no está configurado. Exporta SHEET_ID o edita server.js');
  
  // Leer credenciales
  delete require.cache[require.resolve(CREDS_FILE)]; // limpiar cache
  const creds = require(CREDS_FILE);
  
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key, // require() ya parsea correctamente los \n
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.readonly']
  });
  
  await auth.authorize();
  return auth;
}

// Endpoint genérico que devuelve la primera hoja mapeada a objetos
app.get('/datos', async (req, res) => {
  try{
    const auth = await getAuthorizedClient();
    const sheets = google.sheets({version:'v4', auth});
    // obtener título de la primera hoja
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const firstSheet = meta.data.sheets && meta.data.sheets[0] && meta.data.sheets[0].properties && meta.data.sheets[0].properties.title;
    if(!firstSheet) return res.status(404).json({ error: 'No se encontraron hojas en el documento' });
    const range = `${firstSheet}!A1:Z1000`;
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
    const values = resp.data.values || [];
    if(values.length === 0) return res.json([]);
    const headers = values[0].map(h => String(h).trim());
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
      return obj;
    });
    res.json(data);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// Endpoint por nombre de hoja: /sheet?name=reports
app.get('/sheet', async (req, res) => {
  const name = req.query.name;
  if(!name) return res.status(400).json({ error: 'Falta query param name' });
  try{
    const auth = await getAuthorizedClient();
    const sheets = google.sheets({version:'v4', auth});
    const range = `${name}!A1:Z1000`;
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
    const values = resp.data.values || [];
    if(values.length === 0) return res.json([]);
    const headers = values[0].map(h => String(h).trim());
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
      return obj;
    });
    res.json(data);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/sheet/append', async (req, res) => {
  try{
    const auth = await getAuthorizedClient();
    const sheets = google.sheets({version:'v4', auth});
    const { sheetName = 'Hoja 1', values } = req.body; // values: array de arrays o array de objetos
    // para append, solo necesitamos el nombre de la hoja (sin rango específico)
    const range = sheetName;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [values] }
    });
    res.json({ ok: true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.put('/sheet/update', async (req, res) => {
  try{
    const auth = await getAuthorizedClient();
    const sheets = google.sheets({version:'v4', auth});
    const { sheetName='Sheet1', range, values } = req.body; // range ejemplo: 'Sheet1!A5:C5'
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] }
    });
    res.json({ ok: true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/sheet/clear', async (req, res) => {
  try{
    const auth = await getAuthorizedClient();
    const sheets = google.sheets({version:'v4', auth});
    const { range } = req.body; // 'Sheet1!A5:C5' o 'Sheet1!A5:Z5'
    await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range });
    res.json({ ok: true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

console.log('Server starting. Using Google Sheets API via googleapis.');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

// Nota: la inicialización y llamadas a la API de Google Sheets/Drive
// se realizan dentro de los endpoints (función loadDoc o rutas específicas).
// Si necesitas ejecutar lógica de validación al iniciar el servidor,
// envuelve la llamada `await` dentro de una función `async` y llama a ella,
// por ejemplo:
// (async function init(){
//   // autorizar y realizar una petición de prueba
// })().catch(console.error);

async function downloadAndParseXlsx(auth, fileId){
  const drive = google.drive({version:'v3', auth});
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
  const buf = Buffer.from(res.data);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buf);
  const sheet = workbook.worksheets[0];
  const data = [];
  const headers = sheet.getRow(1).values.slice(1); // ExcelJS row.values is 1-based
  sheet.eachRow((row, rowNumber) => {
    if(rowNumber===1) return;
    const obj = {};
    headers.forEach((h, i) => { obj[h]=row.getCell(i+1).value; });
    data.push(obj);
  });
  return data;
}

// Ejemplo de fetch desde el cliente para el endpoint /sheet/append
// fetch('/sheet/append', {
//   method: 'POST',
//   headers: {'Content-Type':'application/json'},
