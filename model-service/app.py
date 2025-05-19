import os
import time
import uuid
import cv2
import requests
import logging
from datetime import datetime
from collections import deque
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from ultralytics import YOLO
from uploader import upload_to_drive
import torch
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("model-service.app")

# Configuration
if os.environ.get("RUNNING_IN_DOCKER") != "1":
    logger.info("Running outside Docker")
    dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
else:
    logger.info("Running inside Docker")
device = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_WEIGHTS = os.getenv("YOLO_WEIGHTS", "/app/weights/best.pt")
VIDEO_DIR = os.getenv("VIDEO_DIR", "/app/videos")
BACKEND_URL = os.environ["INTERNAL_BACKEND_URL"]
SECRET = os.environ["INTERNAL_SECRET"]
SECRET_HEADER_NAME = "X-INTERNAL-SECRET"
THRESHOLD = 0.4
COOLDOWN_SECONDS = 30

app = FastAPI(title="CrashAlertAI-Model-Service")

# Load YOLO model
try:
    logger.info(f"Loading model from {MODEL_WEIGHTS}")
    model = YOLO(MODEL_WEIGHTS).to(device)
    logger.info(f"✅ Model loaded from {MODEL_WEIGHTS}")
except Exception as e:
    logger.error(f"⚠️ Model loading failed: {str(e)}")
    model = None

class CameraRequest(BaseModel):
    camera_id: str
    location: str # can be removed and get from the camera model ❌❌❌❌❌❌❌@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@❌❌❌❌❌❌❌❌
    source: str  # RTSP URL or video file path

def process_camera_feed(camera_id: str, source: str, location: str):
    logger.info(f"Processing camera feed for camera_id: {camera_id}, source: {source}, location: {location}")
    buffer_duration = 7  # Seconds to buffer before detection
    post_duration = 8    # Seconds to record after detection
    cooldown = COOLDOWN_SECONDS

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        logger.error(f"❌ Failed to open source: {source}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_delay = 1 / fps
    buffer_size = int(fps * buffer_duration)
    frame_buffer = deque(maxlen=buffer_size)
    last_alert_time = 0
    recording = False
    clip_writer = None
    post_frames_needed = int(fps * post_duration)
    post_frames_remaining = 0

    while True:
        start_time = time.time()
        ret, frame = cap.read()
        if not ret:
            logger.warning("🚨 End of stream or error reading frame")
            break

        # Add frame to buffer
        frame_buffer.append(frame.copy())

        # Run inference
        results = model(frame, imgsz=640, conf=THRESHOLD, classes=[0], verbose=False, device=device)


        current_time = time.time()
        detection_made = False


        # Check cooldown
        if current_time - last_alert_time < cooldown:
            continue

        # Check for detections
        for result in results:
            if len(result.boxes) > 0:
                box = result.boxes[0]
                conf = box.conf.item()
                class_id = box.cls.item()
                if class_id == 0:
                    logger.info(f"Confidence: {conf}, Class ID: {class_id}")
                if conf >= THRESHOLD and class_id == 0:
                    detection_made = True
                    break

        if detection_made:
            logger.info(f"🚨 Accident detected at {datetime.now().isoformat()}")
            last_alert_time = current_time
            recording = True
            post_frames_remaining = post_frames_needed

            # Initialize video writer
            clip_path = f"/tmp/clip_{uuid.uuid4().hex}.mp4"
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            clip_writer = cv2.VideoWriter(
                clip_path,
                fourcc,
                fps,
                (frame.shape[1], frame.shape[0])
            )

            # Write buffered frames and current frame
            for buffered_frame in frame_buffer:
                clip_writer.write(buffered_frame)
            clip_writer.write(frame)
            post_frames_remaining -= 1

        # Continue recording if needed
        if recording:
            clip_writer.write(frame)
            post_frames_remaining -= 1
            if post_frames_remaining <= 0:
                recording = False
                clip_writer.release()
                try:
                    logger.info(f"Uploading and notifying backend")
                    gdrive_link = upload_to_drive(clip_path)
                    accident_doc = {
                        "cameraId": camera_id,
                        "location": location,
                        "date": datetime.now().isoformat(),
                        "severity": "no severity",
                        "video": gdrive_link,
                        "description": f"Confidence: {conf:.2f}",
                    }
                    response = requests.post(
                        f"{BACKEND_URL}",
                        headers={SECRET_HEADER_NAME: SECRET},
                        json=accident_doc,
                        timeout=10
                    )
                    logger.info("✅ Alert sent to backend" if response.ok else "❌ Backend error")
                except Exception as e:
                    logger.error(f"Upload/notification failed: {str(e)}")

        # Maintain real-time processing speed
        processing_time = time.time() - start_time
        time.sleep(max(0, frame_delay - processing_time))

    cap.release()
    if recording:
        clip_writer.release()

@app.post("/monitor")
def start_monitoring(req: CameraRequest, bg: BackgroundTasks):
    logger.info(f"Starting monitoring for camera: {req.camera_id}")
    logger.info(f"Video dir: {VIDEO_DIR}")
    source = os.path.join(VIDEO_DIR, f"{req.source}.mp4")
    bg.add_task(process_camera_feed, req.camera_id, source, req.location)
    return {"status": "monitoring_started", "camera": req.camera_id}

@app.get("/")
def read_root():
    return {"message": "CrashAlertAI Model Service is running!"}
