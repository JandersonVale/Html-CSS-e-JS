const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const dados = {
    recebedor: document.getElementById("editRecebedor").value.trim(),
    valor: document.getElementById("editValorDes").value.trim(),
    data_vencimento: document.getElementById("editDataVenc").value.trim(),
    data_pagamento: document.getElementById("editDataPag").value.trim(),
    categoria: document.getElementById("editCategDes").value.trim(),
    descricao: document.getElementById("editDescricaoDes").value.trim(),
    status: document.getElementById("statusDes").value.trim(),
  };

  // validação simples: se algum campo estiver vazio
  if (
    !dados.recebedor ||
    !dados.valor ||
    !dados.data_vencimento ||
    !dados.data_pagamento ||
    !dados.categoria ||
    !dados.descricao ||
    !dados.status
  ) {
    mostrarPopup("Preencha todos os campos antes de cadastrar", true);
    return; // interrompe o envio
  }

  try {
    const response = await fetch("http://localhost:3000/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (response.ok) {
      form.reset();
      mostrarPopup(result.message); // sucesso
    } else {
      mostrarPopup("Erro: " + result.message, true); // erro
    }
  } catch (error) {
    mostrarPopup("Erro na requisição", true);
    console.error(error);
  }
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
