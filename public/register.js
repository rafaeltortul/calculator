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
            
            // Exibe a seção do código de verificação e rola para ela
            document.getElementById('codeSection').style.display = 'block';
            alert("Código enviado com sucesso! Verifique seu celular.");
            document.getElementById('codeSection').scrollIntoView({ behavior: 'smooth' });
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

function verifyCode() {
    const phone = document.getElementById('phone').value;
    const code = document.getElementById('verificationCode').value;

    if (!phone || !code) {
        alert("Por favor, preencha o número de telefone e o código de verificação.");
        return;
    }

    console.log("Verificando o código...", { phone, code });

    const data = { phone, code };

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
            console.log("Código verificado com sucesso!");
            alert("Código verificado com sucesso! Redirecionando para a calculadora...");

            // Redireciona para a página da calculadora
            window.location.href = '/index.html';
        } else {
            console.error("Falha na verificação do código:", result.message);
            alert("Código inválido, por favor tente novamente.");
        }
    })
    .catch(error => {
        console.error("Erro durante a verificação:", error);
        alert("Erro durante a verificação. Tente novamente.");
    });
}
