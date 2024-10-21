const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const session = require('express-session'); // Usando express-session para gerenciar sessões

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da sessão
app.use(session({
    secret: 'MaisFloresAuto', // Chave secreta para criptografar sessões
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false } // 'false' para HTTP, use 'true' para HTTPS
}));

// Objeto para armazenar códigos de verificação temporariamente
let verificationCodes = {};

// Rota inicial
app.get('/', (req, res) => {
    if (req.session.isVerified) {
        res.redirect('/index'); // Se estiver verificado, redireciona para o index
    } else {
        res.sendFile(path.join(__dirname, 'public', 'register.html')); // Caso contrário, abre a página de registro
    }
});

// Rota para a página index (calculadora)
app.get('/index', (req, res) => {
    if (req.session.isVerified) {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // Somente abre se a sessão estiver verificada
    } else {
        res.redirect('/'); // Se não estiver verificado, redireciona para o registro
    }
});

// Enviar código de verificação via Twilio
app.post('/register', async (req, res) => {
    const { name, phone } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        // Envia o SMS
        await twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
            .messages.create({
                body: `Seu código de verificação é: ${verificationCode}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
        verificationCodes[formattedPhone] = verificationCode; // Armazena o código gerado
        res.status(200).json({ success: true, message: "Código enviado com sucesso." });
    } catch (error) {
        console.error("Erro ao enviar SMS:", error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar o código." });
    }
});

// Verificar o código de verificação
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    if (verificationCodes[formattedPhone] && verificationCodes[formattedPhone] === parseInt(code)) {
        req.session.isVerified = true; // Marca o usuário como verificado na sessão
        delete verificationCodes[formattedPhone]; // Remove o código após verificação
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Rota genérica para capturar qualquer outra rota e redirecionar para o registro
app.get('*', (req, res) => {
    res.redirect('/'); // Redireciona para o registro caso não encontre a rota
});

// Inicia o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
