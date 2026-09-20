"use strict";

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "asset_management",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
    timezone: "local"
});

async function query(sql, params) {
    const [rows] = await pool.execute(sql, params || []);
    return rows;
}

// Runs a callback inside a transaction and rolls back on any error.
async function withTransaction(callback) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await callback(conn);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

// Sequential, collision-free codes: AST-2026-000123 / REC-2026-000045
async function nextCode(conn, key, prefix) {
    const [rows] = await conn.execute(
        "SELECT current_value FROM code_sequences WHERE seq_key = ? FOR UPDATE",
        [key]
    );
    if (!rows.length) {
        throw new Error("Unknown code sequence: " + key);
    }
    const next = rows[0].current_value + 1;
    await conn.execute(
        "UPDATE code_sequences SET current_value = ? WHERE seq_key = ?",
        [next, key]
    );
    const year = new Date().getFullYear();
    return prefix + "-" + year + "-" + String(next).padStart(6, "0");
}

async function writeAudit(conn, entityType, entityId, action, field, oldVal, newVal, userId) {
    await conn.execute(
        `INSERT INTO audit_log
            (entity_type, entity_id, action, field_changed, old_value, new_value, performed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [entityType, entityId, action, field || null, oldVal || null, newVal || null, userId]
    );
}

module.exports = { pool, query, withTransaction, nextCode, writeAudit };
