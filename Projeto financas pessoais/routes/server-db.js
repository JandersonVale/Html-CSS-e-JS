// arquivo: server-db.js
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // importante para ler req.body
app.use(cors()); // permite chamadas do front

// pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// rota GET para listar usuários ativos
app.get("/users", (req, res) => {
  const sql = "SELECT id, nome, email, grupo FROM users WHERE ativo = 1";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao consultar usuários:", err);
      res.status(500).json({ error: "Erro interno ao consultar usuários" });
    } else if (results.length === 0) {
      res
        .status(401)
        .json({ error: "Não autorizado: nenhum usuário ativo encontrado" });
    } else {
      res.json(results);
    }
  });
});

// rota POST para inserir receita
app.post("/receives", (req, res) => {
  const { pagador, valor, data_prevista, data_recebimento, categoria, status } =
    req.body;

  const sql = `
    INSERT INTO receives (pagador, valor, dt_prev, dt_receb, categ, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  pool.query(
    sql,
    [pagador, valor, data_prevista, data_recebimento, categoria, status],
    (err, result) => {
      if (err) {
        console.error("Erro ao inserir receita:", err);
        return res.status(500).json({ message: "Erro ao cadastrar" });
      }
      res.json({ message: "Receita cadastrada com sucesso!" });
    },
  );
});
app.get("/receives", (req, res) => {
  const { inicio, fim } = req.query; // datas enviadas pelo front

  let sql = `
    SELECT id, dt_lanc, pagador, valor, dt_prev, dt_receb, categ, status
    FROM receives
    WHERE 1=1
  `;
  const params = [];

  if (inicio) {
    sql += " AND dt_prev >= ?";
    params.push(inicio);
  }
  if (fim) {
    sql += " AND dt_prev <= ?";
    params.push(fim);
  }

  sql += " ORDER BY dt_lanc DESC";

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erro ao consultar receitas:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao consultar receitas" });
    }
    res.json(results);
  });
});

// rota PUT para editar receita
app.put("/receives/:id", (req, res) => {
  const { id } = req.params;
  const { pagador, valor, data_prevista, data_recebimento, categoria, status } =
    req.body;

  const sql = `
    UPDATE receives
    SET pagador = ?, valor = ?, dt_prev = ?, dt_receb = ?, categ = ?, status = ?
    WHERE id = ?
  `;

  pool.query(
    sql,
    [pagador, valor, data_prevista, data_recebimento, categoria, status, id],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar receita:", err);
        return res.status(500).json({ message: "Erro ao atualizar" });
      }
      res.json({ message: "Receita atualizada com sucesso!" });
    },
  );
});

// rota DELETE para excluir receita
app.delete("/receives/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM receives WHERE id = ?";
  pool.query(sql, [id], (err) => {
    if (err) {
      console.error("Erro ao excluir receita:", err);
      return res.status(500).json({ message: "Erro ao excluir" });
    }
    res.json({ message: "Receita excluída com sucesso!" });
  });
});

// inicializa servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
