const express = require("express");
const multer = require("multer");
const pool = require("../db/pool");
const { extractAssetCodeFromImage } = require("../services/ocrService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /assets
 * Registers a new asset (Module 3), and creates a matching asset_tags
 * row so the same code can be looked up as a "barcode value" too.
 * Body: { assetCode, name, make, model, serialNumber, category,
 *         departmentId, locationId, condition }
 */
router.post("/assets", async (req, res) => {
  const {
    assetCode,
    name,
    make,
    model,
    serialNumber,
    category,
    departmentId,
    locationId,
    condition,
  } = req.body;

  if (!assetCode || !name) {
    return res.status(400).json({ error: "assetCode and name are required." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO assets
        (asset_code, name, make, model, serial_number, category, department_id, location_id, asset_condition)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assetCode,
        name,
        make || null,
        model || null,
        serialNumber || null,
        category || null,
        departmentId || null,
        locationId || null,
        condition || "new",
      ]
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

/**
 * GET /assets/:assetCode
 * Fetches a single asset by its asset_code.
 */
router.get("/assets/:assetCode", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM assets WHERE asset_code = ?", [
    req.params.assetCode,
  ]);
  if (rows.length === 0) {
    return res.status(404).json({ error: "Asset not found." });
  }
  return res.json(rows[0]);
});

/**
 * POST /assets/search
 * Manual asset code lookup (Module 6, Option A).
 * Body: { assetCode }
 */
router.post("/assets/search", async (req, res) => {
  const { assetCode } = req.body;
  if (!assetCode) {
    return res.status(400).json({ error: "assetCode is required." });
  }

  const [rows] = await pool.query("SELECT * FROM assets WHERE asset_code = ?", [assetCode]);
  if (rows.length === 0) {
    return res.status(404).json({ error: "Asset not found." });
  }
  return res.json(rows[0]);
});

/**
 * POST /assets/ocr
 * Image upload + OCR extraction, then lookup against asset_tags.barcode_value
 * (falling back to assets.asset_code) — Module 6, Option B.
 * Expects multipart/form-data with a field named "image".
 */
router.post("/assets/ocr", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded." });
  }

  try {
    const { rawText, extractedCode } = await extractAssetCodeFromImage(req.file.buffer);

    if (!extractedCode) {
      return res.status(422).json({
        error: "Could not extract an asset code from the image.",
        rawText,
      });
    }

    const [rows] = await pool.query(
      `SELECT a.* FROM assets a
       LEFT JOIN asset_tags t ON t.asset_id = a.asset_id
       WHERE a.asset_code = ? OR t.barcode_value = ?
       LIMIT 1`,
      [extractedCode, extractedCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Asset not found.",
        extractedCode,
        rawText,
      });
    }

    return res.json({ extractedCode, rawText, asset: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OCR processing failed." });
  }
});

module.exports = router;
