const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const session = require('express-session');
const path = require('path');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Sessão para armazenar a autenticação do usuário
app.use(session({
    secret: 'MaisFloresSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Deixe `secure: true` para ambientes HTTPS
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Twilio
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Objeto para armazenar códigos de verificação e telefones
let verificationCodes = {};

// Verificar se o usuário está autenticado para acessar o index
app.get('/index.html', (req, res) => {
    if (req.session.isVerified) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.redirect('/register.html');
    }
});

// Página de registro
app.get('/', (req, res) => {
    res.redirect('/register.html');
});

// Rota para gerar o código de verificação
app.post('/register', async (req, res) => {
    const { name, phone, event, date } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        // Enviar SMS via Twilio
        await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        verificationCodes[phone] = verificationCode;
        req.session.phone = phone;  // Armazena o número de telefone na sessão
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
        req.session.isVerified = true;  // Marca o usuário como verificado na sessão
        delete verificationCodes[formattedPhone];  // Remove o código de verificação armazenado
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Rota padrão para redirecionar não autenticados
app.get('*', (req, res) => {
    res.redirect('/');
});

// Iniciar o servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
