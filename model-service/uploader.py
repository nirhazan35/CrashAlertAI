"""
CrashAlertAI • Video-trim & Google-Drive uploader
-------------------------------------------------
Functions
---------
trim_video_ffmpeg(input_video, start_time, duration, output_video)
    → str  |  Path to the trimmed MP4.

upload_to_drive(file_path)
    → str  |  Public Google-Drive “/view” URL in a date-based sub-folder.
"""

import os
import subprocess
import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from dotenv import load_dotenv
import logging

logger = logging.getLogger("model-service.uploader")
# Configuration
if os.environ.get("RUNNING_IN_DOCKER") != "1":
    dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE", "/app/credentials/drive_sa.json")
ROOT_FOLDER_ID       = "1ycXApVQxo6s2AGJnaEpjO_yVHiZs7WVX"   # your Drive root for CrashAlert clips

SCOPES = ["https://www.googleapis.com/auth/drive.file"]

credentials  = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build("drive", "v3", credentials=credentials)

# Helpers
def trim_video_ffmpeg(
    input_video: str,
    start_time: float,
    duration: float,
    output_video: str = "/tmp/trimmed_video.mp4"
) -> str:
    """Trim & re-encode a segment for fast streaming on Drive."""
    cmd = [
        "ffmpeg",
        "-i", input_video,
        "-ss", str(start_time),
        "-t",  str(duration),
        "-vf", "scale=640:-1",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf",  "28",
        "-c:a", "aac",
        "-b:a", "96k",
        "-movflags", "+faststart",
        output_video,
        "-y"
    ]
    subprocess.run(cmd, check=True)
    return output_video


def _get_or_create_today_folder() -> str:
    """Return Drive folder-ID named YYYY-MM-DD under ROOT_FOLDER_ID."""
    today = datetime.date.today().isoformat()
    query = (
        f"'{ROOT_FOLDER_ID}' in parents and "
        f"name='{today}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    )
    resp = drive_service.files().list(q=query, fields="files(id)", pageSize=1).execute()
    if resp["files"]:
        return resp["files"][0]["id"]

    meta = {
        "name": today,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [ROOT_FOLDER_ID],
    }
    return drive_service.files().create(body=meta, fields="id").execute()["id"]


def upload_to_drive(file_path: str) -> str:
    """Upload MP4, set it public, and return the shareable /view link."""
    folder_id = _get_or_create_today_folder()
    media     = MediaFileUpload(file_path, mimetype="video/mp4")

    meta = {"name": os.path.basename(file_path), "parents": [folder_id]}
    file = drive_service.files().create(body=meta, media_body=media, fields="id").execute()

    drive_service.permissions().create(
        fileId=file["id"], body={"role": "reader", "type": "anyone"}, fields="id"
    ).execute()
    
    link = f"https://drive.google.com/file/d/{file['id']}/view"
    return link


if __name__ == "__main__":
    SAMPLE = "/app/videos/demo.mp4"
    start, dur = 5.0, 15.0                       # example offsets
    clip = trim_video_ffmpeg(SAMPLE, start, dur)
    print("🎬  Trimmed clip:", clip)
    link = upload_to_drive(clip)
    print("✅  Uploaded →", link)