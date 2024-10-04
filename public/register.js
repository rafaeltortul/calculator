function generateCode() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const event = document.getElementById('event').value;
    const date = document.getElementById('date').value;

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, event, date })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('codeSection').style.display = 'block';
            alert("Código de verificação enviado ao seu telefone.");
        } else {
            alert("Erro ao enviar código: " + data.message);
        }
    }).catch(error => alert("Erro ao enviar requisição: " + error));
}

function verifyCode() {
    const phone = document.getElementById('phone').value;
    const code = document.getElementById('verificationCode').value;

    fetch('/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = 'index.html';
        } else {
            alert("Código inválido: " + data.message);
        }
    }).catch(error => alert("Erro ao verificar código: " + error));
}
