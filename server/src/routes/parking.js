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

export default router;
