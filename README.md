# Japanese Flashcards - Deploy-ready package

## Cosa c'è qui
- `server.js` - backend Node.js (Express). Comunica con Google Sheets.
- `public/` - frontend statico (HTML/CSS/JS).
- `package.json` - dipendenze e script.
- `credentials.json.example` - esempio di service account (sostituisci con il tuo `credentials.json`).

## Setup rapido
1. Crea un Google Sheet con intestazioni in riga 1: `username | password | points`.
2. Abilita Google Sheets API e crea una Service Account. Scarica il `credentials.json` e posizionalo nella root del progetto come `credentials.json`.
3. Condividi il foglio Google con l'email della service account (client_email).
4. Imposta l'ID del foglio come variabile d'ambiente `SHEET_ID` su Render (o modifica server.js).
5. Deploy su Render: comando di start `node server.js`.

## Note di sicurezza
- Questo progetto **non** è adatto ad uso in produzione:
  - Password salvate (hashed) su Google Sheets è **poco sicuro**.
  - Non ci sono token di sessione sicuri (JWT) implementati.
- Va bene per test e uso personale locale.
