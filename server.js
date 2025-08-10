const express = require('express');
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const bcrypt = require('bcryptjs');  // meglio bcryptjs per deploy su Render

const app = express();
app.use(bodyParser.json());

const SHEET_ID = process.env.SHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!SHEET_ID || !CREDENTIALS_PATH) {
  console.error('Errore: variabili d\'ambiente SHEET_ID o GOOGLE_APPLICATION_CREDENTIALS non settate');
  process.exit(1);
}

let doc;

async function accessSheet() {
  try {
    doc = new GoogleSpreadsheet(SHEET_ID);
    // Carica credenziali da file JSON tramite require dinamico
    const creds = require(CREDENTIALS_PATH);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    console.log('Foglio Google caricato con successo:', doc.title);
  } catch (err) {
    console.error('Errore accesso Google Sheet:', err);
    throw err;
  }
}

// Chiamalo una volta all'avvio
accessSheet().catch(err => {
  console.error('Impossibile inizializzare Google Sheet:', err);
  process.exit(1);
});

// Qui puoi mettere i tuoi endpoint API (es. login, flashcards, punteggi...)
// esempio minimal:
app.get('/', (req, res) => {
  res.send('App giapponese attiva');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server avviato su porta ${PORT}`);
});

