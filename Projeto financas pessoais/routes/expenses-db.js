// receives-db.js
const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  // POST - inserir receita
  router.post("/", (req, res) => {
    const {
      recebedor,
      valor,
      data_vencimento,
      data_pagamento,
      categoria,
      descricao,
      status,
    } = req.body;

    const sql = `
      INSERT INTO expenses (recebedor, valor, dt_venc, dt_pagam, categ, descri, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(
      sql,
      [
        recebedor,
        valor,
        data_vencimento,
        data_pagamento,
        categoria,
        descricao,
        status,
      ],
      (err, result) => {
        if (err) {
          console.error("Erro ao inserir despesa:", err);
          return res.status(500).json({ message: "Erro ao cadastrar" });
        }
        res.json({ message: "Despesa cadastrada com sucesso!" });
      },
    );
  });

  // GET - listar receitas
  router.get("/", (req, res) => {
    const { inicio, fim } = req.query;

    let sql = `
      SELECT id, dt_lanc, recebedor, valor, dt_venc, dt_pagam, categ, descri, status
      FROM expenses
      WHERE 1=1
    `;
    const params = [];

    if (inicio) {
      sql += " AND dt_venc >= ?";
      params.push(inicio);
    }

    if (fim) {
      sql += " AND dt_venc <= ?";
      params.push(fim);
    }

    sql += " ORDER BY dt_lanc DESC";

    pool.query(sql, params, (err, results) => {
      if (err) {
        console.error("Erro ao consultar despesas:", err);
        return res.status(500).json({
          error: "Erro interno ao consultar despesas",
        });
      }
      res.json(results);
    });
  });

  // PUT - atualizar receita
  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const {
      recebedor,
      valor,
      data_vencimento,
      data_pagamento,
      categoria,
      descricao,
      status,
    } = req.body;

    const sql = `
      UPDATE expenses
      SET recebedor = ?, valor = ?, dt_venc = ?, dt_pagam = ?, categ = ?, descri = ?, status = ?
      WHERE id = ?
    `;

    pool.query(
      sql,
      [
        recebedor,
        valor,
        data_vencimento,
        data_pagamento,
        categoria,
        descricao,
        status,
        id,
      ],
      (err) => {
        if (err) {
          console.error("Erro ao atualizar receita:", err);
          return res.status(500).json({ message: "Erro ao atualizar" });
        }
        res.json({ message: "Receita atualizada com sucesso!" });
      },
    );
  });

  // DELETE - excluir receita
  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM expenses WHERE id = ?";

    pool.query(sql, [id], (err) => {
      if (err) {
        console.error("Erro ao excluir despesa:", err);
        return res.status(500).json({ message: "Erro ao excluir" });
      }
      res.json({ message: "despesa excluída com sucesso!" });
    });
  });

  return router;
};
