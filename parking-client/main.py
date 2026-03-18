import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import cv2
import time
import requests
from ultralytics import YOLO
from dotenv import load_dotenv

# ==============================
# LOAD ENV
# ==============================
load_dotenv()

PARKING_ID = os.environ.get("PARKING_ID", "default-parking-id")
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:4000")

API_URL = f"{API_BASE_URL}/parking/spots/{PARKING_ID}/update-count"

FIRST_SEND_DELAY = 10   # first send after 10 sec
SEND_INTERVAL = 60      # then every 60 sec

# ==============================
# LOAD MODEL
# ==============================
model = YOLO("yolov8n.pt")  # use correct model

# ==============================
# CAMERA
# ==============================
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Cannot access camera")
    exit()

# ==============================
# TIMER STATE
# ==============================
start_time = time.time()
next_send_time = start_time + FIRST_SEND_DELAY
last_sent_count = 0

# ==============================
# MAIN LOOP
# ==============================
while True:

    ret, frame = cap.read()
    if not ret:
        break

    # ==============================
    # DETECTION
    # ==============================
    results = model(
        frame,
        classes=[2, 3, 5, 7],  # car, motorcycle, bus, truck
        conf=0.5
    )

    car_count = 0

    if results[0].boxes is not None:
        boxes = results[0].boxes.xyxy.cpu()
        car_count = len(boxes)

        for box in boxes:
            x1, y1, x2, y2 = map(int, box)

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

    # ==============================
    # TIMER LOGIC
    # ==============================
    current_time = time.time()
    should_send = False

    if current_time >= next_send_time:
        should_send = True

    if should_send:
        payload = {
            "carCount": car_count
        }

        try:
            response = requests.post(API_URL, json=payload, timeout=5)
            print("Sent:", payload)
            print("Status:", response.status_code)

            last_sent_count = car_count

        except Exception as e:
            print("Request error:", e)

        next_send_time = current_time + SEND_INTERVAL

    # ==============================
    # COUNTDOWN
    # ==============================
    time_left = int(max(0, next_send_time - current_time))

    # ==============================
    # UI TEXT
    # ==============================
    cv2.putText(frame, f"Cars now: {car_count}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.putText(frame, f"Last sent: {last_sent_count}", (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    cv2.putText(frame, f"Next send in: {time_left}s", (20, 120),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    status_text = "SENDING..." if should_send else "WAITING"

    cv2.putText(frame, status_text, (20, 160),
                cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 255, 0) if should_send else (200, 200, 200), 2)

    # ==============================
    # SHOW WINDOW
    # ==============================
    cv2.imshow("Car Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    # reduce CPU usage
    time.sleep(0.03)

# ==============================
# CLEANUP
# ==============================
cap.release()
cv2.destroyAllWindows()