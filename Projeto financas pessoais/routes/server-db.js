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

const receivesRoutes = require("./receives-db")(pool);
const expensesRoutes = require("./expenses-db")(pool);
const authRoutes = require("./auth-db")(pool);
app.use("/receives", receivesRoutes);
app.use("/expenses", expensesRoutes);
app.use("/login", authRoutes);

// inicializa servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
