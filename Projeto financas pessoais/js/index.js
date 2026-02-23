// ---------------------------
// Função de notificação estilo app
// ---------------------------
function mostrarNotificacao(msg, tipo = "success") {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const box = document.createElement("div");
  box.className = `popup-box ${tipo}`;
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

function loginSucesso(msg) {
  mostrarNotificacao(msg, "success");
}
function loginErro(msg) {
  mostrarNotificacao(msg, "error");
}

// ---------------------------
// Evento de submit do login
// ---------------------------
document.getElementById("login-card").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailLog").value.trim();
  const senha = document.getElementById("senhaLog").value.trim();

  if (!email || !senha) {
    loginErro("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const result = await response.json();

    if (response.ok) {
      loginSucesso(result.message);
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("token", result.token);

      // Redireciona após 1,5s para mostrar popup
      setTimeout(() => {
        window.location.href = "html/dash.html";
      }, 1500);
    } else {
      console.log("Senha digitada:", senha);
      loginErro(result.message);
    }
  } catch (error) {
    console.error(error);
    loginErro("Erro na requisição");
  }
});
