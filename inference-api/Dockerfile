FROM python:3.11-slim

ARG HTTP_PROXY
ARG http_proxy
ARG HTTPS_PROXY
ARG https_proxy

ENV HTTP_PROXY=$HTTP_PROXY
ENV http_proxy=$http_proxy
ENV HTTPS_PROXY=$HTTPS_PROXY
ENV https_proxy=$https_proxy

ARG FASTAPI_URL
ENV FASTAPI_URL=$FASTAPI_URL

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for static files
RUN mkdir -p /app/static/results

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
