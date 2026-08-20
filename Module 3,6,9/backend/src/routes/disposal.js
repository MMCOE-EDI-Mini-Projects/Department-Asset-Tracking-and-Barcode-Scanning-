const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

/**
 * POST /disposal
 * Creates a disposal request for an existing asset (Module 9).
 * Week 1 scope: the request is stored with status 'pending'.
 * Approval workflow is not implemented yet.
 * Body: { assetCode, reason, disposalMethod, requestedBy, remarks }
 */
router.post("/disposal", async (req, res) => {
  const { assetCode, reason, disposalMethod, requestedBy, remarks } = req.body;

  if (!assetCode) {
    return res.status(400).json({ error: "assetCode is required." });
  }

  const [assetRows] = await pool.query("SELECT * FROM assets WHERE asset_code = ?", [assetCode]);
  if (assetRows.length === 0) {
    return res.status(404).json({ error: "Asset not found." });
  }
  const asset = assetRows[0];

  const [result] = await pool.query(
    `INSERT INTO disposal_requests
      (asset_id, reason, disposal_method, requested_by, status, remarks)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
    [asset.asset_id, reason || null, disposalMethod || null, requestedBy || null, remarks || null]
  );

  const [rows] = await pool.query("SELECT * FROM disposal_requests WHERE request_id = ?", [
    result.insertId,
  ]);
  return res.status(201).json(rows[0]);
});

module.exports = router;
