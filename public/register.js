document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o formulário de ser submetido de forma tradicional

    // Captura os valores dos campos
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const event = document.getElementById('event').value;
    const date = document.getElementById('date').value;

    // Enviar uma requisição POST ao backend
    fetch('/send-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, event, date })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Código enviado! Verifique seu SMS.');
            // Aqui, você pode redirecionar para uma página de verificação do código
        } else {
            alert('Erro ao enviar código.');
        }
    });
});
