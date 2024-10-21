// Updated server logic with a simplified flow
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

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Twilio configuration
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Store verification codes
let verificationCodes = {};

// Ensure the user starts at the registration page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Send verification code
app.post('/register', async (req, res) => {
    const { name, phone, event, date } = req.body;
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    try {
        // Send SMS using Twilio
        const message = await client.messages.create({
            body: `Olá ${name}, seu código de verificação é: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        verificationCodes[phone] = verificationCode;

        // Log code sent for testing
        console.log(`Código de verificação armazenado para o telefone: ${formattedPhone}. Código: ${verificationCode}`);

        // Respond to client
        res.status(200).json({ success: true, message: "Código enviado com sucesso" });
    } catch (error) {
        console.error('Erro ao enviar SMS:', error.message);
        res.status(500).json({ success: false, message: "Erro ao enviar o código de verificação.", error: error.message });
    }
});

// Verify the code
app.post('/verify-code', (req, res) => {
    const { phone, code } = req.body;
    const formattedPhone = `+55${phone.replace(/[^0-9]/g, '')}`;

    if (verificationCodes[formattedPhone] && verificationCodes[formattedPhone] === parseInt(code)) {
        delete verificationCodes[formattedPhone]; // Clear the code after verification
        res.status(200).json({ success: true, message: "Código verificado com sucesso." });
    } else {
        res.status(400).json({ success: false, message: "Código inválido." });
    }
});

// Catch-all route to handle other routes and ensure user starts at registration
app.get('*', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
