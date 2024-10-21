const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const session = require('express-session'); // Importando a sessão

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de sessão
app.use(session({
    secret: 'MaisFloresAuto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use "true" se estiver usando HTTPS
}));

// Configuração do Twilio
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

let verificationCodes = {}; // Objeto para armazenar códigos de verificação

// Rota inicial para verificar se o usuário já foi autenticado
app.get('/', (req, res) => {
    if (req.session.isVerified) {
        res.redirect('/index'); // Redireciona para a página da calculadora se estiver autenticado
    } else {
        res.sendFile(path.join(__dirname, 'public', 'register.html')); // Senão, envia para o registro
    }
});

// Rota para enviar o código de verificação via SMS
app.post('/register', async (req, res) => {
    const { name, phone, event, date } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        const message = await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        verificationCodes[formattedPhone] = verificationCode; // Armazenar o código
        res.status(200).json({ success: true, message: "Código de verificação enviado." });
    } catch (error) {
        console.error('Erro ao enviar SMS:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar código de verificação." });
    }
});

// Rota para verificar o código de verificação
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    if (verificationCodes[formattedPhone] && verificationCodes[formattedPhone] === parseInt(code)) {
        req.session.isVerified = true; // Marcar como autenticado
        delete verificationCodes[formattedPhone]; // Remover o código armazenado
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Rota para redirecionar para a página da calculadora
app.get('/index', (req, res) => {
    if (req.session.isVerified) {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // Se autenticado, envia a calculadora
    } else {
        res.redirect('/'); // Se não estiver autenticado, volta para o registro
    }
});

// Redirecionar qualquer outra rota para o registro
app.get('*', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
