FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable stdout logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies (build + runtime)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade packaging tools FIRST (fixes your error)
RUN pip install --upgrade pip setuptools wheel

# Copy only dependency files first (better caching)
COPY pyproject.toml ./
# If you have these, they’ll be picked up automatically
COPY setup.cfg* setup.py* ./

# Install dependencies (no silent failures)
RUN pip install --no-cache-dir ".[test]"

# Now copy the rest of the app
COPY . .

# Create required directories
RUN mkdir -p uploads/resumes

# Expose app port
EXPOSE 8000

# Run app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app/app"]