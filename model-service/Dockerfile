# ---------- Builder ----------
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .

# Install build dependencies only for wheels that need compilation
RUN apt-get update && apt-get install -y gcc g++ && \
    pip wheel --no-cache-dir \
        --wheel-dir /wheels \
        -r requirements.txt && \
    apt-get purge -y gcc g++ && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# ---------- Runtime ----------
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

RUN addgroup --system appgroup && adduser --system --group appuser
WORKDIR /app

# Install CPU-specific PyTorch first
RUN pip install --no-cache-dir \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    -f https://download.pytorch.org/whl/cpu/torch_stable.html

# Install other requirements
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && \
    rm -rf /wheels && \
    pip uninstall -y ultralytics && \
    pip install --no-cache-dir ultralytics==8.2.4 --no-deps

COPY app.py ./
COPY uploader.py ./

RUN mkdir -p /app/videos /app/weights /app/credentials && \
    chown -R appuser:appgroup /app

ENV PYTHONUNBUFFERED=1 \
    GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/drive_sa.json
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fs http://127.0.0.1:8000/health || exit 1
USER appuser
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]