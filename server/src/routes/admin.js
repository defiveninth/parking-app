import { Router } from "express";
import { query } from "../db.js";
import { requireAdmin } from "../middleware/admin.js";
import bcrypt from "bcrypt";

const router = Router();

// All admin routes require private key
router.use(requireAdmin);

// ============ USERS ============

// GET /admin/users - list all users
router.get("/users", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, email, name, phone, car_number, avatar, created_at, updated_at FROM users ORDER BY id DESC"
    );
    res.json(result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      carNumber: row.car_number,
      avatar: row.avatar,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (err) {
    console.error("Admin list users error:", err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

// GET /admin/users/:id - get single user
router.get("/users/:id", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, email, name, phone, car_number, avatar, created_at, updated_at FROM users WHERE id = $1",
      [req.params.id]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      carNumber: row.car_number,
      avatar: row.avatar,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error("Admin get user error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// POST /admin/users - create user
router.post("/users", async (req, res) => {
  try {
    const { email, password, name, phone, carNumber } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, car_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, phone, car_number, avatar, created_at, updated_at`,
      [email, passwordHash, name, phone || null, carNumber || null]
    );
    
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      carNumber: row.car_number,
      avatar: row.avatar,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    if (err.code === "23505" || err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Admin create user error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PATCH /admin/users/:id - update user
router.patch("/users/:id", async (req, res) => {
  try {
    const { email, password, name, phone, carNumber } = req.body;
    
    let updateQuery;
    let params;
    
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateQuery = `UPDATE users SET
        email = COALESCE($1, email),
        password_hash = $2,
        name = COALESCE($3, name),
        phone = COALESCE($4, phone),
        car_number = COALESCE($5, car_number),
        updated_at = datetime('now')
       WHERE id = $6
       RETURNING id, email, name, phone, car_number, avatar, created_at, updated_at`;
      params = [email, passwordHash, name, phone, carNumber, req.params.id];
    } else {
      updateQuery = `UPDATE users SET
        email = COALESCE($1, email),
        name = COALESCE($2, name),
        phone = COALESCE($3, phone),
        car_number = COALESCE($4, car_number),
        updated_at = datetime('now')
       WHERE id = $5
       RETURNING id, email, name, phone, car_number, avatar, created_at, updated_at`;
      params = [email, name, phone, carNumber, req.params.id];
    }
    
    const result = await query(updateQuery, params);
    const row = result.rows[0];
    
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      carNumber: row.car_number,
      avatar: row.avatar,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    if (err.code === "23505" || err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Admin update user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /admin/users/:id - delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ============ PARKING SPOTS ============

// GET /admin/parking - list all parking spots
router.get("/parking", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM parking_spots ORDER BY id DESC"
    );
    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      distance: row.distance,
      availableSpots: row.available_spots,
      totalSpots: row.total_spots,
      pricePerHour: row.price_per_hour,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      hasCovered: Boolean(row.has_covered),
      hasCharging: Boolean(row.has_charging),
      hasDisabled: Boolean(row.has_disabled),
      createdAt: row.created_at,
    })));
  } catch (err) {
    console.error("Admin list parking error:", err);
    res.status(500).json({ error: "Failed to list parking spots" });
  }
});

// GET /admin/parking/:id - get single parking spot
router.get("/parking/:id", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM parking_spots WHERE id = $1",
      [req.params.id]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "Parking spot not found" });
    }
    res.json({
      id: row.id,
      name: row.name,
      address: row.address,
      distance: row.distance,
      availableSpots: row.available_spots,
      totalSpots: row.total_spots,
      pricePerHour: row.price_per_hour,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      hasCovered: Boolean(row.has_covered),
      hasCharging: Boolean(row.has_charging),
      hasDisabled: Boolean(row.has_disabled),
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error("Admin get parking error:", err);
    res.status(500).json({ error: "Failed to get parking spot" });
  }
});

// POST /admin/parking - create parking spot
router.post("/parking", async (req, res) => {
  try {
    const { name, address, distance, availableSpots, totalSpots, pricePerHour, lat, lng, hasCovered, hasCharging, hasDisabled } = req.body;
    
    if (!name || !address || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Name, address, lat, and lng are required" });
    }
    
    const result = await query(
      `INSERT INTO parking_spots (name, address, distance, available_spots, total_spots, price_per_hour, lat, lng, has_covered, has_charging, has_disabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, address, distance || "", availableSpots || 0, totalSpots || 0, pricePerHour || 0, lat, lng, hasCovered ? 1 : 0, hasCharging ? 1 : 0, hasDisabled ? 1 : 0]
    );
    
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      address: row.address,
      distance: row.distance,
      availableSpots: row.available_spots,
      totalSpots: row.total_spots,
      pricePerHour: row.price_per_hour,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      hasCovered: Boolean(row.has_covered),
      hasCharging: Boolean(row.has_charging),
      hasDisabled: Boolean(row.has_disabled),
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error("Admin create parking error:", err);
    res.status(500).json({ error: "Failed to create parking spot" });
  }
});

// PATCH /admin/parking/:id - update parking spot
router.patch("/parking/:id", async (req, res) => {
  try {
    const { name, address, distance, availableSpots, totalSpots, pricePerHour, lat, lng, hasCovered, hasCharging, hasDisabled } = req.body;
    
    const result = await query(
      `UPDATE parking_spots SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        distance = COALESCE($3, distance),
        available_spots = COALESCE($4, available_spots),
        total_spots = COALESCE($5, total_spots),
        price_per_hour = COALESCE($6, price_per_hour),
        lat = COALESCE($7, lat),
        lng = COALESCE($8, lng),
        has_covered = COALESCE($9, has_covered),
        has_charging = COALESCE($10, has_charging),
        has_disabled = COALESCE($11, has_disabled)
       WHERE id = $12
       RETURNING *`,
      [name, address, distance, availableSpots, totalSpots, pricePerHour, lat, lng, hasCovered !== undefined ? (hasCovered ? 1 : 0) : undefined, hasCharging !== undefined ? (hasCharging ? 1 : 0) : undefined, hasDisabled !== undefined ? (hasDisabled ? 1 : 0) : undefined, req.params.id]
    );
    
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "Parking spot not found" });
    }
    
    res.json({
      id: row.id,
      name: row.name,
      address: row.address,
      distance: row.distance,
      availableSpots: row.available_spots,
      totalSpots: row.total_spots,
      pricePerHour: row.price_per_hour,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      hasCovered: Boolean(row.has_covered),
      hasCharging: Boolean(row.has_charging),
      hasDisabled: Boolean(row.has_disabled),
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error("Admin update parking error:", err);
    res.status(500).json({ error: "Failed to update parking spot" });
  }
});

// DELETE /admin/parking/:id - delete parking spot
router.delete("/parking/:id", async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM parking_spots WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Parking spot not found" });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error("Admin delete parking error:", err);
    res.status(500).json({ error: "Failed to delete parking spot" });
  }
});

// POST /admin/verify - verify private key
router.post("/verify", (req, res) => {
  res.json({ valid: true });
});

// ============ STATISTICS ============

// GET /admin/statistics - get dashboard statistics
router.get("/statistics", async (req, res) => {
  try {
    // Total users
    const usersResult = await query("SELECT COUNT(*) as count FROM users");
    const totalUsers = usersResult.rows[0].count;

    // Total parking spots
    const parkingSpotsResult = await query("SELECT COUNT(*) as count FROM parking_spots");
    const totalParkingSpots = parkingSpotsResult.rows[0].count;

    // Total bookings
    const bookingsResult = await query("SELECT COUNT(*) as count FROM bookings");
    const totalBookings = bookingsResult.rows[0].count;

    // Active bookings
    const activeBookingsResult = await query("SELECT COUNT(*) as count FROM bookings WHERE status = 'active'");
    const activeBookings = activeBookingsResult.rows[0].count;

    // Total revenue
    const revenueResult = await query("SELECT SUM(price) as total FROM bookings WHERE status = 'completed'");
    const totalRevenue = revenueResult.rows[0].total || 0;

    // Bookings by status
    const bookingsByStatusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM bookings
      GROUP BY status
    `);
    const bookingsByStatus = bookingsByStatusResult.rows.map(row => ({
      status: row.status,
      count: row.count,
    }));

    // Revenue by day (last 7 days)
    const revenueByDayResult = await query(`
      SELECT 
        date(created_at) as date,
        SUM(price) as revenue,
        COUNT(*) as bookings
      FROM bookings
      WHERE status = 'completed'
        AND created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `);
    const revenueByDay = revenueByDayResult.rows.map(row => ({
      date: row.date,
      revenue: row.revenue,
      bookings: row.bookings,
    }));

    // Revenue by month (last 12 months)
    const revenueByMonthResult = await query(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(price) as revenue,
        COUNT(*) as bookings
      FROM bookings
      WHERE status = 'completed'
        AND created_at >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `);
    const revenueByMonth = revenueByMonthResult.rows.map(row => ({
      month: row.month,
      revenue: row.revenue,
      bookings: row.bookings,
    }));

    // Top parking spots by usage
    const topParkingSpotsResult = await query(`
      SELECT 
        ps.id,
        ps.name,
        ps.address,
        COUNT(b.id) as booking_count,
        SUM(b.price) as total_revenue
      FROM parking_spots ps
      LEFT JOIN bookings b ON b.parking_spot_id = ps.id
      GROUP BY ps.id, ps.name, ps.address
      ORDER BY booking_count DESC
      LIMIT 10
    `);
    const topParkingSpots = topParkingSpotsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      bookingCount: row.booking_count,
      totalRevenue: row.total_revenue || 0,
    }));

    // Average booking duration
    const avgDurationResult = await query(`
      SELECT AVG(duration_minutes) as avg_duration
      FROM bookings
      WHERE status = 'completed'
    `);
    const avgBookingDuration = avgDurationResult.rows[0].avg_duration || 0;

    // User registration trend (last 30 days)
    const userRegistrationResult = await query(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as registrations
      FROM users
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `);
    const userRegistrationTrend = userRegistrationResult.rows.map(row => ({
      date: row.date,
      registrations: row.registrations,
    }));

    // Booking types breakdown
    const bookingTypesResult = await query(`
      SELECT 
        COALESCE(booking_type, 'enter_now') as type,
        COUNT(*) as count
      FROM bookings
      GROUP BY booking_type
    `);
    const bookingTypes = bookingTypesResult.rows.map(row => ({
      type: row.type,
      count: row.count,
    }));

    // Peak hours (bookings by hour)
    const peakHoursResult = await query(`
      SELECT 
        CAST(strftime('%H', created_at) AS INTEGER) as hour,
        COUNT(*) as bookings
      FROM bookings
      GROUP BY hour
      ORDER BY hour ASC
    `);
    const peakHours = peakHoursResult.rows.map(row => ({
      hour: row.hour,
      bookings: row.bookings,
    }));

    res.json({
      overview: {
        totalUsers,
        totalParkingSpots,
        totalBookings,
        activeBookings,
        totalRevenue,
        avgBookingDuration: Math.round(avgBookingDuration),
      },
      bookingsByStatus,
      revenueByDay,
      revenueByMonth,
      topParkingSpots,
      userRegistrationTrend,
      bookingTypes,
      peakHours,
    });
  } catch (err) {
    console.error("Admin statistics error:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;
