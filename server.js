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
app.use(bodyParser.json()); // Suporte para JSON-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Servir arquivos estáticos

// Configuração da sessão
app.use(session({
    secret: 'MaisFloresAuto', // use uma chave secreta forte e armazenada de maneira segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Altere para true se estiver usando HTTPS
}));

// Configuração do Twilio
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Objeto para armazenar códigos de verificação e telefones
let verificationCodes = {};

// Rota para redirecionar para a página de registro
app.get('/', (req, res) => {
    if (req.session.isVerified) {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // Usuário já verificado, enviar para o index
    } else {
        res.sendFile(path.join(__dirname, 'public', 'register.html')); // Caso contrário, enviar para o registro
    }
});

// Rota para enviar o código de verificação
app.post('/register', async (req, res) => {
    const { name, phone, event, date } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000); // Gera um código de 4 dígitos
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        // Enviar SMS via Twilio
        const message = await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        // Armazenar o código de verificação em memória
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
        req.session.isVerified = true; // Marcar o usuário como verificado
        delete verificationCodes[formattedPhone]; // Remover o código após a verificação
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Rota para redirecionar para a página de índice após verificação
app.get('/index', (req, res) => {
    if (req.session.isVerified) {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // Redirecionar apenas se o usuário estiver verificado
    } else {
        res.redirect('/'); // Caso contrário, redirecionar para a página de registro
    }
});

// Redirecionar qualquer outra rota não especificada para a página de registro
app.get('*', (req, res) => {
    res.redirect('/');
});

// Definindo a porta para o servidor escutar
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
