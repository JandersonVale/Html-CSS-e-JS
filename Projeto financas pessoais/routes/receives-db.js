// receives-db.js
const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  // POST - inserir receita
  router.post("/", (req, res) => {
    const {
      pagador,
      valor,
      data_prevista,
      data_recebimento,
      categoria,
      descricao,
      status,
    } = req.body;

    const sql = `
      INSERT INTO receives (pagador, valor, dt_prev, dt_receb, categ, descri, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(
      sql,
      [
        pagador,
        valor,
        data_prevista,
        data_recebimento,
        categoria,
        descricao,
        status,
      ],
      (err, result) => {
        if (err) {
          console.error("Erro ao inserir receita:", err);
          return res.status(500).json({ message: "Erro ao cadastrar" });
        }
        res.json({ message: "Receita cadastrada com sucesso!" });
      },
    );
  });

  // GET - listar receitas
  router.get("/", (req, res) => {
    const { inicio, fim } = req.query;

    let sql = `
      SELECT id, dt_lanc, pagador, valor, dt_prev, dt_receb, categ, descri, status
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
        return res.status(500).json({
          error: "Erro interno ao consultar receitas",
        });
      }
      res.json(results);
    });
  });

  // PUT - atualizar receita
  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const {
      pagador,
      valor,
      data_prevista,
      data_recebimento,
      categoria,
      descricao,
      status,
    } = req.body;

    const sql = `
      UPDATE receives
      SET pagador = ?, valor = ?, dt_prev = ?, dt_receb = ?, categ = ?, descri = ?, status = ?
      WHERE id = ?
    `;

    pool.query(
      sql,
      [
        pagador,
        valor,
        data_prevista,
        data_recebimento,
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
    const sql = "DELETE FROM receives WHERE id = ?";

    pool.query(sql, [id], (err) => {
      if (err) {
        console.error("Erro ao excluir receita:", err);
        return res.status(500).json({ message: "Erro ao excluir" });
      }
      res.json({ message: "Receita excluída com sucesso!" });
    });
  });

  return router;
};
