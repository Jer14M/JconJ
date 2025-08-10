const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== CONFIG GOOGLE SHEETS ======
const SHEET_ID = process.env.SHEET_ID || 'INSERISCI_ID_DEL_TUO_FOGLIO';
const SHEET_NAME = process.env.SHEET_NAME || 'Foglio1';

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

async function getUsers() {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:C`
    });
    return res.data.values || [];
}

async function addUser(username, password) {
    const hashed = await bcrypt.hash(password, 10);
    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:C`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[username, hashed, 0]]
        }
    });
}

async function updatePoints(username, points) {
    const users = await getUsers();
    const rowIndex = users.findIndex(u => u[0] === username);
    if (rowIndex >= 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!C${rowIndex + 2}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[points]]
            }
        });
    }
}

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.json({ success: false, message: 'username e password richiesti' });
        const users = await getUsers();
        if (users.some(u => u[0] === username)) {
            return res.json({ success: false, message: 'Username già esistente' });
        }
        await addUser(username, password);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Errore server' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await getUsers();
        const user = users.find(u => u[0] === username);
        if (!user) return res.json({ success: false, message: 'Utente non trovato' });

        const match = await bcrypt.compare(password, user[1]);
        if (!match) return res.json({ success: false, message: 'Password errata' });

        res.json({ success: true, points: user[2] || 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Errore server' });
    }
});

app.post('/savePoints', async (req, res) => {
    try {
        const { username, points } = req.body;
        await updatePoints(username, points);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Errore server' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`));
