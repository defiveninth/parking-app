import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { signToken } from "../middleware/auth.js";

const router = Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone, carNumber } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = (name || "U").trim().split(/\s+/).map((s) => s[0]).join("").toUpperCase().slice(0, 2) || "U";
    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, car_number, avatar)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, phone, car_number, avatar`,
      [email, passwordHash, name, phone || null, carNumber || null, avatar]
    );
    const user = result.rows[0];
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        carNumber: user.car_number,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    if (err.code === "23505" || err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const result = await query(
      "SELECT id, email, password_hash, name, phone, car_number, avatar FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        carNumber: user.car_number,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
