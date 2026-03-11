// Admin auth middleware - checks X-Private-Key header
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || "admin-secret-key-change-me";

export function requireAdmin(req, res, next) {
  const privateKey = req.headers["x-private-key"];
  
  if (!privateKey) {
    return res.status(401).json({ error: "Missing private key" });
  }
  
  if (privateKey !== ADMIN_PRIVATE_KEY) {
    return res.status(403).json({ error: "Invalid private key" });
  }
  
  next();
}
