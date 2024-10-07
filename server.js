// Importando módulos necessários
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Suporte para JSON bodies

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Forçar redirecionamento para a página de registro ao acessar '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Configuração Twilio e envio de código de verificação
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

let verificationCodes = {};

app.post('/register', async (req, res) => {
    const { name, phone, event, date } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        verificationCodes[phone] = verificationCode; // Armazenar o código de verificação
        res.status(200).json({ success: true, message: "Código de verificação enviado." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro ao enviar o código de verificação." });
    }
});

// Rota para verificar o código
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;

    if (verificationCodes[phone] && verificationCodes[phone] === parseInt(code)) {
        delete verificationCodes[phone]; // Limpar o código após a verificação
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Servir a página da calculadora após o registro
app.get('/calculator', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Redirecionar qualquer rota não especificada para a página de registro
app.get('*', (req, res) => {
    res.redirect('/');
});

// Inicializar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
