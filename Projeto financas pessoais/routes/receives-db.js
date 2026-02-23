// receives-db.js - ajustado para dash.js
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
        data_prevista || null,
        data_recebimento || null,
        categoria || null,
        descricao || null,
        status || "Pendente",
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

  // GET - listar receitas filtrando por periodo (dt_prev)
  router.get("/", (req, res) => {
    const { inicio, fim } = req.query;

    let sql = `
      SELECT id, dt_lanc, pagador, valor, dt_prev, dt_receb, categ, descri, status
      FROM receives
      WHERE 1=1
    `;
    const params = [];

    // Filtro por data inicial
    if (inicio) {
      sql += " AND dt_prev >= ?";
      params.push(inicio);
    }

    // Filtro por data final
    if (fim) {
      sql += " AND dt_prev <= ?";
      params.push(fim);
    }

    sql += " ORDER BY dt_lanc DESC";

    pool.query(sql, params, (err, results) => {
      if (err) {
        console.error("Erro ao consultar receitas:", err);
        return res.status(500).json({ error: "Erro interno ao consultar receitas" });
      }

      // Garante que datas nulas não quebrem o front
      const formattedResults = results.map(r => ({
        id: r.id,
        dt_lanc: r.dt_lanc,
        pagador: r.pagador,
        valor: parseFloat(r.valor) || 0,
        dt_prev: r.dt_prev ? r.dt_prev.toISOString().split("T")[0] : null,
        dt_receb: r.dt_receb ? r.dt_receb.toISOString().split("T")[0] : null,
        categ: r.categ || "",
        descri: r.descri || "",
        status: r.status || "Pendente"
      }));

      res.json(formattedResults);
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
        data_prevista || null,
        data_recebimento || null,
        categoria || null,
        descricao || null,
        status || "Pendente",
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