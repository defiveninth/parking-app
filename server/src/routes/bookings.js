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
    enteredAt: row.entered_at,
    pricePerHour: row.price_per_hour,
  };
}

// GET /bookings - list current user's bookings (optional filter ?status=active|completed|reserved)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT b.id AS booking_id, b.parking_spot_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code, b.booking_type, b.expires_at, b.entered_at,
             p.name AS parking_name, p.address, p.price_per_hour
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
      `SELECT b.id AS booking_id, b.parking_spot_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code, b.booking_type, b.expires_at, b.entered_at,
              p.name AS parking_name, p.address, p.price_per_hour
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
    
    console.log("[v0] Create booking request:", { parkingSpotId, userId: req.user.userId, bookingType });
    
    if (!parkingSpotId) {
      return res.status(400).json({ error: "parkingSpotId is required" });
    }
      
    // Verify user exists
    const userCheck = await query("SELECT id FROM users WHERE id = $1", [req.user.userId]);
    console.log("[v0] User check:", userCheck.rows, "userId:", req.user.userId);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: `User with id ${req.user.userId} does not exist` });
    }
    
    // Verify parking spot exists
    const spotCheck = await query("SELECT id FROM parking_spots WHERE id = $1", [parkingSpotId]);
    console.log("[v0] Parking spot check:", spotCheck.rows);
    if (spotCheck.rows.length === 0) {
      return res.status(400).json({ error: `Parking spot with id ${parkingSpotId} does not exist` });
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
    
    // For enter_now: price is 0 (pay on exit)
    // For book_later: price is reservation fee (500 KZT)
    const bookingPrice = price || 0;
    
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
        bookingPrice,
        qrCode,
        type,
        expiresAtStr,
      ]
    );
    const bookingId = result.rows[0].id;

    // Only deduct price for book_later (reservation fee)
    if (type === "book_later" && bookingPrice > 0) {
      await query(
        `UPDATE users SET balance = balance - $1 WHERE id = $2`,
        [bookingPrice, req.user.userId]
      );
    }

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
      `SELECT b.id AS booking_id, b.parking_spot_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code, b.booking_type, b.expires_at, b.entered_at,
              p.name AS parking_name, p.address, p.price_per_hour
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

// POST /bookings/:id/open-barrier - open barrier for a booking (ENTER)
router.post("/:id/open-barrier", requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Get the booking
    const result = await query(
      `SELECT b.id, b.status, b.expires_at, b.booking_type, b.parking_spot_id
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
      const parkingSpotId = booking.parking_spot_id;
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
    
    // Barrier opens! Update booking to active status and record entry time
    const enteredAt = new Date().toISOString();
    await query(
      `UPDATE bookings SET status = 'active', entered_at = $1, start_time = $2 WHERE id = $3`,
      [enteredAt, new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), bookingId]
    );
    
    // Return success - barrier is open
    res.json({ success: true, message: "Barrier opened successfully" });
  } catch (err) {
    console.error("Open barrier error:", err);
    res.status(500).json({ success: false, error: "Failed to open barrier" });
  }
});

// POST /bookings/:id/exit-barrier - exit barrier for a booking (EXIT)
// Calculates time spent, deducts from balance, completes booking
router.post("/:id/exit-barrier", requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Get the booking with parking spot price
    const result = await query(
      `SELECT b.id, b.status, b.entered_at, b.booking_type, b.parking_spot_id, b.price as reservation_fee,
              p.price_per_hour
       FROM bookings b
       JOIN parking_spots p ON p.id = b.parking_spot_id
       WHERE b.id = $1 AND b.user_id = $2`,
      [bookingId, req.user.userId]
    );
    
    const booking = result.rows[0];
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }
    
    // Check if booking is active
    if (booking.status !== "active") {
      return res.status(400).json({ success: false, error: "Booking is not active. Cannot exit." });
    }
    
    // Calculate time spent
    const enteredAt = booking.entered_at ? new Date(booking.entered_at) : new Date();
    const now = new Date();
    const diffMs = now.getTime() - enteredAt.getTime();
    const diffMinutes = Math.max(1, Math.ceil(diffMs / 60000)); // At least 1 minute
    const diffHours = diffMinutes / 60;
    
    // Calculate cost based on hours (round up to nearest hour for billing)
    const billedHours = Math.ceil(diffHours);
    const pricePerHour = booking.price_per_hour || 200;
    const totalCost = billedHours * pricePerHour;
    
    // Format duration
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    // Update booking with final details
    const endTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    await query(
      `UPDATE bookings 
       SET status = 'completed', 
           end_time = $1, 
           duration = $2, 
           duration_minutes = $3,
           price = price + $4
       WHERE id = $5`,
      [endTime, durationStr, diffMinutes, totalCost, bookingId]
    );
    
    // Deduct parking cost from user balance (can go negative)
    await query(
      `UPDATE users SET balance = balance - $1 WHERE id = $2`,
      [totalCost, req.user.userId]
    );
    
    // Increment available_spots for the parking spot
    await query(
      `UPDATE parking_spots
       SET available_spots =
         CASE WHEN available_spots + 1 > total_spots THEN total_spots
              ELSE available_spots + 1 END
       WHERE id = $1`,
      [booking.parking_spot_id]
    );
    
    // Get updated user balance
    const userResult = await query(
      `SELECT balance FROM users WHERE id = $1`,
      [req.user.userId]
    );
    const newBalance = userResult.rows[0]?.balance ?? 0;
    
    res.json({ 
      success: true, 
      message: "Exit successful",
      duration: durationStr,
      durationMinutes: diffMinutes,
      cost: totalCost,
      pricePerHour,
      billedHours,
      newBalance
    });
  } catch (err) {
    console.error("Exit barrier error:", err);
    res.status(500).json({ success: false, error: "Failed to process exit" });
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
      `SELECT b.id AS booking_id, b.date, b.start_time, b.end_time, b.duration, b.price, b.status, b.qr_code, b.entered_at,
              p.name AS parking_name, p.address, p.price_per_hour
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
