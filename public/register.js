function generateCode() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const event = document.getElementById('event').value;
    const date = document.getElementById('date').value;

    console.log("Iniciando o processo de geração de código...");
    console.log("Dados enviados:", { name, phone, event, date });

    const data = {
        name,
        phone,
        event,
        date
    };

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Código de verificação enviado com sucesso!");
            document.getElementById('codeSection').style.display = 'block';
            document.getElementById('codeSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("Erro ao enviar o código de verificação. Tente novamente mais tarde.");
        }
    })
    .catch(error => {
        console.error("Erro ao gerar código:", error);
        alert("Erro ao gerar código. Verifique sua conexão e tente novamente.");
    });
}

function verifyCode() {
    const phone = document.getElementById('phone').value;
    const verificationCode = document.getElementById('verificationCode').value;

    const data = {
        phone,
        code: verificationCode
    };

    fetch('/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Código verificado com sucesso!");
            // Redirecionar para a página da calculadora
            window.location.href = "/index.html";
        } else {
            alert("Código inválido. Tente novamente.");
        }
    })
    .catch(error => {
        console.error("Erro ao verificar o código:", error);
    });
}
