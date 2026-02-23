// expenses-db.js - ajustado para dash.js
const express = require("express");
const router = express.Router();

module.exports = (pool) => {
  // POST - inserir despesa
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
        recebedor || "",
        valor || 0,
        data_vencimento || null,
        data_pagamento || null,
        categoria || "",
        descricao || "",
        status || "Pendente",
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

  // GET - listar despesas filtrando por periodo (dt_venc)
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
        return res.status(500).json({ error: "Erro interno ao consultar despesas" });
      }

      const formattedResults = results.map((r) => ({
        id: r.id,
        dt_lanc: r.dt_lanc,
        recebedor: r.recebedor || "",
        valor: parseFloat(r.valor) || 0,
        dt_venc: r.dt_venc ? r.dt_venc.toISOString().split("T")[0] : null,
        dt_pagam: r.dt_pagam ? r.dt_pagam.toISOString().split("T")[0] : null,
        categ: r.categ || "",
        descri: r.descri || "",
        status: r.status || "Pendente",
      }));

      res.json(formattedResults);
    });
  });

  // PUT - atualizar despesa
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
        recebedor || "",
        valor || 0,
        data_vencimento || null,
        data_pagamento || null,
        categoria || "",
        descricao || "",
        status || "Pendente",
        id,
      ],
      (err) => {
        if (err) {
          console.error("Erro ao atualizar despesa:", err);
          return res.status(500).json({ message: "Erro ao atualizar" });
        }
        res.json({ message: "Despesa atualizada com sucesso!" });
      },
    );
  });

  // DELETE - excluir despesa
  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM expenses WHERE id = ?";

    pool.query(sql, [id], (err) => {
      if (err) {
        console.error("Erro ao excluir despesa:", err);
        return res.status(500).json({ message: "Erro ao excluir" });
      }
      res.json({ message: "Despesa excluída com sucesso!" });
    });
  });

  return router;
};