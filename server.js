// Importando módulos necessários
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

    console.log("Dados recebidos para registro:", { name, phone, event, date });
    console.log("Tentando enviar código de verificação para:", formattedPhone);

    try {
        // Enviar SMS via Twilio
        const message = await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        console.log("Mensagem Twilio enviada com sucesso, SID:", message.sid);

        verificationCodes[phone] = verificationCode;
        res.status(200).json({ success: true, message: "Código de verificação enviado." });

        // Configuração OAuth2 para envio de e-mails via Hotmail
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                type: 'OAuth2',
                user: 'mais.flores@hotmail.com',
                clientId: process.env.OAUTH_CLIENT_ID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: process.env.OAUTH_ACCESS_TOKEN
            }
        });

        const mailOptions = {
            from: 'mais.flores@hotmail.com',
            to: 'mais.flores@hotmail.com',
            subject: 'Novo Registro na Calculadora de Eventos',
            text: `Novo registro: \n\nNome: ${name}\nTelefone: ${phone}\nEvento: ${event}\nData: ${date}`
        };

        // Enviar e-mail e registrar sucesso ou falha
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar e-mail:', error.message);
            } else {
                console.log('E-mail enviado com sucesso:', info.response);
            }
        });

    } catch (error) {
        console.error('Erro ao enviar SMS ou e-mail:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar código de verificação.", error: error.message });
    }
});

// Rota para verificar o código de verificação
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;

    console.log("Verificando código para o telefone:", phone);
    if (verificationCodes[phone] && verificationCodes[phone] === parseInt(code)) {
        delete verificationCodes[phone];
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        console.error("Código inválido para o telefone:", phone);
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
