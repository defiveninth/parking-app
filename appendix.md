# Technical Appendix: Implementation Details

## A.4 Detailed Logic Sequence (Flowchart Data)
The following sequence describes the operational flow of data from the physical sensor to the end-user interface:

1.  **Optical Capture**: The OpenCV library (`cv2.VideoCapture`) captures a raw image frame from the edge camera at the parking site.
2.  **Neural Inference**: The YOLOv8 model processes the frame, identifying bounding boxes for vehicle classes (cars, buses, trucks) and returning a discrete `carCount`.
3.  **Edge Push**: The Python `requests` library transmits a JSON payload `{ "carCount": N }` via an HTTP POST request to the centralized Express.js backend.
4.  **Relational Sync**: The backend queries the database for active reservations, computes real-time availability (`Total - AI_Count - Reserved`), and persists the result to PostgreSQL.
5.  **State Hydration**: The Next.js frontend executes an API call via `useEffect`, updates the local `spots` state, and triggers a React re-render to reflect the new count on the map.

---

## A.5 Frontend Data Integration Snippet (Next.js)
The following snippet demonstrates how the frontend retrieves AI-processed data and updates the application state to reflect real-time occupancy:

```typescript
// Location: components/screens/home-screen.tsx
const [spots, setSpots] = useState<ParkingSpotDto[]>([]);

useEffect(() => {
  let isMounted = true;
  
  // Fetch real-time parking data from the Express backend
  getParkingSpotsApi()
    .then((apiSpots) => {
      if (isMounted && apiSpots.length > 0) {
        setSpots(apiSpots); // Updates UI state and re-renders markers
      }
    })
    .catch((err) => console.error("Sync Error:", err));

  return () => { isMounted = false; };
}, []);
```

---

## A.6 Backend Bridge Snippet (Express.js)
This endpoint serves as the bridge between the AI Edge client and the system database, performing the core availability calculation:

```javascript
// Location: server/src/routes/parking.js
router.post("/spots/:id/update-count", async (req, res) => {
  const { id } = req.params;
  const { carCount } = req.body;

  // 1. Fetch total capacity
  const { rows } = await query("SELECT total_spots FROM parking_spots WHERE id = $1", [id]);
  const total = rows[0].total_spots;

  // 2. Count active reservations (status = 'reserved' AND not expired)
  const reservedRes = await query(
    "SELECT COUNT(*) FROM bookings WHERE parking_spot_id = $1 AND status = 'reserved'", [id]
  );
  const reserved = parseInt(reservedRes.rows[0].count);

  // 3. Logic: Available = Total - (AI Detected) - (Reservations)
  const available = Math.max(0, total - carCount - reserved);

  // 4. Update Database
  await query("UPDATE parking_spots SET available_spots = $1 WHERE id = $2", [available, id]);
  res.json({ success: true, availableSpots: available });
});
```
