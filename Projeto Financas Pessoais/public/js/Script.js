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
const ctxTotais = document.getElementById('graficoTotais').getContext('2d');
new Chart(ctxTotais, {
  type: 'bar',
  data: {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
    datasets: [{
      label: 'Receitas',
      data: [1200, 1500, 1800, 2000],
      backgroundColor: 'rgba(46, 204, 113, 0.7)'
    }, {
      label: 'Despesas',
      data: [800, 1000, 1200, 900],
      backgroundColor: 'rgba(231, 76, 60, 0.7)'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    }
  }
});

// Gráfico Categorias
const ctxCategorias = document.getElementById('graficoCategorias').getContext('2d');
new Chart(ctxCategorias, {
  type: 'pie',
  data: {
    labels: ['Alimentação', 'Transporte', 'Moradia', 'Cartoes'],
    datasets: [{
      data: [500, 300, 700, 200],
      backgroundColor: [
        'rgba(52, 152, 219, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(230, 126, 34, 0.7)'
      ]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      title: { display: false }
    }
  }
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

