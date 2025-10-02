FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml poetry.lock* /app/
RUN pip install --no-cache-dir fastapi uvicorn
COPY app /app/app
