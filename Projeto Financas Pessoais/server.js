const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com banco
const db = new sqlite3.Database("./database.sqlite");

// Criação de tabelas
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS receitas (id INTEGER PRIMARY KEY AUTOINCREMENT, valor REAL NOT NULL, vencimento DATE, descricao TEXT, recebedor TEXT, pagador TEXT, categoria TEXT, status TEXT, forma_pagamento TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS despesas (id INTEGER PRIMARY KEY AUTOINCREMENT, valor REAL NOT NULL, vencimento DATE, descricao TEXT, recebedor TEXT, pagador TEXT, categoria TEXT, status TEXT, forma_pagamento TEXT)");
});

// Rotas API

// Listar contas
app.get("/despesas", (req, res) => {
  db.all("SELECT * FROM despesas WHERE status = 'A Vencer' ", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.get('/resumo', (req, res) => {
  db.get("SELECT SUM(valor) AS total_receitas FROM receitas", (err, recRow) => {
    if (err) return res.status(500).send(err);

    db.get("SELECT SUM(valor) AS total_despesas FROM despesas", (err, despRow) => {
      if (err) return res.status(500).send(err);

      const receitas = recRow.total_receitas || 0;
      const despesas = despRow.total_despesas || 0;
      const resumo = receitas - despesas;

      res.json({ receitas, despesas, resumo });
    });
  });
});

app.get('/categorias-despesa', (req, res) => {
  db.all(
    "SELECT categoria, SUM(valor) AS total FROM despesas GROUP BY categoria ORDER BY total DESC",
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    }
  );
});



app.listen(3000, () => console.log("Servidor rodando na porta 3000"));