"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const bwipjs = require("bwip-js");

const { query, withTransaction, nextCode, writeAudit } = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

// ---------------------------------------------------------------- uploads
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, UPLOAD_DIR),
        filename: (req, file, cb) => {
            const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
            cb(null, Date.now() + "-" + safe);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
        cb(ok.includes(file.mimetype) ? null : new Error("Only PDF, PNG or JPG files are accepted"), ok.includes(file.mimetype));
    }
});
app.use("/uploads", express.static(UPLOAD_DIR));

// ---------------------------------------------------------------- helpers
function wrap(handler) {
    return (req, res) => handler(req, res).catch((err) => {
        console.error(err);
        const duplicate = err && err.code === "ER_DUP_ENTRY";
        res.status(duplicate ? 409 : 500).json({
            ok: false,
            error: duplicate ? "That serial number is already registered." : (err.message || "Server error")
        });
    });
}

function blank(v) {
    return v === undefined || v === null || String(v).trim() === "";
}

function toNullableDate(v) {
    return blank(v) ? null : String(v).slice(0, 10);
}

// ---------------------------------------------------------------- metadata
app.get("/api/meta", wrap(async (req, res) => {
    const [categories, departments, locations, suppliers, receivingTypes, conditions, users] =
        await Promise.all([
            query("SELECT category_id, category_code, category_name, useful_life_years, depreciation_rate, requires_serial FROM categories WHERE is_active = 1 ORDER BY category_name"),
            query("SELECT department_id, dept_code, dept_name FROM departments WHERE is_active = 1 ORDER BY dept_name"),
            query("SELECT location_id, location_code, location_name, department_id FROM locations WHERE is_active = 1 ORDER BY location_name"),
            query("SELECT supplier_id, supplier_name FROM suppliers WHERE is_active = 1 ORDER BY supplier_name"),
            query("SELECT receiving_type_id, type_name, needs_invoice FROM receiving_types WHERE is_active = 1 ORDER BY sort_order"),
            query("SELECT condition_id, condition_name, blocks_usage FROM asset_conditions WHERE is_active = 1 ORDER BY sort_order"),
            query("SELECT user_id, full_name, role FROM users WHERE is_active = 1 ORDER BY full_name")
        ]);
    res.json({ ok: true, categories, departments, locations, suppliers, receivingTypes, conditions, users });
}));

// ------------------------------------------------- live serial number check
app.get("/api/assets/check-serial", wrap(async (req, res) => {
    const serial = String(req.query.serial || "").trim();
    if (!serial) return res.json({ ok: true, exists: false });
    const rows = await query(
        "SELECT asset_code FROM assets WHERE serial_number = ? AND is_deleted = 0 LIMIT 1",
        [serial]
    );
    res.json({ ok: true, exists: rows.length > 0, asset_code: rows.length ? rows[0].asset_code : null });
}));

// ---------------------------------------------------------------- register
app.post("/api/assets/register", wrap(async (req, res) => {
    const b = req.body || {};
    const errors = [];

    // ---- server-side validation (never trust the browser) ----
    if (blank(b.receivingTypeId)) errors.push("Receiving type is required.");
    if (blank(b.supplierName)) errors.push("Supplier or source is required.");
    if (blank(b.receiptDate)) errors.push("Receipt date is required.");
    if (blank(b.assetName)) errors.push("Asset name is required.");
    if (blank(b.categoryId)) errors.push("Category is required.");
    if (blank(b.conditionId)) errors.push("Asset condition is required.");
    if (blank(b.departmentId)) errors.push("Department is required.");
    if (blank(b.locationId)) errors.push("Initial location is required.");

    const quantity = Number(b.quantity || 0);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        errors.push("Quantity must be a whole number between 1 and 100.");
    }

    const today = new Date().toISOString().slice(0, 10);
    if (!blank(b.receiptDate) && b.receiptDate > today) errors.push("Receipt date cannot be in the future.");
    if (!blank(b.purchaseDate) && b.purchaseDate > today) errors.push("Purchase date cannot be in the future.");
    if (!blank(b.purchaseDate) && !blank(b.receiptDate) && b.purchaseDate > b.receiptDate) {
        errors.push("Purchase date cannot be after the receipt date.");
    }
    if (!blank(b.warrantyExpiry) && !blank(b.purchaseDate) && b.warrantyExpiry < b.purchaseDate) {
        errors.push("Warranty expiry cannot be before the purchase date.");
    }
    const unitCost = blank(b.purchaseCost) ? 0 : Number(b.purchaseCost);
    if (isNaN(unitCost) || unitCost < 0) errors.push("Purchase cost must be zero or more.");

    // one serial per unit, supplied as an array
    const serials = Array.isArray(b.serialNumbers)
        ? b.serialNumbers.map((s) => String(s || "").trim()).filter(Boolean)
        : [];
    if (serials.length > quantity) errors.push("More serial numbers were entered than the quantity received.");
    const dupes = serials.filter((s, i) => serials.indexOf(s) !== i);
    if (dupes.length) errors.push("Duplicate serial numbers in this entry: " + [...new Set(dupes)].join(", "));

    if (errors.length) return res.status(400).json({ ok: false, errors });

    // ---- referential + uniqueness checks ----
    if (serials.length) {
        const placeholders = serials.map(() => "?").join(",");
        const clash = await query(
            `SELECT serial_number, asset_code FROM assets
             WHERE serial_number IN (${placeholders}) AND is_deleted = 0`,
            serials
        );
        if (clash.length) {
            return res.status(409).json({
                ok: false,
                errors: clash.map((r) => `Serial ${r.serial_number} is already registered as ${r.asset_code}.`)
            });
        }
    }

    const cond = await query("SELECT condition_name, blocks_usage FROM asset_conditions WHERE condition_id = ?", [b.conditionId]);
    if (!cond.length) return res.status(400).json({ ok: false, errors: ["Unknown asset condition."] });

    const userId = Number(b.userId || 1);

    // Damaged / Poor items always go through approval, whatever the checkbox says.
    const requiresApproval = Boolean(b.requiresApproval) || cond[0].blocks_usage === 1;
    const status = requiresApproval ? "Pending Approval" : "Available";

    const result = await withTransaction(async (conn) => {
        const receiptCode = await nextCode(conn, "RECEIPT", "REC");
        const totalCost = +(unitCost * quantity).toFixed(2);

        const [recRes] = await conn.execute(
            `INSERT INTO receipts
                (receipt_code, receiving_type_id, supplier_id, supplier_name, invoice_number,
                 invoice_date, receipt_date, quantity, unit_cost, total_cost,
                 receiving_remarks, received_by)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                receiptCode,
                b.receivingTypeId,
                blank(b.supplierId) ? null : b.supplierId,
                String(b.supplierName).trim(),
                blank(b.invoiceNumber) ? null : String(b.invoiceNumber).trim(),
                toNullableDate(b.invoiceDate),
                toNullableDate(b.receiptDate),
                quantity,
                unitCost,
                totalCost,
                blank(b.receivingRemarks) ? null : b.receivingRemarks,
                userId
            ]
        );
        const receiptId = recRes.insertId;
        await writeAudit(conn, "RECEIPT", receiptId, "CREATE", null, null, receiptCode, userId);

        const created = [];
        for (let i = 0; i < quantity; i++) {
            const assetCode = await nextCode(conn, "ASSET", "AST");
            const serial = serials[i] || null;
            const qrPayload = JSON.stringify({
                code: assetCode,
                name: String(b.assetName).trim(),
                dept: b.departmentId,
                rec: receiptCode
            });

            const [aRes] = await conn.execute(
                `INSERT INTO assets
                    (asset_code, receipt_id, asset_name, category_id, manufacturer, model,
                     serial_number, condition_id, purchase_date, warranty_expiry, purchase_cost,
                     department_id, location_id, status, barcode_value, qr_payload, remarks,
                     requires_approval, registered_by)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    assetCode,
                    receiptId,
                    String(b.assetName).trim(),
                    b.categoryId,
                    blank(b.manufacturer) ? null : String(b.manufacturer).trim(),
                    blank(b.model) ? null : String(b.model).trim(),
                    serial,
                    b.conditionId,
                    toNullableDate(b.purchaseDate),
                    toNullableDate(b.warrantyExpiry),
                    unitCost,
                    b.departmentId,
                    b.locationId,
                    status,
                    assetCode,
                    qrPayload,
                    blank(b.additionalRemarks) ? null : b.additionalRemarks,
                    requiresApproval ? 1 : 0,
                    userId
                ]
            );
            const assetId = aRes.insertId;
            await writeAudit(conn, "ASSET", assetId, "REGISTER", "status", null, status, userId);

            if (requiresApproval) {
                await conn.execute(
                    `INSERT INTO asset_approvals (asset_id, action, action_by, remarks)
                     VALUES (?, 'Submitted', ?, ?)`,
                    [assetId, userId, cond[0].blocks_usage === 1
                        ? `Condition "${cond[0].condition_name}" requires review`
                        : "Approval requested at registration"]
                );
            }
            created.push({ asset_id: assetId, asset_code: assetCode, serial_number: serial });
        }

        // attach a previously uploaded invoice file, if any
        if (!blank(b.documentId)) {
            await conn.execute(
                "UPDATE asset_documents SET receipt_id = ? WHERE document_id = ?",
                [receiptId, b.documentId]
            );
        }

        return { receiptId, receiptCode, totalCost, created };
    });

    res.status(201).json({
        ok: true,
        receipt_code: result.receiptCode,
        status,
        requires_approval: requiresApproval,
        total_cost: result.totalCost,
        assets: result.created
    });
}));

// ------------------------------------------------------------ asset search
app.get("/api/assets", wrap(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(5, Number(req.query.limit || 10)));
    const offset = (page - 1) * limit;

    const where = ["is_deleted = 0"];
    const params = [];

    if (!blank(req.query.q)) {
        where.push(`(asset_code LIKE ? OR asset_name LIKE ? OR serial_number LIKE ?
                     OR model LIKE ? OR manufacturer LIKE ? OR receipt_code LIKE ?
                     OR invoice_number LIKE ? OR supplier_name LIKE ?)`);
        const like = "%" + String(req.query.q).trim() + "%";
        for (let i = 0; i < 8; i++) params.push(like);
    }
    if (!blank(req.query.status))     { where.push("status = ?");        params.push(req.query.status); }
    if (!blank(req.query.department)) { where.push("department_id = ?"); params.push(req.query.department); }
    if (!blank(req.query.category))   { where.push("category_id = ?");   params.push(req.query.category); }
    if (!blank(req.query.condition))  { where.push("condition_id = ?");  params.push(req.query.condition); }
    if (!blank(req.query.from))       { where.push("receipt_date >= ?"); params.push(req.query.from); }
    if (!blank(req.query.to))         { where.push("receipt_date <= ?"); params.push(req.query.to); }

    const clause = "WHERE " + where.join(" AND ");
    const countRows = await query(`SELECT COUNT(*) AS total FROM v_asset_full ${clause}`, params);
    const rows = await query(
        `SELECT * FROM v_asset_full ${clause} ORDER BY asset_id DESC LIMIT ${limit} OFFSET ${offset}`,
        params
    );

    res.json({
        ok: true,
        page,
        limit,
        total: countRows[0].total,
        pages: Math.max(1, Math.ceil(countRows[0].total / limit)),
        assets: rows
    });
}));

app.get("/api/assets/:code", wrap(async (req, res) => {
    const rows = await query("SELECT * FROM v_asset_full WHERE asset_code = ?", [req.params.code]);
    if (!rows.length) return res.status(404).json({ ok: false, error: "Asset not found" });

    const asset = rows[0];
    const [history, docs] = await Promise.all([
        query(
            `SELECT ap.action, ap.remarks, ap.action_at, u.full_name
             FROM asset_approvals ap JOIN users u ON u.user_id = ap.action_by
             WHERE ap.asset_id = ? ORDER BY ap.approval_id`,
            [asset.asset_id]
        ),
        query(
            "SELECT document_id, file_name, stored_name, doc_type FROM asset_documents WHERE receipt_id = ?",
            [asset.receipt_id]
        )
    ]);
    const audit = await query(
        `SELECT a.action, a.field_changed, a.old_value, a.new_value, a.performed_at, u.full_name
         FROM audit_log a JOIN users u ON u.user_id = a.performed_by
         WHERE a.entity_type = 'ASSET' AND a.entity_id = ? ORDER BY a.log_id DESC`,
        [asset.asset_id]
    );

    res.json({ ok: true, asset, history, documents: docs, audit });
}));

// --------------------------------------------------------- approve / reject
app.post("/api/assets/:id/decision", wrap(async (req, res) => {
    const assetId = Number(req.params.id);
    const decision = String(req.body.decision || "").toLowerCase();
    const userId = Number(req.body.userId || 1);
    const remarks = blank(req.body.remarks) ? null : String(req.body.remarks).trim();

    if (!["approve", "reject"].includes(decision)) {
        return res.status(400).json({ ok: false, error: "Decision must be approve or reject." });
    }
    if (decision === "reject" && !remarks) {
        return res.status(400).json({ ok: false, error: "A reason is required when rejecting an asset." });
    }

    const rows = await query("SELECT status FROM assets WHERE asset_id = ? AND is_deleted = 0", [assetId]);
    if (!rows.length) return res.status(404).json({ ok: false, error: "Asset not found" });
    if (rows[0].status !== "Pending Approval") {
        return res.status(409).json({ ok: false, error: `This asset is already ${rows[0].status}.` });
    }

    const newStatus = decision === "approve" ? "Available" : "Rejected";
    await withTransaction(async (conn) => {
        await conn.execute(
            "UPDATE assets SET status = ?, approved_by = ?, approved_at = NOW() WHERE asset_id = ?",
            [newStatus, userId, assetId]
        );
        await conn.execute(
            "INSERT INTO asset_approvals (asset_id, action, action_by, remarks) VALUES (?,?,?,?)",
            [assetId, decision === "approve" ? "Approved" : "Rejected", userId, remarks]
        );
        await writeAudit(conn, "ASSET", assetId, newStatus.toUpperCase(), "status",
            "Pending Approval", newStatus, userId);
    });

    res.json({ ok: true, status: newStatus });
}));

// -------------------------------------------------------------- label codes
app.get("/api/labels/:code/qr.png", wrap(async (req, res) => {
    const rows = await query("SELECT qr_payload FROM assets WHERE asset_code = ?", [req.params.code]);
    const payload = rows.length ? rows[0].qr_payload : req.params.code;
    const buf = await QRCode.toBuffer(payload, { width: 220, margin: 1 });
    res.type("png").send(buf);
}));

app.get("/api/labels/:code/barcode.png", wrap(async (req, res) => {
    const buf = await bwipjs.toBuffer({
        bcid: "code128",
        text: req.params.code,
        scale: 3,
        height: 12,
        includetext: true,
        textxalign: "center"
    });
    res.type("png").send(buf);
}));

// ------------------------------------------------------------------ upload
app.post("/api/documents", upload.single("file"), wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file received." });
    const userId = Number(req.body.userId || 1);
    const rows = await query(
        `INSERT INTO asset_documents (doc_type, file_name, stored_name, mime_type, file_size, uploaded_by)
         VALUES (?,?,?,?,?,?)`,
        [req.body.docType || "Invoice", req.file.originalname, req.file.filename,
         req.file.mimetype, req.file.size, userId]
    );
    res.status(201).json({
        ok: true,
        document_id: rows.insertId,
        url: "/uploads/" + req.file.filename,
        file_name: req.file.originalname
    });
}));

// --------------------------------------------------------------- dashboard
app.get("/api/dashboard", wrap(async (req, res) => {
    const [byStatus, byCategory, byDepartment, totals, warranty, recent] = await Promise.all([
        query("SELECT status, COUNT(*) AS count FROM v_asset_full WHERE is_deleted = 0 GROUP BY status"),
        query("SELECT category_name, COUNT(*) AS count, SUM(purchase_cost) AS value FROM v_asset_full WHERE is_deleted = 0 GROUP BY category_name ORDER BY count DESC"),
        query("SELECT dept_name, COUNT(*) AS count FROM v_asset_full WHERE is_deleted = 0 GROUP BY dept_name ORDER BY count DESC"),
        query("SELECT COUNT(*) AS total_assets, COALESCE(SUM(purchase_cost),0) AS total_value FROM v_asset_full WHERE is_deleted = 0"),
        query("SELECT warranty_status, COUNT(*) AS count FROM v_asset_full WHERE is_deleted = 0 GROUP BY warranty_status"),
        query("SELECT asset_code, asset_name, status, created_at FROM v_asset_full WHERE is_deleted = 0 ORDER BY asset_id DESC LIMIT 5")
    ]);
    res.json({ ok: true, byStatus, byCategory, byDepartment, totals: totals[0], warranty, recent });
}));

// ----------------------------------------------------------------- startup
app.use((err, req, res, next) => {
    console.error(err);
    res.status(400).json({ ok: false, error: err.message || "Request failed" });
});

app.listen(PORT, () => {
    console.log(`Asset Management (Module 4) running at http://localhost:${PORT}`);
});