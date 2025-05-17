import os, time, uuid, cv2, requests, logging
from ultralytics import YOLO
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from uploader import trim_video_ffmpeg, upload_to_drive
import torch

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("model-service")

# Configuration
MODEL_WEIGHTS = os.getenv("YOLO_WEIGHTS", "/app/weights/best.pt")
device = "cuda" if torch.cuda.is_available() else "cpu"
THRESHOLD = 0.7
COOLDOWN_SECONDS = 20
VIDEO_DIR = "/app/videos"
BACKEND_URL = os.environ["INTERNAL_BACKEND_URL"]
SECRET_HEADER_NAME = "X-INTERNAL-SECRET"
SECRET = os.environ["INTERNAL_SECRET"]

app = FastAPI(title="CrashAlertAI-Model-Service")

# Load YOLO11 model
try:
    model = YOLO(MODEL_WEIGHTS).to(device)
    logger.info(f"✅ Successfully loaded YOLO11 model from {MODEL_WEIGHTS}")
except Exception as e:
    logger.info(f"⚠️  Model loading failed: {str(e)}")
    model = None

class RunRequest(BaseModel):
    videoId: str
    cameraId: str
    location: str

def analyse_video(video_path: str, meta: dict):

    # Get video metadata
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()

    # Process video with YOLO11
    results = model.predict(
        source=video_path,
        stream=True,
        imgsz=640,
        conf=THRESHOLD,
        classes=[0],  # Assuming class 0 is 'accident'
        verbose=False,
        device=device
    )

    detection_time = None
    accident_sent = False

    # Process predictions in chronological order
    for frame_idx, result in enumerate(results):
        if not result:
            continue
        current_time = frame_idx / fps
        
        # Skip processing if within cooldown period
        if detection_time and current_time < detection_time + COOLDOWN_SECONDS:
            continue

        if len(result.boxes) > 0:
            # Get first detection in frame
            box = result.boxes[0]
            conf = box.conf.item()
            cls = int(box.cls.item())
            logger.info(f"Detection found at {current_time}s, confidence: {conf}, class: {cls}")

            if conf >= THRESHOLD and cls == 0:
                try:
                    # Trim video around detection
                    clip_path = f"/tmp/clip_{uuid.uuid4().hex}.mp4"
                    trim_video_ffmpeg(
                        input_video=video_path,
                        start_time=max(0, current_time - 7),
                        duration=15,
                        output_video=clip_path
                    )
                    gdrive_link = upload_to_drive(clip_path)
                except Exception as e:
                    logger.info(f"❌ Error trimming video: {str(e)}")
                    continue
                
                accident_doc = {
                    "cameraId": meta["cameraId"],
                    "location": meta["location"],
                    "date": datetime.now().isoformat(),
                    "displayDate": None,
                    "displayTime": None,
                    "severity": "no severity",
                    "video": gdrive_link,
                    "description": f"{conf:.2f}",
                    "assignedTo": None,
                    "status": "active",
                    "falsePositive": False,
                }
                try:
                    response = requests.post(
                        BACKEND_URL,
                        headers={SECRET_HEADER_NAME: SECRET},
                        json=accident_doc,
                        timeout=10
                    )
                    if response.status_code == 201:
                        logger.info("✅ Accident alert sent successfully")
                        accident_sent = True
                        detection_time = current_time
                        break
                    else:
                        logger.info(" ❌ Accident alert sent but failed at backend")
                except Exception as e:
                    logger.info(f"❌ Backend communication failed: {str(e)}")
                        
    if not accident_sent:
        logger.info("ℹ️  No accidents detected in video")

@app.get("/videos")
def list_videos():
    vids = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".mp4")]
    return [{"id": v.split(".")[0], "file": v} for v in vids]

@app.post("/run")
def process_video(req: RunRequest, bg: BackgroundTasks):
    file_path = os.path.join(VIDEO_DIR, f"{req.videoId}.mp4")
    if not os.path.isfile(file_path):
        raise HTTPException(404, detail="Video file not found")
    
    bg.add_task(analyse_video, file_path, {
        "cameraId": req.cameraId,
        "location": req.location
    })
    return {"status": "processing_started", "video": req.videoId} 