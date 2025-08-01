# ---------- builder ----------
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel -r requirements.txt --wheel-dir /wheels

# ---------- runtime ----------
FROM python:3.11-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg curl tzdata \
 && ln -sf /usr/share/zoneinfo/Asia/Jerusalem /etc/localtime \
 && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Jerusalem

RUN addgroup --system appgroup && adduser --system --group appuser
WORKDIR /app

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

COPY app.py ./
COPY uploader.py ./

RUN mkdir -p /app/videos /app/weights /app/credentials \
 && chown -R appuser:appgroup /app

ENV PYTHONUNBUFFERED=1 \
    GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/drive_sa.json

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fs http://127.0.0.1:8000/health || exit 1

USER appuser
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]