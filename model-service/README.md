# CrashAlertAI Model Service

The AI-powered model service for CrashAlertAI - a high-performance Python application using YOLOv11 for real-time traffic accident detection and automated alert generation.

## 🎯 Overview

This Python-based service handles the core AI functionality of the CrashAlertAI system. It processes video feeds using state-of-the-art YOLOv11 deep learning models to detect traffic accidents, automatically trims video clips around incidents, uploads evidence to cloud storage, and triggers real-time alerts through the backend API.

## 🛠️ Technology Stack

### Core AI & Computer Vision
- **YOLOv11 (Ultralytics)**: Latest generation object detection model
- **PyTorch**: Deep learning framework powering YOLO
- **OpenCV (cv2)**: Computer vision and video processing
- **NumPy**: Numerical computing for array operations

### Web Framework & API
- **FastAPI**: High-performance async web framework
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for production deployment

### Video Processing
- **FFmpeg**: Professional video processing and transcoding
- **Subprocess**: System command execution for video operations

### Cloud Integration
- **Google Drive API**: Cloud storage for video evidence
- **OAuth 2.0**: Secure authentication for cloud services

### HTTP & Communication
- **Requests**: HTTP client for backend communication
- **aiofiles**: Async file operations

### Configuration & Environment
- **python-dotenv**: Environment variable management
- **logging**: Comprehensive logging and monitoring

### Development & Testing
- **pytest**: Python testing framework
- **unittest**: Built-in testing capabilities

## 📁 Project Structure

```
model-service/
├── app.py                   # Main FastAPI application
├── uploader.py             # Google Drive integration
├── test_app.py             # Service tests
├── requirements.txt        # Python dependencies
├── requirements-ci.txt     # CI-compatible dependencies
├── makefile               # Build and deployment commands
├── Dockerfile             # Docker container configuration
├── .dockerignore          # Docker ignore rules
├── .gitignore             # Git ignore rules
├── .env                   # Environment variables
├── videos/                # Video processing directory
│   ├── input/             # Incoming video files
│   ├── processed/         # Processed video clips
│   └── temp/              # Temporary processing files
├── weights/               # AI model weights
│   └── best.pt            # Trained YOLO model
├── credentials/           # Service account keys
│   └── drive_sa.json      # Google Drive service account
├── logs/                  # Application logs
├── venv/                  # Python virtual environment
└── __pycache__/           # Python bytecode cache
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+**: Python runtime environment
- **pip**: Python package manager
- **FFmpeg**: Video processing library
- **CUDA** (optional): GPU acceleration for faster inference

### System Dependencies

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv ffmpeg
```

#### macOS
```bash
brew install python ffmpeg
```

#### Windows
```bash
# Install Python from python.org
# Install FFmpeg from https://ffmpeg.org/download.html
```

### Python Environment Setup
```bash
# Navigate to model-service directory
cd model-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download YOLO weights (if not provided)
# The model expects weights/best.pt
```

### Environment Variables
Create a `.env` file in the model-service directory:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000

# Model Configuration
YOLO_WEIGHTS=/app/weights/best.pt
ACCIDENT_THRESHOLD=0.7
CONFIDENCE_THRESHOLD=0.5
COOLDOWN_SECONDS=30

# Video Processing
VIDEO_DIR=/app/videos
MAX_VIDEO_SIZE_MB=500
SUPPORTED_FORMATS=mp4,avi,mov,mkv

# Backend Communication
INTERNAL_BACKEND_URL=http://backend:3001/api/accidents
INTERNAL_SECRET=your_internal_api_secret

# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
GOOGLE_CREDENTIALS_PATH=/app/credentials/drive_sa.json

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/model_service.log

# Performance Settings
MAX_WORKERS=4
BATCH_SIZE=1
DEVICE=auto  # auto, cpu, cuda
```

### Running the Service

#### Development Mode
```bash
# Start development server
python app.py

# Or using uvicorn directly
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Production Mode
```bash
# Start production server
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

The service will be available at `http://localhost:8000`

## 🔍 AI Model Configuration

### YOLOv11 Model Setup
```python
# Model initialization
from ultralytics import YOLO
import torch

# Load model with GPU acceleration if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model = YOLO(MODEL_WEIGHTS).to(device)

# Model configuration
model.conf = 0.5  # Confidence threshold
model.iou = 0.45  # NMS IoU threshold
model.max_det = 300  # Maximum detections per image
```

### Accident Detection Parameters
```python
# Detection configuration
ACCIDENT_CLASS_ID = 0          # Class ID for accident detection
CONFIDENCE_THRESHOLD = 0.5     # Minimum confidence for detection
ACCIDENT_THRESHOLD = 0.7       # Threshold for accident classification
COOLDOWN_PERIOD = 30          # Seconds between alerts for same camera
```

### Performance Optimization
```python
# Model optimization settings
model.fuse()  # Fuse conv and bn layers
model.half() if device == 'cuda' else None  # Use FP16 on GPU

# Inference optimization
torch.backends.cudnn.benchmark = True  # Optimize for fixed input sizes
torch.set_num_threads(4)  # CPU thread optimization
```

## 📹 Video Processing Pipeline

### 1. Video Ingestion
```python
def process_video_request(video_id: str, camera_id: str, location: str):
    """
    Process incoming video processing request
    """
    video_path = os.path.join(VIDEO_DIR, f"{video_id}.mp4")
    
    if not os.path.isfile(video_path):
        raise HTTPException(404, detail="Video file not found")
    
    # Validate video file
    if not validate_video_file(video_path):
        raise HTTPException(400, detail="Invalid video format")
    
    # Start background processing
    background_tasks.add_task(
        predict_video, 
        video_path, 
        {"cameraId": camera_id, "location": location}
    )
```

### 2. Accident Detection
```python
def predict_video(video_path: str, metadata: dict):
    """
    Analyze video for accident detection using YOLOv11
    """
    # Initialize video capture
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    
    # Process video using YOLO tracking
    frame_count = 0
    last_detection_time = None
    
    for results in model.track(source=video_path, stream=True, 
                              conf=CONFIDENCE_THRESHOLD, verbose=False):
        
        current_time = timedelta(seconds=frame_count / fps)
        frame_count += 1
        
        # Analyze detections
        for detection in results.boxes:
            cls_id = int(detection.cls.item())
            confidence = detection.conf.item()
            
            # Check for accident detection
            if (cls_id == ACCIDENT_CLASS_ID and 
                confidence >= CONFIDENCE_THRESHOLD):
                
                # Apply cooldown logic
                if should_trigger_alert(last_detection_time):
                    last_detection_time = datetime.now()
                    
                    # Trigger alert processing
                    threading.Thread(
                        target=process_accident_alert,
                        args=(video_path, current_time, metadata, confidence)
                    ).start()
```

### 3. Video Trimming & Processing
```python
def trim_video_ffmpeg(input_video: str, start_time: int, 
                     duration: int, output_video: str):
    """
    Trim video around accident detection using FFmpeg
    """
    command = [
        'ffmpeg',
        '-i', input_video,
        '-ss', str(start_time),
        '-t', str(duration),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '23',
        '-y',  # Overwrite output file
        output_video
    ]
    
    try:
        subprocess.run(command, check=True, capture_output=True)
        logger.info(f"Video trimmed successfully: {output_video}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr.decode()}")
        return False
```

## ☁️ Cloud Storage Integration

### Google Drive Upload
```python
import pickle
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

def upload_to_drive(logger, file_path: str) -> str:
    """
    Upload video clip to Google Drive and return shareable link
    """
    try:
        # Load service account credentials
        credentials = Credentials.from_service_account_file(
            GOOGLE_CREDENTIALS_PATH,
            scopes=['https://www.googleapis.com/auth/drive']
        )
        
        # Build Drive service
        service = build('drive', 'v3', credentials=credentials)
        
        # Prepare file metadata
        file_metadata = {
            'name': f"accident_{uuid.uuid4().hex[:8]}.mp4",
            'parents': [GOOGLE_DRIVE_FOLDER_ID]
        }
        
        # Upload file
        media = MediaFileUpload(file_path, mimetype='video/mp4')
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        # Make file publicly viewable
        service.permissions().create(
            fileId=file.get('id'),
            body={'role': 'reader', 'type': 'anyone'}
        ).execute()
        
        # Return shareable link
        return f"https://drive.google.com/file/d/{file.get('id')}/view"
        
    except Exception as e:
        logger.error(f"Drive upload failed: {str(e)}")
        return None
```

## 🔔 Alert System Integration

### Backend Communication
```python
def send_accident_alert(accident_data: dict):
    """
    Send accident alert to backend API
    """
    try:
        response = requests.post(
            INTERNAL_BACKEND_URL,
            headers={
                'X-INTERNAL-SECRET': INTERNAL_SECRET,
                'Content-Type': 'application/json'
            },
            json=accident_data,
            timeout=10
        )
        
        if response.status_code == 201:
            logger.info("✅ Accident alert sent successfully")
            return True
        else:
            logger.warning(f"❌ Backend responded with: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to send alert: {str(e)}")
        return False
```

### Alert Data Structure
```python
def create_accident_document(metadata: dict, confidence: float, 
                           video_url: str) -> dict:
    """
    Create structured accident document for database storage
    """
    return {
        "cameraId": metadata.get("cameraId", "unknown"),
        "location": metadata.get("location", "unknown"),
        "date": datetime.now().isoformat(),
        "displayDate": None,
        "displayTime": None,
        "severity": classify_severity(confidence),
        "video": video_url,
        "description": f"AI Detection Confidence: {confidence:.2f}",
        "assignedTo": None,
        "status": "active",
        "falsePositive": False,
        "confidence": confidence,
        "coordinates": metadata.get("coordinates", {})
    }
```

## 🔧 API Endpoints

### Health Check
```python
@app.get("/health")
def health_check():
    """Service health and model status"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": device,
        "timestamp": datetime.now().isoformat()
    }
```

### Video Processing
```python
@app.post("/run")
def process_video(req: RunRequest, bg: BackgroundTasks):
    """Process video for accident detection"""
    file_path = os.path.join(VIDEO_DIR, f"{req.videoId}.mp4")
    
    if not os.path.isfile(file_path):
        raise HTTPException(404, detail="Video file not found")
    
    bg.add_task(predict_video, file_path, {
        "cameraId": req.cameraId,
        "location": req.location
    })
    
    return {"message": "Video processing started", "videoId": req.videoId}
```

### Video Management
```python
@app.get("/videos")
def list_videos():
    """List available videos for processing"""
    videos = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".mp4")]
    return [{"id": v.split(".")[0], "file": v} for v in videos]

@app.get("/models/info")
def model_info():
    """Get model information and statistics"""
    return {
        "model_path": MODEL_WEIGHTS,
        "device": device,
        "classes": model.names if model else {},
        "input_size": 640,
        "confidence_threshold": CONFIDENCE_THRESHOLD
    }
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
python test_app.py

# Run with pytest
pytest test_app.py -v

# Run specific test
pytest test_app.py::test_health_endpoint -v

# Run with coverage
pytest --cov=app test_app.py
```

### Test Examples
```python
import unittest
from fastapi.testclient import TestClient
from app import app

class TestModelService(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "healthy")
    
    def test_list_videos(self):
        """Test video listing endpoint"""
        response = self.client.get("/videos")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
    
    def test_model_info(self):
        """Test model information endpoint"""
        response = self.client.get("/models/info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("device", data)
        self.assertIn("model_path", data)
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p videos logs weights credentials

# Set permissions
RUN chmod +x app.py

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Commands
```bash
# Build image
docker build -t crashalert-model-service .

# Run container
docker run -p 8000:8000 \
  -v $(pwd)/videos:/app/videos \
  -v $(pwd)/weights:/app/weights \
  -v $(pwd)/secrets:/app/credentials \
  --env-file .env \
  crashalert-model-service

# Run with GPU support
docker run --gpus all -p 8000:8000 crashalert-model-service
```

## ⚡ Performance Optimization

### GPU Acceleration
```python
# CUDA optimization
if torch.cuda.is_available():
    # Use GPU with optimized settings
    torch.backends.cudnn.benchmark = True
    torch.backends.cudnn.deterministic = False
    
    # Memory optimization
    torch.cuda.empty_cache()
    
    # Use mixed precision for faster inference
    model.half()  # FP16 precision
```

### Memory Management
```python
import gc
import psutil

def monitor_memory():
    """Monitor system memory usage"""
    memory = psutil.virtual_memory()
    return {
        "total": memory.total,
        "available": memory.available,
        "percent": memory.percent,
        "used": memory.used
    }

def cleanup_resources():
    """Clean up memory and temporary files"""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
```

### Batch Processing
```python
def process_video_batch(video_paths: List[str]):
    """Process multiple videos in batch for efficiency"""
    batch_results = []
    
    for batch in chunk_list(video_paths, BATCH_SIZE):
        # Process batch of videos
        batch_results.extend(model(batch, stream=False))
    
    return batch_results
```

## 📊 Monitoring & Logging

### Logging Configuration
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        RotatingFileHandler(
            LOG_FILE, 
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        ),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("model-service")
```

### Performance Metrics
```python
import time
from functools import wraps

def measure_time(func):
    """Decorator to measure function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        execution_time = time.time() - start_time
        logger.info(f"{func.__name__} executed in {execution_time:.2f}s")
        return result
    return wrapper

@measure_time
def predict_video(video_path: str, metadata: dict):
    # Video processing with timing
    pass
```

## 🔧 Configuration Management

### Model Configuration
```python
# Model hyperparameters
MODEL_CONFIG = {
    "confidence_threshold": 0.5,
    "iou_threshold": 0.45,
    "max_detections": 300,
    "image_size": 640,
    "device": "auto"
}

# Video processing settings
VIDEO_CONFIG = {
    "max_size_mb": 500,
    "supported_formats": ["mp4", "avi", "mov", "mkv"],
    "output_format": "mp4",
    "compression_level": 23
}
```

### Environment-based Configuration
```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    model_weights: str
    video_dir: str
    backend_url: str
    internal_secret: str
    confidence_threshold: float = 0.5
    accident_threshold: float = 0.7
    cooldown_seconds: int = 30
    device: str = "auto"
    
    @classmethod
    def from_env(cls):
        return cls(
            model_weights=os.getenv("YOLO_WEIGHTS"),
            video_dir=os.getenv("VIDEO_DIR"),
            backend_url=os.getenv("INTERNAL_BACKEND_URL"),
            internal_secret=os.getenv("INTERNAL_SECRET"),
            confidence_threshold=float(os.getenv("CONFIDENCE_THRESHOLD", "0.5")),
            accident_threshold=float(os.getenv("ACCIDENT_THRESHOLD", "0.7")),
            cooldown_seconds=int(os.getenv("COOLDOWN_SECONDS", "30"))
        )
```

## 🐛 Troubleshooting

### Common Issues

#### Model Loading Problems
```bash
# Check model file exists and permissions
ls -la weights/best.pt

# Verify YOLO installation
python -c "from ultralytics import YOLO; print('YOLO imported successfully')"

# Check CUDA availability
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
```

#### Video Processing Errors
```bash
# Check FFmpeg installation
ffmpeg -version

# Verify video file integrity
ffprobe video_file.mp4

# Check disk space
df -h
```

#### Memory Issues
```bash
# Monitor memory usage
htop

# Check GPU memory (if using CUDA)
nvidia-smi

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
```

#### Google Drive Upload Issues
```bash
# Verify service account credentials
python -c "
from google.oauth2.service_account import Credentials
creds = Credentials.from_service_account_file('credentials/drive_sa.json')
print('Credentials loaded successfully')
"

# Check internet connectivity
curl -I https://www.googleapis.com/drive/v3/files
```

## 📚 Additional Resources

- [YOLOv11 Documentation](https://docs.ultralytics.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenCV Python Documentation](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
- [Google Drive API Guide](https://developers.google.com/drive/api/v3/quickstart/python)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [PyTorch Documentation](https://pytorch.org/docs/stable/index.html)

## 🤝 Contributing

When contributing to the model service:

1. Follow Python PEP 8 style guidelines
2. Write comprehensive tests for new features
3. Document new configuration parameters
4. Optimize for performance and memory usage
5. Update model documentation for changes
6. Test with both CPU and GPU configurations

## 🎯 Model Training & Customization

### Training Custom Models
```python
# Example training script
from ultralytics import YOLO

# Load a pre-trained model
model = YOLO('yolo11n.pt')

# Train the model
results = model.train(
    data='path/to/dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device='cuda'
)

# Export trained model
model.export(format='onnx')
```

### Model Evaluation
```python
# Validate model performance
metrics = model.val(data='path/to/validation.yaml')

# Test on custom images
results = model('path/to/test/images')
results.save(save_dir='runs/predict')
```

---

**Model Service** - Powering intelligent accident detection with cutting-edge AI technology. 