function generateCode() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const event = document.getElementById('event').value;
    const date = document.getElementById('date').value;

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
            alert("Código enviado com sucesso!");
            document.getElementById('codeSection').style.display = 'block';
            document.getElementById('codeSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("Erro ao gerar código de verificação.");
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao gerar código de verificação.");
    });
}

function verifyCode() {
    const phone = document.getElementById('phone').value;
    const verificationCode = document.getElementById('verificationCode').value;

    fetch('/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, code: verificationCode })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Código verificado com sucesso!");
            window.location.href = "/index"; // Redirecionar para a calculadora após verificação
        } else {
            alert("Código inválido.");
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao verificar o código.");
    });
}
