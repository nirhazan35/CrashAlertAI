CrashAlertAI Model Service
=========================

Overview
--------
This is the model inference microservice for CrashAlertAI. It uses a YOLOv11 model to detect accidents in video files, trims relevant video segments, uploads them to Google Drive, and notifies the backend. The service is built with FastAPI and is designed to run in a containerized environment.

Directory Structure
-------------------
- **app.py**: Main FastAPI application, video processing, and API endpoints.
- **uploader.py**: Video trimming and Google Drive upload utilities.
- **requirements.txt**: Python dependencies for the service.
- **Dockerfile**: Containerization instructions.
- **tests/**: Unit and integration tests for API, video processing, and uploader.
- **weights/**: (Ignored by git) Directory for YOLO model weights (e.g., `best.pt`).
- **videos/**: (Ignored by git) Directory for input video files to be processed.
- **credentials/**: (Ignored by git) Directory for Google Drive service account credentials.
- **.env**: (Ignored by git) Environment variable configuration file.

Required Files (Not in Git)
---------------------------
The following files/directories are required for the service to run but are **not tracked in git**. You must add them manually:
- `weights/best.pt`: The YOLOv11 model weights file. Obtain from your training pipeline or model provider.
- `videos/`: Directory for input video files (e.g., `.mp4`). Place videos to be processed here.
- `credentials/drive_sa.json`: Google service account credentials for Drive API access. Obtain from your Google Cloud Console.
- `.env`: Environment variables file. See below for required variables.

Setup & Installation
--------------------
1. **Clone the repository and enter the directory:**
   ```
   git clone <repo-url>
   cd model-service
   ```
2. **Install dependencies (for local development):**
   ```
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Prepare required files:**
   - Download/copy your YOLO weights to `weights/best.pt`.
   - Place input videos in the `videos/` directory.
   - Add your Google Drive service account JSON to `credentials/drive_sa.json`.
   - Create a `.env` file with the following variables:
     ```
     YOLO_WEIGHTS=weights/best.pt
     VIDEO_DIR=videos
     INTERNAL_BACKEND_URL=<backend-accident-endpoint>
     INTERNAL_SECRET=<internal-api-secret>
     SERVICE_ACCOUNT_FILE=credentials/drive_sa.json
     # (Optional) Other variables as needed
     ```

Running the Service
-------------------
- **Locally (development):**
  ```
  uvicorn app:app --host 0.0.0.0 --port 8000 --reload
  ```
  Or use the provided makefile:
  ```
  make run
  ```
- **With Docker:**
  1. Build the image:
     ```
     docker build -t crashalert-model-service .
     ```
  2. Run the container (mount required folders):
     ```
     docker run -p 8000:8000 \
       -v $(pwd)/weights:/app/weights \
       -v $(pwd)/videos:/app/videos \
       -v $(pwd)/credentials:/app/credentials \
       --env-file .env \
       crashalert-model-service
     ```

Main Features
-------------
- **Accident Detection:** Runs YOLOv11 on input videos to detect accidents.
- **Video Trimming:** Extracts relevant video segments around detected events.
- **Google Drive Upload:** Uploads trimmed clips to Drive and makes them public.
- **Backend Notification:** Sends accident data (with video link) to the backend.
- **REST API:** FastAPI endpoints for health check, video listing, and processing.

API Endpoints
-------------
- `GET /health` — Health check (returns status and model load state)
- `GET /videos` — List available videos in the `videos/` directory
- `POST /run` — Start processing a video (requires `videoId`, `cameraId`, `location`)

Environment Variables
---------------------
- `YOLO_WEIGHTS`: Path to YOLO model weights (e.g., `weights/best.pt`)
- `VIDEO_DIR`: Path to directory containing input videos (e.g., `videos`)
- `INTERNAL_BACKEND_URL`: Backend endpoint to notify of detected accidents
- `INTERNAL_SECRET`: Secret for authenticating with the backend
- `SERVICE_ACCOUNT_FILE`: Path to Google Drive service account JSON (e.g., `credentials/drive_sa.json`)

Testing
-------
- **Install test dependencies:**
  ```
  pip install -r test_requirements.txt
  ```
- **Run all tests:**
  ```
  ./run_tests.sh
  ```
  or
  ```
  pytest tests/ -v --tb=short
  ```

Notes
-----
- The following are **not tracked in git** and must be provided:
  - `weights/best.pt`
  - `videos/` (input videos)
  - `credentials/drive_sa.json`
  - `.env`
- The service requires ffmpeg (installed in the Docker image) for video trimming.
- Google Drive API usage may be subject to quota and permissions.
