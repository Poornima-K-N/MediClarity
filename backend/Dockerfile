# Multi-stage Dockerfile for MediClarity (Combined PWA Frontend + Python Flask Backend)

# Stage 1: Build React Frontend PWA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend with Tesseract OCR & Gunicorn
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies: Tesseract OCR, English language data, and graphics libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from stage 1 into the expected location
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose server port (Render dynamically sets $PORT at runtime)
ENV PORT=5000
EXPOSE 5000

# Set working directory to backend
WORKDIR /app/backend

# Launch with Gunicorn dynamically binding to Render's $PORT
CMD ["sh", "-c", "exec gunicorn -b 0.0.0.0:${PORT:-5000} --workers 2 --timeout 120 run:app"]
