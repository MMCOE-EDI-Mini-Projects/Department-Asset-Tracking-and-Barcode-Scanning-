const express = require("express");
const pool = require("../db/pool");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /disposal
 * Anyone can RAISE a request — no auth required here, matching how
 * staff without an account should still be able to flag an asset
 * for disposal or write-off. Approval is the gated step (see below).
 */
router.post("/disposal", async (req, res) => {
  const { assetCode, reason, disposalMethod, requestedBy, remarks, requestType, bookValue } = req.body;

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

  if (asset.status === "disposed" || asset.status === "written_off") {
    return res.status(409).json({ error: `This asset has already been ${asset.status.replace("_", " ")}.` });
  }

  const type = requestType === "write_off" ? "write_off" : "disposal";
  const bookVal = bookValue !== undefined && bookValue !== "" ? parseFloat(bookValue) : null;

  const [result] = await pool.query(
    `INSERT INTO disposal_requests (asset_id, reason, disposal_method, requested_by, status, remarks, request_type, book_value)
     VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`,
    [asset.asset_id, reason, disposalMethod, requestedBy, remarks || null, type, bookVal]
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
 * Requires login AND the approve_disposal permission
 * (dept_head, or asset_admin via "all": true). approvedBy is taken
 * from the authenticated user.
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
 * Finalizing physical disposal - sets request status to 'disposed' and asset status to 'disposed'.
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

/**
 * PATCH /disposal/:id/write-off
 * Finalizing financial write-off - sets request status to 'written_off' and asset status to 'written_off'.
 * Requires login AND approve_disposal permission. Must be approved first and must be of request_type 'write_off'.
 */
router.patch("/disposal/:id/write-off", requireAuth, requirePermission("approve_disposal"), async (req, res) => {
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
      return res.status(409).json({ error: "Request must be approved before it can be written off." });
    }
    if (existing[0].request_type !== "write_off") {
      await conn.rollback();
      return res.status(409).json({ error: "Only write-off requests can be finalized as written off." });
    }

    await conn.query(
      `UPDATE disposal_requests SET status = 'written_off', write_off_date = NOW() WHERE request_id = ?`,
      [id]
    );
    await conn.query(`UPDATE assets SET status = 'written_off' WHERE asset_id = ?`, [existing[0].asset_id]);

    await conn.commit();

    const [rows] = await pool.query("SELECT * FROM disposal_requests WHERE request_id = ?", [id]);
    return res.json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: "Failed to finalize write-off." });
  } finally {
    conn.release();
  }
});

module.exports = router;
