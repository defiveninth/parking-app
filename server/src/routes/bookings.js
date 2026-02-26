import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function rowToBooking(row) {
  return {
    id: row.booking_id || row.id,
    parkingName: row.parking_name,
    address: row.address,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    price: row.price,
    status: row.status,
    qrCode: row.qr_code,
  };
}

// GET /bookings - list current user's bookings (optional filter ?status=active|completed|reserved)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT b.id AS booking_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code,
             p.name AS parking_name, p.address
      FROM bookings b
      JOIN parking_spots p ON p.id = b.parking_spot_id
      WHERE b.user_id = $1
    `;
    const params = [req.user.userId];
    if (status && ["active", "completed", "reserved"].includes(status)) {
      sql += " AND b.status = $2";
      params.push(status);
    }
    sql += " ORDER BY b.created_at DESC";
    const result = await query(sql, params);
    res.json(result.rows.map(rowToBooking));
  } catch (err) {
    console.error("List bookings error:", err);
    res.status(500).json({ error: "Failed to list bookings" });
  }
});

// GET /bookings/:id - get one booking
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT b.id AS booking_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code,
              p.name AS parking_name, p.address
       FROM bookings b
       JOIN parking_spots p ON p.id = b.parking_spot_id
       WHERE b.id = $1 AND b.user_id = $2`,
      [req.params.id, req.user.userId]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(rowToBooking(row));
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ error: "Failed to get booking" });
  }
});

// POST /bookings - create booking
router.post("/", requireAuth, async (req, res) => {
  try {
    const { parkingSpotId, date, startTime, endTime, duration, durationMinutes, price } = req.body;
    if (!parkingSpotId || price == null) {
      return res.status(400).json({ error: "parkingSpotId and price are required" });
    }
    const qrCode = "BK-" + Math.floor(1000 + Math.random() * 9000) + "-QR";
    const result = await query(
      `INSERT INTO bookings (user_id, parking_spot_id, date, start_time, end_time, duration, duration_minutes, price, status, qr_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'reserved', $9)
       RETURNING id`,
      [
        req.user.userId,
        parkingSpotId,
        date || "Today",
        startTime || "—",
        endTime || "—",
        duration || "—",
        durationMinutes || 0,
        price,
        qrCode,
      ]
    );
    const bookingId = result.rows[0].id;
    // Decrement available_spots for the parking spot
    await query(
      "UPDATE parking_spots SET available_spots = GREATEST(0, available_spots - 1) WHERE id = $1",
      [parkingSpotId]
    );
    const getResult = await query(
      `SELECT b.id AS booking_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code,
              p.name AS parking_name, p.address
       FROM bookings b
       JOIN parking_spots p ON p.id = b.parking_spot_id
       WHERE b.id = $1`,
      [bookingId]
    );
    res.status(201).json(rowToBooking(getResult.rows[0]));
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// PATCH /bookings/:id - update booking status (e.g. active, completed)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["active", "completed", "reserved"].includes(status)) {
      return res.status(400).json({ error: "Valid status (active|completed|reserved) required" });
    }
    const result = await query(
      `UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3
       RETURNING id, parking_spot_id`,
      [status, req.params.id, req.user.userId]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (status === "completed") {
      await query(
        "UPDATE parking_spots SET available_spots = LEAST(total_spots, available_spots + 1) WHERE id = $1",
        [row.parking_spot_id]
      );
    }
    const getResult = await query(
      `SELECT b.id AS booking_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code,
              p.name AS parking_name, p.address
       FROM bookings b
       JOIN parking_spots p ON p.id = b.parking_spot_id
       WHERE b.id = $1`,
      [req.params.id]
    );
    res.json(rowToBooking(getResult.rows[0]));
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

export default router;
