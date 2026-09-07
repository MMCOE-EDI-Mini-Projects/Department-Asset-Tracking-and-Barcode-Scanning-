const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /auth/login
 * Body: { email, password }
 * Verifies against users.password_hash (bcrypt), joins roles for
 * permissions, and returns a JWT the frontend stores and sends back
 * as Authorization: Bearer <token> on protected requests.
 */
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const [rows] = await pool.query(
    `SELECT u.user_id, u.name, u.email, u.password_hash, u.status,
            r.role_id, r.role_name, r.permissions
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     WHERE u.email = ?`,
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const user = rows[0];

  if (user.status !== "active") {
    return res.status(403).json({ error: "This account is suspended." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const permissions =
    typeof user.permissions === "string" ? JSON.parse(user.permissions) : user.permissions;

  const payload = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    role_name: user.role_name,
    permissions,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

  return res.json({ token, user: payload });
});

module.exports = router;
