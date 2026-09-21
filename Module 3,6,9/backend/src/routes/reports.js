const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /reports/summary
 * Basic reporting on active vs disposed assets (Week 3 commitment).
 * Requires login (any role) — this is read-only, so no permission
 * check beyond being an authenticated user.
 */
router.get("/reports/summary", requireAuth, async (_req, res) => {
  const [[statusCounts], [categoryCounts], [departmentCounts], [disposalCounts]] =
    await Promise.all([
      pool.query(
        `SELECT status, COUNT(*) AS count FROM assets GROUP BY status ORDER BY count DESC`
      ),
      pool.query(
        `SELECT category, COUNT(*) AS count FROM assets GROUP BY category ORDER BY count DESC`
      ),
      pool.query(
        `SELECT d.name AS department, COUNT(*) AS count
         FROM assets a JOIN departments d ON d.department_id = a.department_id
         GROUP BY d.name ORDER BY count DESC`
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count FROM disposal_requests GROUP BY status ORDER BY count DESC`
      ),
    ]);

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM assets`);

  let disposalByType = [];
  try {
    const [typeRows] = await pool.query(
      `SELECT COALESCE(request_type, 'disposal') AS request_type, COUNT(*) AS count, SUM(COALESCE(book_value, 0)) AS total_value FROM disposal_requests GROUP BY request_type`
    );
    disposalByType = typeRows;
  } catch (_err) {
    // Graceful fallback if migration not yet applied
  }

  res.json({
    totalAssets: total,
    byStatus: statusCounts,
    byCategory: categoryCounts,
    byDepartment: departmentCounts,
    disposalByStatus: disposalCounts,
    disposalByType: disposalByType,
  });
});

module.exports = router;
