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
app.use(cors()); // Permitir requisições de diferentes origens
app.use(bodyParser.json()); // Suporte para JSON-encoded bodies

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Twilio
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Objeto para armazenar códigos de verificação e telefones
let verificationCodes = {};

// Rota para servir a página de registro diretamente
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Forçar redirecionamento para a página de registro
app.get('/', (req, res) => {
    console.log("Redirecionando para /register");
    res.redirect('/register');
});

// Forçar redirecionamento para qualquer outra rota que não seja /register ou /
app.get('*', (req, res) => {
    res.redirect('/register');
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
        verificationCodes[phone] = verificationCode;
        res.status(200).json({ success: true, message: "Código de verificação enviado." });

        // Enviar e-mail de notificação para o administrador
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: 'mais.flores@hotmail.com',
                pass: 'NSF98095220'
            }
        });

        const mailOptions = {
            from: 'mais.flores@hotmail.com',
            to: 'mais.flores@hotmail.com',
            subject: 'Novo Registro na Calculadora de Eventos',
            text: `Novo registro: \n\nNome: ${name}\nTelefone: ${phone}\nEvento: ${event}\nData: ${date}`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Erro ao enviar SMS ou e-mail:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar código de verificação.", error: error.message });
    }
});

// Rota para verificar o código de verificação
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;

    if (verificationCodes[phone] && verificationCodes[phone] === parseInt(code)) {
        delete verificationCodes[phone]; // Limpar o código após a verificação
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Definindo a porta para o servidor escutar
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
