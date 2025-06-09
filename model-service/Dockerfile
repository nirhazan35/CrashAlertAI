# ─────────────────────────────────────────────────────────────
# CrashAlertAI · model-service  (CPU‑ready base image)
# ─────────────────────────────────────────────────────────────
FROM python:3.11-slim

# 1. OS‑level dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg git build-essential && \
    rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/credentials /app/videos /app/weights

# 2. Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Application code
COPY . .

# 4. Service‑account key mount path (defined in docker‑compose.yml)
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/drive_sa.json

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]