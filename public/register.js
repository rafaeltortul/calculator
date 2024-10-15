function generateCode() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const event = document.getElementById('event').value;
    const date = document.getElementById('date').value;

    // Verificando se os campos estão preenchidos
    if (!name || !phone || !event || !date) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    console.log("Iniciando o processo de geração de código...");
    console.log("Dados enviados:", { name, phone, event, date });

    const data = {
        name,
        phone,
        event,
        date
    };

    // Mostrar um indicador de carregamento
    document.getElementById('codeSection').style.display = 'none';
    alert("Gerando código, por favor aguarde...");

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
            alert("Código enviado com sucesso! Verifique seu celular.");
        } else {
            console.error("Erro ao enviar o código:", result.message);
            alert("Erro ao enviar o código: " + result.message);
        }
    })
    .catch(error => {
        console.error("Erro de rede ou no servidor:", error);
        alert("Erro ao tentar gerar o código. Tente novamente mais tarde.");
    });
}
