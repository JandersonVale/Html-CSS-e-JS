const express = require("express");
const router = express.Router();

// Recebe o pool do MySQL
module.exports = (pool) => {
  // POST /login
  router.post("/", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: "Email e senha são obrigatórios" });
    }

    pool.query(
      "SELECT * FROM users WHERE email = ? AND ativo = 1",
      [email],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erro no servidor" });
        }

        if (results.length === 0) {
          return res.status(401).json({ message: "Usuário não encontrado" });
        }

        const user = results[0];

        // 🔹 Comparação direta (SEM bcrypt)
        if (senha !== user.senha) {
          return res.status(401).json({ message: "Senha incorreta" });
        }

        // Login OK
        res.json({
          message: "Login realizado com sucesso",
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            grupo: user.grupo,
          },
        });
      },
    );
  });

  return router;
};
