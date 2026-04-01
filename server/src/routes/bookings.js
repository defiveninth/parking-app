import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function rowToBooking(row) {
  return {
    id: row.booking_id || row.id,
    parkingSpotId: row.parking_spot_id,
    parkingName: row.parking_name,
    address: row.address,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    price: row.price,
    status: row.status,
    qrCode: row.qr_code,
    bookingType: row.booking_type || "enter_now",
    expiresAt: row.expires_at,
  };
}

// GET /bookings - list current user's bookings (optional filter ?status=active|completed|reserved)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT b.id AS booking_id, b.parking_spot_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code, b.booking_type, b.expires_at,
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
      `SELECT b.id AS booking_id, b.parking_spot_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code, b.booking_type, b.expires_at,
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
    const { parkingSpotId, date, startTime, endTime, duration, durationMinutes, price, bookingType } = req.body;
    if (!parkingSpotId || price == null) {
      return res.status(400).json({ error: "parkingSpotId and price are required" });
    }

    // Determine booking type: "enter_now" or "book_later"
    const type = bookingType === "book_later" ? "book_later" : "enter_now";

    // Check user's current balance - if negative, don't allow booking
    const userResult = await query(
      "SELECT balance FROM users WHERE id = $1",
      [req.user.userId]
    );
    const userBalance = userResult.rows[0]?.balance ?? 0;
    if (userBalance < 0) {
      return res.status(400).json({ error: "Insufficient balance. Please top up your account." });
    }

    // Check if parking spot has available spaces
    const spotResult = await query(
      "SELECT available_spots FROM parking_spots WHERE id = $1",
      [parkingSpotId]
    );
    const availableSpots = spotResult.rows[0]?.available_spots ?? 0;
    if (availableSpots <= 0) {
      return res.status(400).json({ error: "No parking spaces available at this location." });
    }

    // Calculate expiry time based on booking type
    // enter_now: 10 minutes to arrive
    // book_later: 6 hours to arrive
    const now = new Date();
    let expiresAt;
    if (type === "enter_now") {
      expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    } else {
      expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    }
    const expiresAtStr = expiresAt.toISOString();

    const qrCode = "BK-" + Math.floor(1000 + Math.random() * 9000) + "-QR";
    const result = await query(
      `INSERT INTO bookings (user_id, parking_spot_id, date, start_time, end_time, duration, duration_minutes, price, status, qr_code, booking_type, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'reserved', $9, $10, $11)
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
        type,
        expiresAtStr,
      ]
    );
    const bookingId = result.rows[0].id;

    // Deduct price from user's balance (can go negative)
    await query(
      `UPDATE users SET balance = balance - $1 WHERE id = $2`,
      [price, req.user.userId]
    );

    // Decrement available_spots for the parking spot
    await query(
      `UPDATE parking_spots
       SET available_spots =
         CASE
           WHEN available_spots - 1 < 0 THEN 0
           ELSE available_spots - 1
         END
       WHERE id = $1`,
      [parkingSpotId]
    );
    const getResult = await query(
      `SELECT b.id AS booking_id, b.parking_spot_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code, b.booking_type, b.expires_at,
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

// POST /bookings/:id/open-barrier - open barrier for a booking
router.post("/:id/open-barrier", requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Get the booking
    const result = await query(
      `SELECT b.id, b.status, b.expires_at, b.booking_type
       FROM bookings b
       WHERE b.id = $1 AND b.user_id = $2`,
      [bookingId, req.user.userId]
    );
    
    const booking = result.rows[0];
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }
    
    // Check if booking is reserved (not yet active or completed)
    if (booking.status !== "reserved") {
      return res.status(400).json({ success: false, error: "Booking is not in reserved status" });
    }
    
    // Check if reservation has expired
    const now = new Date();
    const expiresAt = booking.expires_at ? new Date(booking.expires_at) : null;
    if (expiresAt && now > expiresAt) {
      // Mark as completed and restore the available spot
      await query(
        `UPDATE bookings SET status = 'completed' WHERE id = $1`,
        [bookingId]
      );
      // Get parking_spot_id for this booking so we can restore the spot count
      const spotResult = await query(
        `SELECT parking_spot_id FROM bookings WHERE id = $1`,
        [bookingId]
      );
      const parkingSpotId = spotResult.rows[0]?.parking_spot_id;
      if (parkingSpotId) {
        await query(
          `UPDATE parking_spots
           SET available_spots =
             CASE WHEN available_spots + 1 > total_spots THEN total_spots
                  ELSE available_spots + 1 END
           WHERE id = $1`,
          [parkingSpotId]
        );
      }
      return res.status(400).json({ success: false, error: "Reservation has expired" });
    }
    
    // Barrier opens! Update booking to active status
    await query(
      `UPDATE bookings SET status = 'active' WHERE id = $1`,
      [bookingId]
    );
    
    // Return success - barrier is open
    res.json({ success: true, message: "Barrier opened successfully" });
  } catch (err) {
    console.error("Open barrier error:", err);
    res.status(500).json({ success: false, error: "Failed to open barrier" });
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
        `UPDATE parking_spots
         SET available_spots =
           CASE
             WHEN available_spots + 1 > total_spots THEN total_spots
             ELSE available_spots + 1
           END
         WHERE id = $1`,
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
