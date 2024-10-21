// Importando módulos necessários
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const session = require('express-session');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Twilio
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Configuração da sessão
app.use(session({
    secret: 'MaisFloresAuto', // String segura para a sessão
    resave: false,
    saveUninitialized: true
}));

// Objeto para armazenar códigos de verificação
let verificationCodes = {};

// Rota para redirecionar para o registro, se o usuário não estiver autenticado
app.get('/', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/register.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para enviar o código de verificação
app.post('/register', async (req, res) => {
    const { name, phone, event, date } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        // Enviar SMS via Twilio
        const message = await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        verificationCodes[formattedPhone] = verificationCode;
        res.status(200).json({ success: true, message: "Código de verificação enviado." });
    } catch (error) {
        console.error('Erro ao enviar SMS:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar código de verificação.", error: error.message });
    }
});

// Rota para verificar o código de verificação
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    if (verificationCodes[formattedPhone] && verificationCodes[formattedPhone] === parseInt(code)) {
        req.session.isAuthenticated = true; // Autentica o usuário na sessão
        delete verificationCodes[formattedPhone];
        return res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    }
    res.status(400).json({ success: false, message: "Código inválido." });
});

// Rota para acessar o index apenas após autenticação
app.get('/index.html', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/register.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Redirecionar qualquer outra rota para o registro
app.get('*', (req, res) => {
    res.redirect('/');
});

// Definindo a porta para o servidor escutar
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
