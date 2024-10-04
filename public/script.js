function calcularOrcamento() {
    const flores = parseFloat(document.getElementById('flores').value);
    const acervo = parseFloat(document.getElementById('acervo').value);
    const cenografia = parseFloat(document.getElementById('cenografia').value);
    const maoObra = parseFloat(document.getElementById('maoObra').value);
    const logistica = parseFloat(document.getElementById('logistica').value);
    
    const total = flores + acervo + cenografia + maoObra + logistica;

    document.getElementById('orcamentoTotal').textContent = `R$ ${total.toFixed(2)}`;
}

// Função para salvar orçamento em Excel
function salvarExcel() {
    var wb = XLSX.utils.book_new();
    var ws_name = "Orçamento";

    // Captura os dados da tabela para exportação
    var elt = document.getElementById('orcamentoForm');
    var ws = XLSX.utils.table_to_sheet(elt);

    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, "Orçamento_Evento.xlsx");
}

// Função para impressão
function imprimirOrcamento() {
    window.print();
}
