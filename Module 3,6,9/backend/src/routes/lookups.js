const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/departments", async (_req, res) => {
  const [rows] = await pool.query("SELECT department_id, name FROM departments ORDER BY name");
  res.json(rows);
});

router.get("/locations", async (_req, res) => {
  const [rows] = await pool.query("SELECT location_id, name, department_id FROM locations ORDER BY name");
  res.json(rows);
});

module.exports = router;
