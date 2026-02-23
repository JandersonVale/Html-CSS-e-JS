// SIDEBAR E SUBMENU
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu && submenu.classList.contains("submenu")) {
    submenu.style.display =
      submenu.style.display === "block" ? "none" : "block";
  }
}

// VARIÁVEIS DE GRÁFICOS
let chartReceitasDespesas;
let chartCategorias;

// FUNÇÃO PRINCIPAL PARA CARREGAR TABELA E GRÁFICOS
async function carregarDashPorPeriodo() {
  const inicio = document.getElementById("data-inicio").value;
  const fim = document.getElementById("data-fim").value;

  try {
    // ------------------------------
    // FETCH DESPESAS
    // ------------------------------
    const urlDespesas = new URL("http://localhost:3000/expenses");
    if (inicio) urlDespesas.searchParams.append("inicio", inicio);
    if (fim) urlDespesas.searchParams.append("fim", fim);

    const responseDespesas = await fetch(urlDespesas);
    const despesas = await responseDespesas.json();

    // ------------------------------
    // FETCH RECEITAS
    // ------------------------------
    const urlReceitas = new URL("http://localhost:3000/receives");
    if (inicio) urlReceitas.searchParams.append("inicio", inicio);
    if (fim) urlReceitas.searchParams.append("fim", fim);

    const responseReceitas = await fetch(urlReceitas);
    const receitas = await responseReceitas.json();

    // ------------------------------
    // CALCULA TOTAIS
    // ------------------------------
    const totalDespesas = despesas.reduce(
      (sum, d) => sum + parseFloat(d.valor),
      0,
    );
    const totalReceitas = receitas.reduce(
      (sum, r) => sum + parseFloat(r.valor),
      0,
    );
    const saldo = totalReceitas - totalDespesas;

    // ATUALIZA CARDS
    const receitasCard = document.getElementById("receitas-valor");
    const despesasCard = document.getElementById("despesas-valor");
    const saldoCard = document.getElementById("saldo-valor");

    receitasCard.textContent = `R$ ${totalReceitas.toFixed(2)}`;
    despesasCard.textContent = `R$ ${totalDespesas.toFixed(2)}`;
    saldoCard.textContent = `R$ ${saldo.toFixed(2)}`;

    // ------------------------------
    // ATUALIZA TABELA DE DESPESAS
    // ------------------------------
    const tbody = document.querySelector(".bottom-row tbody");
    tbody.innerHTML = "";
    despesas.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.recebedor || d.pagador}</td>
        <td>R$ ${parseFloat(d.valor).toFixed(2)}</td>
        <td>${d.dt_venc ? new Date(d.dt_venc).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${d.dt_pagam ? new Date(d.dt_pagam).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${d.categ || "-"}</td>
        <td>${d.descri || "-"}</td>
        <td>${d.status}</td>
      `;
      tbody.appendChild(tr);
    });

    // FILTRA TABELA PELO STATUS
    filtrarTabela();

    // ------------------------------
    // ATUALIZA GRÁFICOS
    // ------------------------------
    atualizarGraficos(receitas, despesas);
  } catch (error) {
    console.error("Erro ao carregar dash:", error);
  }
}

// ------------------------------
// FUNÇÃO PARA ATUALIZAR GRÁFICOS
// ------------------------------
function atualizarGraficos(receitas, despesas) {
  const totalReceitas = receitas.reduce(
    (sum, r) => sum + parseFloat(r.valor),
    0,
  );
  const totalDespesas = despesas.reduce(
    (sum, d) => sum + parseFloat(d.valor),
    0,
  );

  // Receitas x Despesas
  const ctx1 = document
    .getElementById("receitasDespesasChart")
    .getContext("2d");
  if (chartReceitasDespesas) chartReceitasDespesas.destroy();
  chartReceitasDespesas = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [
        {
          label: "Valores",
          data: [totalReceitas, totalDespesas],
          backgroundColor: ["#007bff", "#e94747"],
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });

  // Gastos por Categoria
  const categorias = {};
  despesas.forEach((d) => {
    categorias[d.categ] = (categorias[d.categ] || 0) + parseFloat(d.valor);
  });

  const ctx2 = document.getElementById("categoriasChart").getContext("2d");
  if (chartCategorias) chartCategorias.destroy();
  chartCategorias = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: Object.keys(categorias),
      datasets: [
        {
          label: "Gastos (R$)",
          data: Object.values(categorias),
          backgroundColor: [
            "#007bff",
            "#6f42c1",
            "#17a2b8",
            "#ffc107",
            "#28a745",
            "#dc3545",
          ],
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

// ------------------------------
// FILTRAR TABELA PELO STATUS
// ------------------------------
function filtrarTabela() {
  const select = document.querySelector(".status-select select");
  const filtro = select.value.toLowerCase();
  const linhas = document.querySelectorAll("table tbody tr");

  linhas.forEach((linha) => {
    const status = linha.cells[6].textContent.toLowerCase();
    linha.style.display =
      filtro === "todos" ? "" : status === filtro ? "" : "none";
  });
}

// ------------------------------
// OCULTAR/MOSTRAR VALORES DOS CARDS
// ------------------------------
function toggleValor(id, btn) {
  const valor = document.getElementById(id);
  if (valor.dataset.hidden === "true") {
    valor.textContent = valor.dataset.original;
    valor.dataset.hidden = "false";
    btn.textContent = "🔓";
  } else {
    valor.dataset.original = valor.textContent;
    valor.textContent = "R$ ****";
    valor.dataset.hidden = "true";
    btn.textContent = "🔒";
  }
}

// ------------------------------
// EVENTOS
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Carrega tudo ao iniciar
  carregarDashPorPeriodo();

  // Atualiza ao mudar data
  document
    .getElementById("data-inicio")
    .addEventListener("change", carregarDashPorPeriodo);
  document
    .getElementById("data-fim")
    .addEventListener("change", carregarDashPorPeriodo);

  // Filtra tabela pelo select
  document
    .querySelector(".status-select select")
    .addEventListener("change", filtrarTabela);

  // Exibe nome do usuário logado
  const usuario = JSON.parse(localStorage.getItem("user"));
  if (usuario && usuario.nome) {
    document.querySelector(".header h1").textContent = `Olá, ${usuario.nome}!`;
  } else {
    window.location.href = "../index.html";
  }
});
