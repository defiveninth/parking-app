# Technical Appendix: System Architecture & Data Flow

## 1. System Workflow
The system operates as a distributed architecture consisting of an **Edge Device (Python CV)**, a **Centralized Backend (Express)**, and a **Frontend Application (Next.js)**. 

### Data Path:
1.  **Image Capture**: The Python script captures live video frames from a local camera (USB/CSI) using OpenCV.
2.  **AI Inference**: Each frame is processed by a YOLOv8 (You Only Look Once) neural network to identify and count vehicles.
3.  **Data Transmission**: The script aggregates the count and sends a standard HTTP POST request containing the `carCount` to the Express backend.
4.  **Business Logic**: The Express server receives the count and performs a calculation: 
    *   `Available Spots = Total Spots - AI Detected Cars - Active Reservations`
5.  **Database Persistence**: The calculated availability is stored in a PostgreSQL database.
6.  **User Delivery**: The Next.js frontend fetches the updated availability data via the REST API and displays it to the user in real-time or upon view refresh.

---

## 2. The 'Bridge' Logic
The communication between the Express server and the Computer Vision script follows an **Event-Driven Client-Server** model.

*   **Mechanism**: The Python script acts as an independent HTTP client using the `requests` library.
*   **Decoupling**: Unlike a `child_process.spawn` or `spawn` approach which would run the Python script *on* the server, this model allows the CV script to run on "Edge" hardware (e.g., Raspberry Pi, NVIDIA Jetson, or a dedicated local PC) located at the actual parking site.
*   **API Security**: The Express backend exposes a specific endpoint (`/api/parking/spots/:id/update-count`) designed to receive updates from these edge devices.

---

## 3. Key Functionality: Computer Vision
The Python script is dedicated to **Real-Time Object Detection and Spatial Analysis**.

*   **Model**: **YOLOv8n** (Nano version for high performance and low latency).
*   **Specific Task**: Multiclass Object Counting. It is configured to detect:
    *   `Class 2`: Cars
    *   `Class 3`: Motorcycles
    *   `Class 5`: Buses
    *   `Class 7`: Trucks
*   **Logic**: The script filters detection results by confidence threshold (0.5) and counts the bounding boxes to determine current occupancy. It includes a cooldown/timer logic to prevent API flooding, sending updates every 60 seconds.

---

## 4. Frontend Integration
The Next.js frontend integrates this data using a **Service-Hook Pattern**.

*   **Data Fetching**: The application uses a custom API utility (`lib/api.ts`) that wraps the browser `fetch` API.
*   **State Management**: Within components (like `HomeScreen.tsx`), the `useState` and `useEffect` hooks are utilized to manage the lifecycle of the parking data.
*   **Dynamic UI**: 
    *   The `availableSpots` value is used to dynamically update map markers and list items.
    *   Conditional styling is applied based on availability (e.g., highlighting spots with low availability in red/accent colors).
*   **Navigation & Routing**: The frontend calculates distances using the Haversine formula and provides routing information by combining the user's GPS location with the static coordinates of the parking spots stored in the database.
