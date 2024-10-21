const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const session = require('express-session'); // Usando express-session para sessões

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de sessão
app.use(session({
    secret: 'MaisFloresAuto',
    resave: false,
    saveUninitialized: false, // Alterado para false para não criar sessão sem necessidade
    cookie: { secure: false } // Usar true se estiver em HTTPS
}));

// Objeto para armazenar códigos de verificação
let verificationCodes = {};

// Rota inicial
app.get('/', (req, res) => {
    if (req.session.isVerified) {
        res.redirect('/index'); // Se o usuário estiver verificado, vá para o index
    } else {
        res.sendFile(path.join(__dirname, 'public', 'register.html')); // Se não estiver, vá para o registro
    }
});

// Rota para o index (calculadora)
app.get('/index', (req, res) => {
    if (req.session.isVerified) {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // Se estiver verificado, enviar index
    } else {
        res.redirect('/'); // Senão, redireciona para o registro
    }
});

// Rota para enviar o código de verificação
app.post('/register', async (req, res) => {
    const { name, phone } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        const message = await client.messages.create({
            body: `Seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        verificationCodes[formattedPhone] = verificationCode;
        res.status(200).json({ success: true, message: "Código de verificação enviado." });
    } catch (error) {
        console.error('Erro ao enviar SMS:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar código de verificação." });
    }
});

// Rota para verificar o código
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    if (verificationCodes[formattedPhone] && verificationCodes[formattedPhone] === parseInt(code)) {
        req.session.isVerified = true; // Marca o usuário como verificado na sessão
        delete verificationCodes[formattedPhone]; // Remove o código para evitar reutilização
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Rota para lidar com qualquer outra rota desconhecida
app.get('*', (req, res) => {
    res.redirect('/'); // Redirecionar sempre para o registro se algo não for identificado
});

// Inicia o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
