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

// Rota para redirecionar para a página de registro
app.get('/', (req, res) => {
    res.redirect(path.join(__dirname, 'public', 'register.html'));
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
        console.log(`Código de verificação armazenado para o telefone: ${phone} ${verificationCode}`);

        // Tentar enviar o e-mail de notificação
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Novo Registro na Calculadora de Eventos',
            text: `Novo registro: \n\nNome: ${name}\nTelefone: ${phone}\nEvento: ${event}\nData: ${date}`
        };

        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso.');

        // Enviar a resposta de sucesso ao cliente
        res.status(200).json({ success: true, message: "Código de verificação enviado com sucesso." });

    } catch (error) {
        console.error('Erro ao enviar SMS ou e-mail:', error.message);

        // Verificar se a mensagem SMS foi enviada com sucesso
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Erro ao enviar o código de verificação." });
        }
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

// Redirecionar qualquer outra rota não especificada para a página de registro
app.get('*', (req, res) => {
    res.redirect('/');
});

// Definindo a porta para o servidor escutar
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
