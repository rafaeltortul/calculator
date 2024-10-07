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
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para redirecionar sempre para a página de registro
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Configuração do Twilio
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Enviar código de verificação via SMS
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

        res.status(200).json({ success: true, message: "Código de verificação enviado." });
    } catch (error) {
        console.error('Erro ao enviar SMS:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar código de verificação." });
    }
});

// Rota para verificar o código de verificação
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;

    // Lógica de verificação de código
    if (verificationCodes[phone] && verificationCodes[phone] === parseInt(code)) {
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Rota para servir a página da calculadora
app.get('/calculator', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Qualquer outra rota leva para a página de registro
app.get('*', (req, res) => {
    res.redirect('/');
});

// Definir porta do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
