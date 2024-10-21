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

    console.log(`Tentando enviar código de verificação para: ${formattedPhone}`);

    try {
        // Enviar SMS via Twilio
        const message = await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        // Armazenar código e número
        verificationCodes[formattedPhone] = verificationCode;
        console.log(`Código gerado e armazenado para o telefone: ${formattedPhone}. Código: ${verificationCode}`);
        res.status(200).json({ success: true, message: "Código de verificação enviado." });

        // Enviar e-mail de notificação para o administrador
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
        console.log('E-mail enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar SMS ou e-mail:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar o código de verificação.", error: error.message });
    }
});

// Rota para verificar o código de verificação
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`; // Formatar o telefone novamente

    console.log(`Verificando código para o telefone: ${formattedPhone}`);
    console.log(`Código esperado: ${verificationCodes[formattedPhone]}, Código recebido: ${code}`);

    // Verificar se o código corresponde ao telefone
    if (verificationCodes[formattedPhone] && verificationCodes[formattedPhone] === parseInt(code)) {
        delete verificationCodes[formattedPhone]; // Limpar o código após a verificação
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        console.error(`Código inválido para o telefone: ${formattedPhone}. Código esperado: ${verificationCodes[formattedPhone]}`);
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
