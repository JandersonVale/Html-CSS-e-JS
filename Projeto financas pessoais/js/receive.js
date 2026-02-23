const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const dados = {
    pagador: document.getElementById("editPagador").value.trim(),
    valor: document.getElementById("editValor").value.trim(),
    data_prevista: document.getElementById("editDataPrev").value.trim(),
    data_recebimento: document.getElementById("editDataRec").value.trim(),
    categoria: document.getElementById("editCateg").value.trim(),
    descricao: document.getElementById("editDescricao").value.trim(),
    status: document.getElementById("status").value.trim(),
  };

  // validação simples ajustada
if (
  !dados.pagador ||
  !dados.valor ||
  !dados.data_prevista ||
  !dados.categoria ||
  !dados.descricao ||
  !dados.status
) {
  mostrarPopup("Preencha todos os campos obrigatórios antes de cadastrar", true);
  return; // interrompe o envio
}

// Se data_recebimento estiver vazia, define null
if (!dados.data_recebimento) {
  dados.data_recebimento = null;
}

  try {
    const response = await fetch("http://localhost:3000/receives", {
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
