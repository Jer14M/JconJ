let usernameLogged = null;
let points = 0;
let currentCard = null;
let startTime = null;
let currentMode = null;

const decks = {
    kanji: [
        { question: '日', answer: 'sole' },
        { question: '月', answer: 'luna' },
        { question: '水', answer: 'acqua' },
        { question: '火', answer: 'fuoco' }
    ],
    pronunciaJP: [
        { question: 'ありがとう', answer: 'arigatou' },
        { question: 'すし', answer: 'sushi' },
        { question: 'ねこ', answer: 'neko' },
        { question: 'こんにちは', answer: 'konnichiwa' }
    ],
    italianoJP: [
        { question: 'sole', answer: 'ひ' },
        { question: 'gatto', answer: 'ねこ' },
        { question: 'acqua', answer: 'みず' },
        { question: 'fuoco', answer: 'ひ' }
    ]
};

async function register(){
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const msg = document.getElementById('auth-message');
    if(!username||!password){ msg.textContent = 'Compila username e password'; return; }
    const res = await fetch('/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
    const data = await res.json();
    msg.textContent = data.success ? 'Registrato! Effettua il login.' : (data.message || 'Errore');
}

async function login(){
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const msg = document.getElementById('auth-message');
    if(!username||!password){ msg.textContent = 'Compila username e password'; return; }
    const res = await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
    const data = await res.json();
    if(data.success){
        usernameLogged = username;
        points = parseInt(data.points) || 0;
        document.getElementById('userDisplay').textContent = username;
        document.getElementById('pointsDisplay').textContent = points;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('game-section').style.display = 'block';
        document.getElementById('mode').value = '';
        document.getElementById('flashcard').textContent = 'Seleziona una modalità';
    } else {
        msg.textContent = data.message || 'Login fallito';
    }
}

function logout(){
    usernameLogged = null;
    points = 0;
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('auth-message').textContent = 'Hai effettuato il logout';
}

function startMode(){
    const mode = document.getElementById('mode').value;
    if(!mode) return;
    currentMode = mode;
    nextCard();
}

function nextCard(){
    const deck = decks[currentMode];
    currentCard = deck[Math.floor(Math.random()*deck.length)];
    document.getElementById('flashcard').textContent = currentCard.question;
    document.getElementById('result').textContent = '';
    document.getElementById('answer').value = '';
    startTime = Date.now();
}

async function checkAnswer(){
    const userAnswer = document.getElementById('answer').value.trim();
    if(!currentCard){ document.getElementById('result').textContent = 'Seleziona prima una modalità'; return; }
    const timeTaken = (Date.now() - startTime)/1000;
    const resultEl = document.getElementById('result');
    if(userAnswer.toLowerCase() === currentCard.answer.toLowerCase()){
        resultEl.textContent = 'Corretto!';
        let gained = Math.max(1, Math.round(10 - timeTaken));
        points += gained;
    } else {
        resultEl.textContent = `Sbagliato! Risposta: ${currentCard.answer}`;
        points = Math.max(0, points-1);
    }
    document.getElementById('pointsDisplay').textContent = points;

    if(usernameLogged){
        await fetch('/savePoints',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:usernameLogged,points})});
    }

    // small delay before next card
    setTimeout(nextCard, 700);
}
