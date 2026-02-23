// arquivo: create-db.js
require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true,
});

const sql = `
CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};
USE ${process.env.DB_NAME};

-- Tabela receives
CREATE TABLE IF NOT EXISTS receives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dt_lanc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pagador VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  dt_prev DATE,
  dt_receb DATE,
  categ VARCHAR(50),
  descri VARCHAR(50),
  status VARCHAR(50)
);

-- Tabela expenses
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dt_lanc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recebedor VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  dt_venc DATE,
  dt_pagam DATE,
  categ VARCHAR(50),
  descri VARCHAR(50),
  status VARCHAR(50)
);

-- Tabela users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(50) NOT NULL,
  grupo VARCHAR(30),
  ativo INT(1) DEFAULT 1
);
`;



connection.query(sql, (err) => {
  if (err) {
    console.error("Erro ao criar banco/tabelas:", err);
    connection.end();
    return;
  }

  console.log(`Banco ${process.env.DB_NAME} e tabelas criados com sucesso!`);

  connection.query("SELECT COUNT(*) AS total FROM users", (err, results) => {
    if (err) {
      console.error("Erro ao verificar tabela users:", err);
      connection.end();
      return;
    }

    if (results[0].total === 0) {
      const insertSql = `
        INSERT INTO users (nome, email, senha, grupo, ativo)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = ["admin", "admin@admin.com", "123", "Administrador", 1];

      connection.query(insertSql, values, (err) => {
        if (err) {
          console.error("Erro ao inserir usuário admin:", err);
        } else {
          console.log("Usuário admin criado com sucesso!");
        }
        connection.end();
      });
    } else {
      console.log("Tabela users já possui registros, não foi inserido admin.");
      connection.end();
    }
  });
});
