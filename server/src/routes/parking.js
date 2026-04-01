import { Router } from "express";
import { query } from "../db.js";

const router = Router();

function rowToSpot(row) {
  return {
    id: String(row.id),
    name: row.name,
    address: row.address,
    distance: row.distance || "",
    availableSpots: row.available_spots,
    totalSpots: row.total_spots,
    pricePerHour: row.price_per_hour,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    hasCovered: row.has_covered,
    hasCharging: row.has_charging,
    hasDisabled: row.has_disabled,
  };
}

// GET /parking/spots - list all parking spots
router.get("/spots", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, address, distance, available_spots, total_spots, price_per_hour, lat, lng, has_covered, has_charging, has_disabled FROM parking_spots ORDER BY id"
    );
    res.json(result.rows.map(rowToSpot));
  } catch (err) {
    console.error("List parking spots error:", err);
    res.status(500).json({ error: "Failed to list parking spots" });
  }
});

// GET /parking/spots/:id - get one parking spot
router.get("/spots/:id", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, address, distance, available_spots, total_spots, price_per_hour, lat, lng, has_covered, has_charging, has_disabled FROM parking_spots WHERE id = $1",
      [req.params.id]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "Parking spot not found" });
    }
    res.json(rowToSpot(row));
  } catch (err) {
    console.error("Get parking spot error:", err);
    res.status(500).json({ error: "Failed to get parking spot" });
  }
});

// POST /parking/spots/:id/update-count
router.post("/spots/:id/update-count", async (req, res) => {
  try {
    const { id } = req.params;
    const { carCount } = req.body;

    // ==============================
    // VALIDATION
    // ==============================
    if (typeof carCount !== "number" || carCount < 0) {
      return res.status(400).json({ error: "Invalid carCount" });
    }

    // ==============================
    // GET TOTAL SPOTS
    // ==============================
    const result = await query(
      "SELECT total_spots FROM parking_spots WHERE id = $1",
      [id]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ error: "Parking spot not found" });
    }

    const totalSpots = row.total_spots;

    // ==============================
    // COUNT ACTIVE RESERVATIONS (not yet entered, not expired)
    // ==============================
    const now = new Date().toISOString();
    const reservedResult = await query(
      `SELECT COUNT(*) as reserved_count FROM bookings 
       WHERE parking_spot_id = $1 
       AND status = 'reserved' 
       AND (expires_at IS NULL OR expires_at > $2)`,
      [id, now]
    );
    const reservedCount = parseInt(reservedResult.rows[0]?.reserved_count || 0, 10);

    // ==============================
    // CALCULATE AVAILABLE
    // Formula: total - cars detected by AI - active reservations
    // ==============================
    const availableSpots = Math.max(0, totalSpots - carCount - reservedCount);

    // ==============================
    // UPDATE DB
    // ==============================
    await query(
      "UPDATE parking_spots SET available_spots = $1 WHERE id = $2",
      [availableSpots, id]
    );

    // ==============================
    // RESPONSE
    // ==============================
    res.json({
      success: true,
      carCount,
      reservedCount,
      availableSpots,
      totalSpots,
    });

  } catch (err) {
    console.error("Update parking error:", err);
    res.status(500).json({ error: "Failed to update parking spot" });
  }
});

export default router;
