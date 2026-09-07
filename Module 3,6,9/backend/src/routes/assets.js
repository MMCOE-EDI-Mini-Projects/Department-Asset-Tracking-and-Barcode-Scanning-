const express = require("express");
const multer = require("multer");
const pool = require("../db/pool");
const { extractAssetCodeFromImage } = require("../services/ocrService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /assets
 * Registers a new asset (Module 3).
 * category, make, model, serialNumber, departmentId, locationId required.
 * purchaseDate is optional.
 */
router.post("/assets", async (req, res) => {
  const {
    assetCode, name, make, model, serialNumber, category,
    departmentId, locationId, condition, purchaseDate,
  } = req.body;

  const missing = [];
  if (!assetCode) missing.push("assetCode");
  if (!name) missing.push("name");
  if (!category) missing.push("category");
  if (!make) missing.push("make");
  if (!model) missing.push("model");
  if (!serialNumber) missing.push("serialNumber");
  if (!departmentId) missing.push("departmentId");
  if (!locationId) missing.push("locationId");

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO assets
        (asset_code, name, make, model, serial_number, category, department_id, location_id, asset_condition, purchase_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [assetCode, name, make, model, serialNumber, category, departmentId, locationId, condition || "new", purchaseDate || null]
    );

    const assetId = result.insertId;

    await conn.query(
      `INSERT INTO asset_tags (asset_id, barcode_value, tag_status) VALUES (?, ?, 'applied')`,
      [assetId, assetCode]
    );

    await conn.commit();

    const [rows] = await pool.query("SELECT * FROM assets WHERE asset_id = ?", [assetId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Asset code or serial number already exists." });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to register asset." });
  } finally {
    conn.release();
  }
});

router.get("/assets/:assetCode", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM assets WHERE asset_code = ?", [req.params.assetCode]);
  if (rows.length === 0) return res.status(404).json({ error: "Asset not found." });
  return res.json(rows[0]);
});

router.post("/assets/search", async (req, res) => {
  const { assetCode } = req.body;
  if (!assetCode) return res.status(400).json({ error: "assetCode is required." });

  const [rows] = await pool.query("SELECT * FROM assets WHERE asset_code = ?", [assetCode]);
  if (rows.length === 0) return res.status(404).json({ error: "Asset not found." });
  return res.json(rows[0]);
});

/**
 * POST /assets/ocr
 * Week 3: improved preprocessing/config in ocrService for reliability.
 */
router.post("/assets/ocr", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded." });

  try {
    const { rawText, extractedCode, confidence } = await extractAssetCodeFromImage(req.file.buffer);

    if (!extractedCode) {
      return res.status(422).json({ error: "Could not extract an asset code from the image.", rawText, confidence });
    }

    const [rows] = await pool.query(
      `SELECT a.* FROM assets a
       LEFT JOIN asset_tags t ON t.asset_id = a.asset_id
       WHERE a.asset_code = ? OR t.barcode_value = ?
       LIMIT 1`,
      [extractedCode, extractedCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Asset not found.", extractedCode, rawText, confidence });
    }

    return res.json({ extractedCode, rawText, confidence, asset: rows[0] });
  } catch (err) {
    console.error(err);
    const isNetworkIssue = /network|fetch|ENOTFOUND|403|404/i.test(String(err.message || err));
    return res.status(503).json({
      error: isNetworkIssue
        ? "OCR is temporarily unavailable (couldn't reach its language-data source — check internet access). Manual code entry still works."
        : "OCR processing failed. Manual code entry still works.",
    });
  }
});

module.exports = router;
