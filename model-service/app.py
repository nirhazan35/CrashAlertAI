import os, time, uuid, cv2, requests, logging, threading, subprocess
from ultralytics import YOLO
from datetime import datetime, timedelta
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from uploader import trim_video_ffmpeg, upload_to_drive
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("model-service")

# Configuration
MODEL_WEIGHTS = os.getenv("YOLO_WEIGHTS", "/app/weights/best.pt")
device = "cpu"
THRESHOLD = 0.7
COOLDOWN_SECONDS = 20
VIDEO_DIR = os.getenv("VIDEO_DIR", "/app/videos")
BACKEND_URL = os.getenv("INTERNAL_BACKEND_URL")
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

def predict_video(video_path, metadata):
    """
    Process a video for accident detection using YOLOv11m and broadcast accidents
    
    Args:
        video_path (str): Path to the video file to analyze
        metadata (dict): Dictionary containing camera metadata including cameraId and location
    """
    # Set up logging
    logger = logging.getLogger(__name__)
    
    # Configuration parameters
    CONFIDENCE_THRESHOLD = 0.5  # Confidence threshold for detection
    ACCIDENT_CLASS_ID = 0       # Class ID for accident
    
    # Get video properties using OpenCV temporarily
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Error: Could not open video file {video_path}")
        return
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()  # Release as we'll use YOLO's built-in video processing
    
    # Initialize variables for accident detection and cooldown
    last_detection_time = None
    cooldown_period = timedelta(seconds=30)
    
    # Process the video using YOLO's stream feature for better performance
    frame_count = 0
    
    logger.info(f"Starting accident detection on video: {video_path}")
    
    # Use YOLO's built-in video processing for better performance
    for results in model.track(source=video_path, stream=True, conf=CONFIDENCE_THRESHOLD, verbose=False):
        # Calculate current timestamp in the video
        current_time = timedelta(seconds=frame_count / fps)
        current_time_seconds = int(current_time.total_seconds())
        frame_count += 1
        
        # Check if an accident was detected
        detections = results.boxes
        
        for detection in detections:
            # Get class ID and confidence
            cls_id = int(detection.cls.item())
            confidence = detection.conf.item()
            
            # Check if the detection is an accident with sufficient confidence
            if cls_id == ACCIDENT_CLASS_ID and confidence >= CONFIDENCE_THRESHOLD:
                # Check if we're outside the cooldown period
                current_datetime = datetime.now()
                
                if last_detection_time is None or (current_datetime - last_detection_time) > cooldown_period:
                    # Update the last detection time
                    last_detection_time = current_datetime
                    
                    # Create timestamp string (MM:SS format)
                    minutes = int(current_time.total_seconds() // 60)
                    seconds = int(current_time.total_seconds() % 60)
                    timestamp_str = f"{minutes:02d}:{seconds:02d}"
                    
                    logger.info(f"🔍 Accident detected at {timestamp_str} with confidence {confidence:.2f}")
                    
                    # Start a new thread to broadcast the accident alert
                    threading.Thread(
                        target=broadcast,
                        args=(video_path, timestamp_str, metadata, confidence)
                    ).start()
    
    logger.info(f"Completed accident detection on video: {video_path}")

def broadcast(video_path, timestamp, metadata, confidence):
    """
    Broadcast an accident alert to the appropriate channels
    
    Args:
        video_path (str): Path to the video where the accident was detected
        timestamp (str): Timestamp in the video when the accident occurred
        metadata (dict): Information about the camera (cameraId, location, etc.)
        confidence (float): Confidence score of the detection
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Parse the timestamp to get seconds
        minutes, seconds = map(int, timestamp.split(':'))
        current_time_seconds = minutes * 60 + seconds
        
        # Trim video around detection (7 seconds before, 8 seconds after)
        clip_path = f"/tmp/clip_{uuid.uuid4().hex}.mp4"
        trim_video_ffmpeg(
            input_video=video_path,
            start_time=max(0, current_time_seconds - 7),
            duration=15,
            output_video=clip_path
        )
        
        # Upload trimmed clip to Google Drive using existing function
        gdrive_link = upload_to_drive(logger, clip_path)
        
        # Prepare accident document
        accident_doc = {
            "cameraId": metadata.get("cameraId", "unknown"),
            "location": metadata.get("location", "unknown"),
            "date": datetime.now().isoformat(),
            "displayDate": None,
            "displayTime": None,
            "severity": "no severity",
            "video": gdrive_link,
            "description": f"{confidence:.2f}",
            "assignedTo": None,
            "status": "active",
            "falsePositive": False,
        }
        
        # Send to backend using global configuration
        response = requests.post(
            BACKEND_URL,
            headers={SECRET_HEADER_NAME: SECRET},
            json=accident_doc,
            timeout=10
        )
        
        if response.status_code == 201:
            logger.info("✅ Accident alert sent successfully")
        else:
            logger.info(f"❌ Accident alert sent but failed at backend: {response.status_code}")
            
    except Exception as e:
        error_message = f"❌ Error in broadcast function: {str(e)}"
        logger.error(error_message)

@app.get("/videos")
def list_videos():
    vids = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".mp4")]
    video_list = []
    for v in vids:
        # Attempt to extract cameraId and location from filename, or set to None
        # Example filename: camera123_locationABC_20230101.mp4
        camera_id = None
        location = None
        parts = v.split('_')
        if len(parts) >= 2:
            camera_id = parts[0] if parts[0] else None
            location = parts[1] if parts[1] else None
        video_list.append({
            "id": v.split(".")[0],
            "file": v,
            "cameraId": camera_id,
            "location": location,
            "name": v,
            # "thumbnailUrl": None,  # Add if you have thumbnails
        })
    return video_list

@app.post("/run")
def process_video(req: RunRequest, bg: BackgroundTasks):
    file_path = os.path.join(VIDEO_DIR, f"{req.videoId}.mp4")
    logger.info(f"Processing video: {file_path}")
    logger.info(f"Camera ID: {req.cameraId}")
    logger.info(f"Location: {req.location}")
    if not os.path.isfile(file_path):
        raise HTTPException(404, detail="Video file not found")
    
    bg.add_task(predict_video, file_path, {
        "cameraId": req.cameraId,
        "location": req.location
    })
    return {"status": "processing_started", "video": req.videoId} 

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "model_loaded": model is not None
    }