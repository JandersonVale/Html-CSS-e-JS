function toggleValor(id, btn) {
  const el = document.getElementById(id);
  const span = el.querySelector('.valor');
  const realValue = el.getAttribute("data-real");

  if (span.textContent.includes("*")) {
    // Mostrar valor real
    span.textContent = realValue + " ";
    btn.textContent = "🔓"; // cadeado aberto
  } else {
    // Mostrar asteriscos com mesmo tamanho do valor
    span.textContent = "*".repeat(realValue.length) + " ";
    btn.textContent = "🔒"; // cadeado fechado
  }
}


function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("expanded");
}

function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  document.getElementById('datetime').textContent = 
    now.toLocaleDateString('pt-BR', options);
}

updateDateTime();
setInterval(updateDateTime, 1000); // atualiza a cada segundo

// Gráfico Totais
fetch("http://localhost:3000/resumo")
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById("graficoTotais").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Receitas", "Despesas", "Saldo"],
        datasets: [{
        label: "",
          data: [data.receitas, data.despesas, data.resumo],
          backgroundColor: ["#4CAF50", "#F44336", "#2196F3"]
        }]
      },
      options: {
        plugins: {
          legend: {display:false},
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: (value) => "R$ " + value.toFixed(2),
            color: "#000",
            font: { weight: "bold" }
          },
          title: {
            display: false,
            text: "Resumo Financeiro"
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  });


// Gráfico Categorias
fetch("http://localhost:3000/categorias-despesa")
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById("graficoCategorias").getContext("2d");

    new Chart(ctx, {
      type: "bar", // pode ser "pie" ou "doughnut"
      data: {
        labels: data.map(item => item.categoria),
        datasets: [{
          label: "Despesas (R$)",
          data: data.map(item => item.total),
          backgroundColor: [
            "#F44336", "#FF9800", "#4CAF50", "#2196F3",
            "#9C27B0", "#795548", "#607D8B", "#FFC107","#215678"
          ]
        }]
      },
      options: {
        plugins: {
          legend: {display:false},
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: (value) => "R$ " + value.toFixed(2),
            color: "#000",
            font: { weight: "bold" }
          },
          title: {
            display: false,
            text: "Despesas por Categoria (ordenadas)"
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  });


function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  const isVisible = submenu.style.display === "block";

  // Fecha todos os submenus antes
  document.querySelectorAll(".submenu").forEach(sm => sm.style.display = "none");

  // Abre apenas o clicado
  submenu.style.display = isVisible ? "none" : "block";
}

function carregarContas() {
  fetch("http://localhost:3000/despesas")
    .then(res => res.json())
    .then(data => {
      const tabela = document.getElementById("tabelaContas");
      tabela.innerHTML = "";

      data.forEach(conta => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>R$ ${conta.valor.toFixed(2)}</td>
          <td>${conta.vencimento}</td>
          <td>${conta.descricao}</td>
          <td>${conta.recebedor}</td>
          <td>${conta.pagador}</td>
          <td>${conta.categoria}</td>
          <td>${conta.status}</td>
        `;
        tabela.appendChild(row);
      });
    });
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/resumo')
    .then(res => res.json())
    .then(data => {
      const resumoFormatado   = `💰 ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.resumo)}`;
      const despesasFormatadas = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.despesas);
      const receitasFormatadas = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.receitas);

      // Atualiza os spans
      document.querySelector('#resumoValor .valor').textContent   = resumoFormatado;
      document.querySelector('#despesasValor .valor').textContent = despesasFormatadas;
      document.querySelector('#receitasValor .valor').textContent = receitasFormatadas;

      // Atualiza os atributos data-real (usados pelo toggleValor)
      document.getElementById('resumoValor').setAttribute('data-real', resumoFormatado);
      document.getElementById('despesasValor').setAttribute('data-real', despesasFormatadas);
      document.getElementById('receitasValor').setAttribute('data-real', receitasFormatadas);
    })
    .catch(err => console.error('Erro ao buscar resumo:', err));
});



// Chama ao carregar a página
carregarContas();

