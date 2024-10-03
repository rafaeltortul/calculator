document.addEventListener("DOMContentLoaded", function () {
    let florIndex = 0;
    let arranjoIndex = 0;
    let totalGeral = 0;

    function adicionarFlor() {
        if (florIndex < 8) {
            const tabela = document.getElementById("florTableBody");
            const novaLinha = document.createElement("tr");

            novaLinha.innerHTML = `
                <td><input type="text" placeholder="Nome da Flor"></td>
                <td><input type="number" class="qtdFlor" value="0" min="0" step="1"></td>
                <td><input type="number" class="precoFlor" value="0" min="0" step="0.01"></td>
                <td><span class="totalFlor">R$ 0,00</span></td>
            `;

            tabela.appendChild(novaLinha);

            // Atualizar cálculos sempre que quantidade ou preço forem alterados
            novaLinha.querySelector(".qtdFlor").addEventListener("input", calcularTotalArranjo);
            novaLinha.querySelector(".precoFlor").addEventListener("input", calcularTotalArranjo);

            florIndex++;
        }
    }

    function calcularTotalArranjo() {
        let totalArranjo = 0;
        const linhas = document.querySelectorAll("#florTableBody tr");

        linhas.forEach((linha) => {
            const qtd = parseFloat(linha.querySelector(".qtdFlor").value) || 0;
            const preco = parseFloat(linha.querySelector(".precoFlor").value) || 0;
            const totalFlor = qtd * preco;

            linha.querySelector(".totalFlor").textContent = `R$ ${totalFlor.toFixed(2)}`;
            totalArranjo += totalFlor;
        });

        document.getElementById("totalArranjo").textContent = `R$ ${totalArranjo.toFixed(2)}`;
    }

    function finalizarArranjo() {
        const tipoArranjo = document.getElementById("tipoArranjo").value;
        const valorUnitarioArranjo = parseFloat(document.getElementById("totalArranjo").textContent.replace("R$", "")) || 0;

        const tabelaCalcFlores = document.getElementById("calcFloresBody");
        const novaLinha = document.createElement("tr");

        novaLinha.innerHTML = `
            <td>${tipoArranjo}</td>
            <td><input type="number" class="qtdArranjos" value="0" min="0" step="1"></td>
            <td><span class="valorUnitarioArranjo">R$ ${valorUnitarioArranjo.toFixed(2)}</span></td>
            <td><span class="totalArranjos">R$ 0,00</span></td>
        `;

        tabelaCalcFlores.appendChild(novaLinha);

        // Atualizar calculadora sempre que a quantidade de arranjos mudar
        novaLinha.querySelector(".qtdArranjos").addEventListener("input", function () {
            const qtdArranjos = parseFloat(this.value) || 0;
            const totalArranjos = qtdArranjos * valorUnitarioArranjo;

            novaLinha.querySelector(".totalArranjos").textContent = `R$ ${totalArranjos.toFixed(2)}`;

            // Atualizar o total geral
            atualizarTotalGeral();
        });

        // Resetar a tabela de flores para o próximo arranjo
        document.getElementById("florTableBody").innerHTML = "";
        document.getElementById("totalArranjo").textContent = "R$ 0,00";
        florIndex = 0;
        arranjoIndex++;
    }

    function atualizarTotalGeral() {
        let totalGeral = 0;
        const totaisArranjos = document.querySelectorAll(".totalArranjos");

        totaisArranjos.forEach((total) => {
            totalGeral += parseFloat(total.textContent.replace("R$", "")) || 0;
        });

        document.getElementById("totalGeral").textContent = `R$ ${totalGeral.toFixed(2)}`;
    }

    document.getElementById("adicionarFlor").addEventListener("click", adicionarFlor);
    document.getElementById("finalizarArranjo").addEventListener("click", finalizarArranjo);
});

