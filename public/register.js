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
    .then(response => {
        console.log("Resposta recebida:", response);
        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.statusText}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.success) {
            console.log("Código enviado com sucesso");
            document.getElementById('codeSection').style.display = 'block';
            // Adicionando a exibição de mensagem de sucesso
            alert("Código de verificação enviado com sucesso para o seu celular.");
            document.getElementById('verificationCode').focus(); // Focar no campo de código de verificação
        } else {
            console.error("Erro ao enviar o código:", result.message);
            alert("Erro ao gerar o código. Por favor, tente novamente.");
        }
    })
    .catch(error => {
        console.error("Erro de rede ou no servidor:", error);
        alert("Ocorreu um erro ao gerar o código. Verifique sua conexão e tente novamente.");
    });
}
