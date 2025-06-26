# CrashAlertAI

CrashAlertAI is an end-to-end platform for real-time accident detection, alerting, and analytics. It consists of a React frontend, a Node.js/Express backend, and a Python-based model inference microservice using YOLOv11. The system is fully containerized and orchestrated with Docker Compose.

---

## Project Structure

```
├── frontend/         # React web application (user/admin dashboard)
├── backend/          # Node.js/Express REST API and Socket.IO server
├── model-service/    # FastAPI microservice for accident detection (YOLOv11)
├── docker-compose.yml
└── ...
```

---

## Features

- **Real-Time Accident Detection:** Video analysis using our custom trained YOLO11 model, with automatic alerting and video clip generation.
- **User & Camera Management:** Admin and user roles, camera assignment, and management.
- **Live Monitoring & Analytics:** Real-time dashboard, statistics, and historical accident logs.
- **Notifications:** Real-time notifications for admins and users.
- **Google Drive Integration:** Automatic upload of accident video clips.
- **Secure & Scalable:** JWT authentication, role-based access, and containerized deployment.

---

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- (For local development) Node.js, Python 3.11+, and pip

---

## Setup & Installation

### 1. Prepare Required Files

Some files must be added manually:

- **Model Weights:** `weights/best.pt` (YOLO11 weights)
- **Google Credentials:** `secrets/drive_sa.json` (Google Drive service account)
- **Videos Directory:** `model-service/videos/` (input videos for testing)
- **Environment Variables:** `.env` file in the project root (see below)

### 2. Environment Variables

Create a `.env` file in the project root with the following variables:

```
NODE_ENV: development / production
MONGO_URL: MongoDB connection string
ACCESS_TOKEN_SECRET: Secret key for signing JWT access tokens
INTERNAL_SECRET: Secret key for internal service 
REACT_APP_URL_FRONTEND: Frontend URL allowed for CORS (e.g., http://localhost:3000)
REACT_APP_URL_BACKEND: Backend URL
EMAIL_ADDRESS: Email address used for sending notifications 
EMAIL_PASS: Password or app password for the email account
INTERNAL_BACKEND_URL: Backend endpoint to notify of detected accidents (e.g., `http://localhost:3001/accidents/internal-new-accident`)
ACCIDENT_THRESHOLD: Confidence threshold for accident detection (e.g., 0.7 for 70% confidence threshold)
```

> **Note:** Adjust paths and secrets as needed for your environment.

### 3. Build & Run with Docker Compose

From the project root, run:

```sh
docker compose up --build
```

This will build and start all services:
- **frontend** (React, port 3000)
- **backend** (Node.js/Express, port 3001)
- **model-service** (FastAPI, port 8000)
- **mongo** (MongoDB, port 27017)

---

## Service Overview

### Frontend (`/frontend`)
- React app for users and admins
- Real-time dashboard, statistics, history, live camera feed, notifications
- Connects to backend via REST and Socket.IO

### Backend (`/backend`)
- Node.js/Express REST API and Socket.IO server
- User authentication, camera and accident management, email notifications
- Connects to MongoDB and receives accident alerts from model-service

### Model Service (`/model-service`)
- FastAPI microservice for video analysis
- Runs YOLO11 on uploaded videos, trims relevant clips, uploads to Google Drive
- Notifies backend of detected accidents

---

## API Endpoints

### Backend
- `POST /auth/login`, `POST /auth/register`, `GET /users/get-all-users`, etc.
- `GET /accidents/active-accidents`, `POST /accidents/handle-accident`, etc.
- `GET /health` (health check)

### Model Service
- `GET /health` (health check)
- `GET /videos` (list available videos)
- `POST /run` (process a video for accident detection)

---

## Testing

Each service has its own test suite:

- **Frontend:** `npm test` (from `frontend/`)
- **Backend:** `npm test` (from `backend/`)
- **Model Service:** `./run_tests.sh` or `pytest tests/` (from `model-service/`)

---

## Notes & Tips

- **Required Files:** `model-service/weights/best.pt`, `model-service/credentials/drive_sa.json`, `model-service/videos/`, and the `.env` files are not tracked in git and must be provided.
- **Google Drive API:** Ensure your service account has permission to upload and share files.
- **CORS:** The backend is configured to allow requests from the frontend.