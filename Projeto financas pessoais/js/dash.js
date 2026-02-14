 function toggleSidebar() {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("collapsed");
    }

    function toggleSubmenu(element) {
      const submenu = element.nextElementSibling;
      if (submenu && submenu.classList.contains("submenu")) {
        submenu.style.display = submenu.style.display === "block" ? "none" : "block";
      }
    }

    // Gráfico Receitas x Despesas
    new Chart(document.getElementById('receitasDespesasChart'), {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          label: 'Valores',
          data: [10000, 7500],
          backgroundColor: ['#007bff', '#6f42c1']
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Gráfico por Categoria
    new Chart(document.getElementById('categoriasChart'), {
      type: 'bar',
      data: {
        labels: ['Alimentação', 'Transporte', 'Moradia', 'Lazer'],
        datasets: [{
          label: 'Gastos (R$)',
          data: [1200, 800, 3000, 500],
          backgroundColor: ['#007bff', '#6f42c1', '#17a2b8', '#ffc107']
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Função para filtrar tabela pelo status selecionado
function filtrarTabela() {
  const select = document.querySelector(".status-select select");
  const filtro = select.value; // valor selecionado
  const linhas = document.querySelectorAll("table tbody tr");

  linhas.forEach(linha => {
    const status = linha.cells[3].textContent.toLowerCase(); // pega o texto da coluna Status
    if (filtro === "todos") {
      linha.style.display = ""; // mostra todas
    } else {
      // compara o valor do select com o status da linha
      linha.style.display = status === filtro ? "" : "none";
    }
  });
}

// adiciona evento ao dropdown
document.addEventListener("DOMContentLoaded", () => {
  const select = document.querySelector(".status-select select");
  select.addEventListener("change", filtrarTabela);
});