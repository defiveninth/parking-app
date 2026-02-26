import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /users/me - current user profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, email, name, phone, car_number, avatar FROM users WHERE id = $1",
      [req.user.userId]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      name: row.name,
      email: row.email,
      phone: row.phone,
      carNumber: row.car_number,
      avatar: row.avatar,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// PATCH /users/me - update profile
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, email, phone, carNumber, avatar } = req.body;
    const result = await query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        car_number = COALESCE($4, car_number),
        avatar = COALESCE($5, avatar),
        updated_at = datetime('now')
       WHERE id = $6
       RETURNING id, email, name, phone, car_number, avatar`,
      [name, email, phone, carNumber, avatar, req.user.userId]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      name: row.name,
      email: row.email,
      phone: row.phone,
      carNumber: row.car_number,
      avatar: row.avatar,
    });
  } catch (err) {
    if (err.code === "23505" || err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
