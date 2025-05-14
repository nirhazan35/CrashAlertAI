import os
import time
import uuid
from datetime import datetime
import requests
import logging
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from uploader import trim_video_ffmpeg, upload_to_drive

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("model-service")

# Configuration
MODEL_WEIGHTS = os.getenv("YOLO_WEIGHTS", "/app/weights/best.pt")
THRESHOLD = 0.7
COOLDOWN_SECONDS = 20
VIDEO_DIR = "/app/videos"
BACKEND_URL = os.environ["INTERNAL_BACKEND_URL"]
SECRET_HEADER_NAME = "X-INTERNAL-SECRET"
SECRET = os.environ["INTERNAL_SECRET"]

app = FastAPI(title="CrashAlertAI-Model-Service")

class RunRequest(BaseModel):
    videoId: str
    cameraId: str
    location: str
    accidentTime: float  # time in seconds to trim around

def analyse_video(video_path: str, meta: dict, accident_time: float):
    """
    Trim the video ±7s around the provided time, upload to Drive,
    and send an accident alert to the backend.
    """
    logger.info("analyse_video called")
    try:
        logger.info("trimming video")
        start = max(0, accident_time - 7)
        clip_path = f"/tmp/clip_{uuid.uuid4().hex}.mp4"
        trim_video_ffmpeg(
            input_video=video_path,
            start_time=start,
            duration=15,
            output_video=clip_path
        )
        logger.info("video trimmed")
        gdrive_link = upload_to_drive(clip_path)
        logger.info("video uploaded to drive")
    except Exception as e:
        logger.error(f"Video processing failed: {e}")
        return

    accident_doc = {
        "cameraId": meta["cameraId"],
        "location": meta["location"],
        "date": datetime.now().isoformat(),
        "displayDate": None,
        "displayTime": None,
        "severity": "no severity",
        "video": gdrive_link,
        "description": None,
        "assignedTo": None,
        "status": "active",
        "falsePositive": False,
    }
    logger.info("accident doc created")
    try:
        response = requests.post(
            BACKEND_URL,
            headers={SECRET_HEADER_NAME: SECRET},
            json=accident_doc,
            timeout=10
        )
        logger.info("accident alert sent")
        if response.success:
            logger.info("Accident alert sent successfully")
        else:
            logger.error("Accident alert sent failed at backend")
    except Exception as e:
        logger.error(f"Backend communication failed: {e}")
    finally:
        logger.info("process_video done")

@app.get("/videos")
def list_videos():
    vids = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".mp4")]
    return [{"id": v.split(".")[0], "file": v} for v in vids]

@app.post("/run")
def process_video(req: RunRequest, bg: BackgroundTasks):
    logger.info("process_video called")
    file_path = os.path.join(VIDEO_DIR, f"{req.videoId}.mp4")
    logger.info(f"file_path: {file_path}")
    if not os.path.isfile(file_path):
        raise HTTPException(404, detail="Video file not found")
    logger.info("video file found")
    # Schedule trimming/upload at the specified accidentTime
    logger.info("scheduling trimming/upload")
    bg.add_task(
        analyse_video,
        file_path,
        {"cameraId": req.cameraId, "location": req.location},
        req.accidentTime
    )
    logger.info("scheduling done")
    return {"status": "processing_started", "video": req.videoId}