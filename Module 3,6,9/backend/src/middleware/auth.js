const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

/**
 * Verifies the Authorization: Bearer <token> header and attaches the
 * decoded user (user_id, email, role_id, role_name, permissions) to
 * req.user. Rejects with 401 if missing/invalid/expired.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}

/**
 * Requires requireAuth to have run first. Checks the user's role
 * permissions (from roles.permissions JSON, embedded in the JWT at
 * login) for a specific permission key, e.g. "approve_disposal".
 * asset_admin's {"all": true} always passes.
 */
function requirePermission(permissionKey) {
  return (req, res, next) => {
    const perms = req.user?.permissions || {};
    if (perms.all === true || perms[permissionKey] === true) {
      return next();
    }
    return res.status(403).json({
      error: `Your role (${req.user?.role_name || "unknown"}) is not authorized to do this.`,
    });
  };
}

module.exports = { requireAuth, requirePermission, JWT_SECRET };
