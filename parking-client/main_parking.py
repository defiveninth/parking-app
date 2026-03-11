import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import cv2
import time
import requests
from ultralytics import YOLO

# ==============================
# CONFIG
# ==============================
API_URL = "http://localhost:4000/parking-spots/some-id-we-will-set-later"
SEND_INTERVAL = 60  # seconds

# ==============================
# LOAD MODEL
# ==============================
model = YOLO("math-formula.pt")

# ==============================
# CAMERA
# ==============================
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Cannot access camera")
    exit()

# ==============================
# TIMER
# ==============================
last_sent_time = time.time()

# ==============================
# MAIN LOOP
# ==============================
while True:

    ret, frame = cap.read()
    if not ret:
        break

    # detect vehicles
    results = model(
        frame,
        classes=[2,3,5,7],  # car, motorcycle, bus, truck
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
                (0,255,0),
                2
            )

    # ==============================
    # DRAW CAR COUNT
    # ==============================
    cv2.putText(
        frame,
        f"Cars detected: {car_count}",
        (20,40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0,255,0),
        2
    )

    # ==============================
    # SEND DATA EVERY 60 SECONDS
    # ==============================
    current_time = time.time()

    if current_time - last_sent_time >= SEND_INTERVAL:

        payload = {
            "availableSpots": car_count
        }

        try:
            response = requests.post(API_URL, json=payload)

            print("Sent:", payload)
            print("Status:", response.status_code)

        except Exception as e:
            print("Request error:", e)

        last_sent_time = current_time

    # ==============================
    # DISPLAY
    # ==============================
    cv2.imshow("Car Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


cap.release()
cv2.destroyAllWindows()