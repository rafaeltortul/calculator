const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser'); // Adiciona suporte a cookies

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser()); // Ativa o middleware para gerenciar cookies
app.use(express.static(path.join(__dirname, 'public')));

let verificationCodes = {};

// Rota inicial com verificação de cookie
app.get('/', (req, res) => {
    if (req.cookies.verified) {
        res.redirect('/index.html'); // Se o usuário já tiver o cookie de verificado, redireciona para a calculadora
    } else {
        res.sendFile(path.join(__dirname, 'public', 'register.html')); // Caso contrário, vai para a página de registro
    }
});

// Enviar código de verificação via Twilio
app.post('/register', async (req, res) => {
    const { name, phone } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        await twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
            .messages.create({
                body: `Seu código de verificação é: ${verificationCode}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
        verificationCodes[formattedPhone] = verificationCode;
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
        delete verificationCodes[formattedPhone]; // Remove o código após verificação
        res.cookie('verified', true, { maxAge: 24 * 60 * 60 * 1000 }); // Define um cookie de verificado por 1 dia
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Rota genérica para capturar qualquer outra rota
app.get('*', (req, res) => {
    if (req.cookies.verified) {
        res.redirect('/index.html');
    } else {
        res.redirect('/');
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
