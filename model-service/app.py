"""
FastAPI micro-service that

1. receives  POST /run  with  {videoId, cameraId, location}
2. scans the chosen demo video with a YOLO model
3. when confidence ≥THRESHOLD, trims ±7 s (total 15 s) around the frame,
   uploads it to Google Drive, and
4. POSTs a complete accident JSON (including video link) to
     http://backend:3001/api/internal/accidents
"""

import os, time, uuid, cv2, requests, json
from ultralytics import YOLO
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from uploader import trim_video_ffmpeg, upload_to_drive         # your script
# ──────────────────────────────────────────────────────────────
#  Load YOLO model once at start-up
# ──────────────────────────────────────────────────────────────
import torch
MODEL_WEIGHTS = os.getenv("YOLO_WEIGHTS", "/app/weights/best.pt")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

try:
    # Load the YOLO model
    model = YOLO(MODEL_WEIGHTS)
    model.to(device)  # Move model to GPU if available
    print(f"✅ Successfully loaded YOLO model from {MODEL_WEIGHTS}")
except Exception as e:
    print(f"⚠️  Could not load YOLO model: {str(e)}")
    print("Please ensure the model file exists and is compatible with ultralytics version 8.2.26")
    model = None

THRESHOLD = float(os.getenv("ACCIDENT_THRESHOLD", "0.7"))
# ──────────────────────────────────────────────────────────────

VIDEO_DIR          = "/app/videos"
BACKEND_URL        = os.environ["INTERNAL_BACKEND_URL"]
SECRET_HEADER_NAME = "X-INTERNAL-SECRET"
SECRET             = os.environ["INTERNAL_SECRET"]

app = FastAPI(title="CrashAlertAI-Model-Service")

class RunRequest(BaseModel):
    videoId:  str               #   "crossroad_01"
    cameraId: str               #   "cam-alpha"
    location: str               #   "Herzl & Jabotinsky"

# ──────────────────────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────────────────────
def analyse_video(video_path: str, meta: dict):
    """Scan the video, find first accident, trim & upload clip, send JSON to backend."""
    print(f"▶️  analysing {video_path}")
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    accident_sent = False

    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            break

        # ► YOLO inference
        if model is None:
            continue     # model failed to load, never detect
        
        # Convert frame for YOLO processing
        results = model(frame, size=640)
        
        # Process detection results
        for r in results.xyxy[0]:            # each detection
            conf, cls = r[4].item(), int(r[5].item())
            if cls == 0 and conf >= THRESHOLD:   # class 0 = "accident" in your dataset
                # timestamp of current frame
                frame_idx = cap.get(cv2.CAP_PROP_POS_FRAMES)
                t_sec     = frame_idx / fps
                try:
                    clip_file   = trim_video_ffmpeg(
                        input_video = video_path,
                        start_time  = max(0, t_sec - 7),
                        duration    = 15,
                        output_video= f"/tmp/clip_{uuid.uuid4().hex}.mp4"
                    )
                    gdrive_link = upload_to_drive(clip_file)    # returns https://drive.google.com/…/view
                except Exception as e:
                    print("❌  trim/upload failed:", e)
                    cap.release()
                    return

                accident_doc = {
                    "cameraId":      meta["cameraId"],
                    "location":      meta["location"],
                    "date":          int(time.time()*1000),
                    "displayDate":   None,
                    "displayTime":   None,
                    "severity":      "no severity",
                    "video":         gdrive_link,
                    "description":   None,
                    "assignedTo":    None,
                    "status":        "active",
                    "falsePositive": False,
                }
                # send to backend
                try:
                    r = requests.post(
                        BACKEND_URL,
                        headers={SECRET_HEADER_NAME: SECRET},
                        json=accident_doc,
                        timeout=10,
                    )
                    r.raise_for_status()
                    print("✅  Accident sent to backend.")
                    accident_sent = True
                except Exception as e:
                    print("❌  POST to backend failed:", e)
                cap.release()
                return
    cap.release()
    if not accident_sent:
        print("ℹ️  finished video – no accident detected")

# ──────────────────────────────────────────────────────────────
#  Routes
# ──────────────────────────────────────────────────────────────
@app.get("/videos")
def list_videos():
    """Return [{id,file}] for demo UI."""
    vids = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".mp4")]
    return [{"id": v.rsplit(".",1)[0], "file": v} for v in vids]

@app.post("/run")
def run(req: RunRequest, bg: BackgroundTasks):
    """Start analysing chosen video in background."""
    file = f"{req.videoId}.mp4"
    full_path = os.path.join(VIDEO_DIR, file)
    if not os.path.isfile(full_path):
        raise HTTPException(404, detail="video not found")
    meta = {"cameraId": req.cameraId, "location": req.location}
    bg.add_task(analyse_video, full_path, meta)
    return {"status":"started", "video": req.videoId}
