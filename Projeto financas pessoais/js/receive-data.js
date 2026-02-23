async function carregarReceitas() {
  const inicio = document.getElementById("data-inicio").value;
  const fim = document.getElementById("data-fim").value;

  try {
    const url = new URL("http://localhost:3000/receives");
    if (inicio) url.searchParams.append("inicio", inicio);
    if (fim) url.searchParams.append("fim", fim);

    const response = await fetch(url);
    const receitas = await response.json();

    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";

    receitas.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.pagador}</td>
        <td>R$ ${parseFloat(r.valor).toFixed(2)}</td>
        <td>${r.dt_prev ? new Date(r.dt_prev).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${r.dt_receb ? new Date(r.dt_receb).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${r.categ}</td>
        <td>${r.descri}</td>
        <td>${r.status}</td>
        <td>
          <button class="action-btn edit-btn" onclick="abrirModal(${r.id}, '${r.pagador}', ${r.valor}, '${r.dt_prev}', '${r.dt_receb}', '${r.categ}', '${r.descri}', '${r.status}')">
            <i class="fa fa-edit"></i> Editar
          </button>
          <button class="action-btn delete-btn" onclick="excluirReceita(${r.id})">
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

function abrirModal(id, pagador, valor, dtPrev, dtRec, categ, descri, status) {
  document.getElementById("editPagador").value = pagador;
  document.getElementById("editValor").value = valor;
  document.getElementById("editDataPrev").value = dtPrev
    ? dtPrev.split("T")[0]
    : "";
  document.getElementById("editDataRec").value = dtRec
    ? dtRec.split("T")[0]
    : "";
  document.getElementById("editCateg").value = categ;
  document.getElementById("editDescricao").value = descri;
  document.getElementById("editStatus").value = status;

  document.getElementById("editModal").dataset.id = id;
  document.getElementById("editModal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("editModal").style.display = "none";
}

async function salvarEdicao() {
  const id = document.getElementById("editModal").dataset.id;

  const dados = {
    pagador: document.getElementById("editPagador").value.trim(),
    valor: document.getElementById("editValor").value.trim(),
    data_prevista: document.getElementById("editDataPrev").value.trim(),
    data_recebimento: document.getElementById("editDataRec").value.trim(),
    categoria: document.getElementById("editCateg").value.trim(),
    descricao: document.getElementById("editDescricao").value.trim(),
    status: document.getElementById("editStatus").value.trim(),
  };

  if (
    !dados.pagador ||
    !dados.valor ||
    !dados.data_prevista ||
    !dados.data_recebimento ||
    !dados.categoria ||
    !dados.descricao ||
    !dados.status
  ) {
    mostrarPopup("Preencha todos os campos antes de cadastrar", true);
    return; // interrompe o envio
  }

  try {
    const response = await fetch(`http://localhost:3000/receives/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (response.ok) {
      mostrarPopup("Registro atualizado com sucesso");
      fecharModal();
      carregarReceitas();
    } else {
      mostrarPopup("Erro: " + (result.message || "Falha na atualização"), true);
    }
  } catch (error) {
    mostrarPopup("Erro na requisição", true);
    console.error(error);
  }
}

function excluirReceita(id) {
  mostrarConfirmacao("Deseja realmente excluir esta receita?", async () => {
    try {
      const response = await fetch(`http://localhost:3000/receives/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok) {
        mostrarPopup("Registro excluído com sucesso");
        carregarReceitas();
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
  carregarReceitas();
  document
    .getElementById("data-inicio")
    .addEventListener("change", carregarReceitas);
  document
    .getElementById("data-fim")
    .addEventListener("change", carregarReceitas);
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
      const pagadorCell = row.cells[0]; // primeira coluna é Pagador
      if (pagadorCell) {
        const texto = pagadorCell.textContent.toLowerCase();
        row.style.display = texto.includes(filtro) ? "" : "none";
      }
    });
  });
});
