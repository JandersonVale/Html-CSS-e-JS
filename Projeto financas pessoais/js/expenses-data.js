async function CarregarDespesas() {
  const inicio = document.getElementById("data-inicio").value;
  const fim = document.getElementById("data-fim").value;

  try {
    const url = new URL("http://localhost:3000/expenses");
    if (inicio) url.searchParams.append("inicio", inicio);
    if (fim) url.searchParams.append("fim", fim);

    const response = await fetch(url);
    const receitas = await response.json();

    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";

    receitas.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.recebedor}</td>
        <td>R$ ${parseFloat(r.valor).toFixed(2)}</td>
        <td>${r.dt_venc ? new Date(r.dt_venc).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${r.dt_pagam ? new Date(r.dt_pagam).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${r.categ}</td>
        <td>${r.descri}</td>
        <td>${r.status}</td>
        <td>
          <button class="action-btn edit-btn" onclick="abrirModal(${r.id}, '${r.recebedor}', ${r.valor}, '${r.dt_venc}', '${r.dt_pagam}', '${r.categ}', '${r.descri}', '${r.status}')">
            <i class="fa fa-edit"></i> Editar
          </button>
          <button class="action-btn delete-btn" onclick="excluirDespesa(${r.id})">
            <i class="fa fa-trash"></i> Excluir
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    mostrarPopup("Erro ao carregar receitas", true);
    console.error(error);
  }
}

function abrirModal(id, recebedor, valor, dtVen, dtPag, categ, descri, status) {
  document.getElementById("editRecebedor").value = recebedor;
  document.getElementById("editValorDes").value = valor;
  document.getElementById("editDataVenc").value = dtVen
    ? dtVen.split("T")[0]
    : "";
  document.getElementById("editDataPag").value = dtPag
    ? dtPag.split("T")[0]
    : "";
  document.getElementById("editCategDes").value = categ;
  document.getElementById("editDescricaoDes").value = descri;
  document.getElementById("editStatusDes").value = status;

  document.getElementById("editModal").dataset.id = id;
  document.getElementById("editModal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("editModal").style.display = "none";
}

async function salvarEdicao() {
  const id = document.getElementById("editModal").dataset.id;

  const dados = {
    recebedor: document.getElementById("editRecebedor").value.trim(),
    valor: document.getElementById("editValorDes").value.trim(),
    data_vencimento: document.getElementById("editDataVenc").value.trim(),
    data_pagamento: document.getElementById("editDataPag").value.trim(),
    categoria: document.getElementById("editCategDes").value.trim(),
    descricao: document.getElementById("editDescricaoDes").value.trim(),
    status: document.getElementById("editStatusDes").value.trim(),
  };

    // validação simples ajustada para despesas
if (
  !dados.recebedor ||
  !dados.valor ||
  !dados.data_vencimento ||
  !dados.categoria ||
  !dados.descricao
) {
  mostrarPopup("Preencha todos os campos obrigatórios antes de cadastrar", true);
  return; // interrompe o envio
}

// Se data_pagamento estiver vazia, define null
if (!dados.data_pagamento) {
  dados.data_pagamento = null;
}

  try {
    const response = await fetch(`http://localhost:3000/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (response.ok) {
      mostrarPopup("Registro atualizado com sucesso");
      fecharModal();
      CarregarDespesas();
    } else {
      mostrarPopup("Erro: " + (result.message || "Falha na atualização"), true);
    }
  } catch (error) {
    mostrarPopup("Erro na requisição", true);
    console.error(error);
  }
}

function excluirDespesa(id) {
  mostrarConfirmacao("Deseja realmente excluir esta despesa?", async () => {
    try {
      const response = await fetch(`http://localhost:3000/expenses/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok) {
        mostrarPopup("Registro excluído com sucesso");
        CarregarDespesas();
      } else {
        mostrarPopup("Erro: " + (result.message || "Falha na exclusão"), true);
      }
    } catch (error) {
      mostrarPopup("Erro na requisição", true);
      console.error(error);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  CarregarDespesas();
  document
    .getElementById("data-inicio")
    .addEventListener("change", CarregarDespesas);
  document
    .getElementById("data-fim")
    .addEventListener("change", CarregarDespesas);
});

function mostrarPopup(msg, erro = false) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const box = document.createElement("div");
  box.className = erro ? "popup-box error" : "popup-box success";
  box.innerText = msg;

  const closeBtn = document.createElement("button");
  closeBtn.className = "popup-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => overlay.remove();

  box.appendChild(closeBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  setTimeout(() => overlay.remove(), 3000);
}
function mostrarConfirmacao(msg, onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const box = document.createElement("div");
  box.className = "popup-box confirm";

  const texto = document.createElement("p");
  texto.innerText = msg;
  box.appendChild(texto);

  const btnSim = document.createElement("button");
  btnSim.className = "popup-btn yes";
  btnSim.innerText = "Sim";
  btnSim.onclick = () => {
    overlay.remove();
    onConfirm();
  };

  const btnNao = document.createElement("button");
  btnNao.className = "popup-btn no";
  btnNao.innerText = "Não";
  btnNao.onclick = () => overlay.remove();

  box.appendChild(btnSim);
  box.appendChild(btnNao);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search input");
  const table = document.getElementById("data-table");

  searchInput.addEventListener("keyup", function () {
    const filtro = searchInput.value.toLowerCase();

    // pega todas as linhas atuais do tbody
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const recebedorCell = row.cells[0]; // primeira coluna é Pagador
      if (recebedorCell) {
        const texto = recebedorCell.textContent.toLowerCase();
        row.style.display = texto.includes(filtro) ? "" : "none";
      }
    });
  });
});
