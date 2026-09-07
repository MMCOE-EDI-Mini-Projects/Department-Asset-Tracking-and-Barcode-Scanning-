const express = require("express");
const pool = require("../db/pool");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /disposal
 * Anyone can RAISE a request — no auth required here, matching how
 * staff without an account should still be able to flag an asset
 * for disposal. Approval is the gated step (see below).
 */
router.post("/disposal", async (req, res) => {
  const { assetCode, reason, disposalMethod, requestedBy, remarks } = req.body;

  const missing = [];
  if (!assetCode) missing.push("assetCode");
  if (!reason) missing.push("reason");
  if (!disposalMethod) missing.push("disposalMethod");
  if (!requestedBy) missing.push("requestedBy");
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  const [assetRows] = await pool.query("SELECT * FROM assets WHERE asset_code = ?", [assetCode]);
  if (assetRows.length === 0) return res.status(404).json({ error: "Asset not found." });
  const asset = assetRows[0];

  if (asset.status === "disposed") {
    return res.status(409).json({ error: "This asset has already been disposed." });
  }

  const [result] = await pool.query(
    `INSERT INTO disposal_requests (asset_id, reason, disposal_method, requested_by, status, remarks)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
    [asset.asset_id, reason, disposalMethod, requestedBy, remarks || null]
  );

  const [rows] = await pool.query("SELECT * FROM disposal_requests WHERE request_id = ?", [result.insertId]);
  return res.status(201).json(rows[0]);
});

/**
 * GET /disposal
 * Viewing the list is read-only — requires login, any role.
 */
router.get("/disposal", requireAuth, async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT dr.*, a.asset_code, a.name AS asset_name, a.status AS asset_status
     FROM disposal_requests dr
     JOIN assets a ON a.asset_id = dr.asset_id
     ORDER BY dr.request_date DESC`
  );
  return res.json(rows);
});

/**
 * PATCH /disposal/:id/approve
 * Week 3: now requires login AND the approve_disposal permission
 * (dept_head, or asset_admin via "all": true). approvedBy is taken
 * from the authenticated user, not a free-text field anymore —
 * you can't claim to be someone else once you're logged in.
 */
router.patch("/disposal/:id/approve", requireAuth, requirePermission("approve_disposal"), async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query("SELECT * FROM disposal_requests WHERE request_id = ?", [id]);
  if (existing.length === 0) return res.status(404).json({ error: "Disposal request not found." });
  if (existing[0].status !== "pending") {
    return res.status(409).json({ error: `Request is already ${existing[0].status}.` });
  }

  await pool.query(
    `UPDATE disposal_requests SET status = 'approved', approved_by = ?, approval_date = NOW() WHERE request_id = ?`,
    [req.user.name, id]
  );

  const [rows] = await pool.query("SELECT * FROM disposal_requests WHERE request_id = ?", [id]);
  return res.json(rows[0]);
});

/**
 * PATCH /disposal/:id/dispose
 * Week 3: same permission gate as approval — finalizing disposal is
 * as consequential as approving it, so it gets the same restriction.
 */
router.patch("/disposal/:id/dispose", requireAuth, requirePermission("approve_disposal"), async (req, res) => {
  const { id } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query("SELECT * FROM disposal_requests WHERE request_id = ?", [id]);
    if (existing.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Disposal request not found." });
    }
    if (existing[0].status !== "approved") {
      await conn.rollback();
      return res.status(409).json({ error: "Request must be approved before it can be disposed." });
    }

    await conn.query(`UPDATE disposal_requests SET status = 'disposed', disposal_date = NOW() WHERE request_id = ?`, [id]);
    await conn.query(`UPDATE assets SET status = 'disposed' WHERE asset_id = ?`, [existing[0].asset_id]);

    await conn.commit();

    const [rows] = await pool.query("SELECT * FROM disposal_requests WHERE request_id = ?", [id]);
    return res.json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: "Failed to finalize disposal." });
  } finally {
    conn.release();
  }
});

module.exports = router;
