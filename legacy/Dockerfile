FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# gcc and libpq-dev are often needed for psycopg2 (Postgres)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Initialize the database (if using SQLite for simple demo, otherwise configured via env)
# In production with Postgres, this might be handled differently (e.g. init container)
ENV REFLEX_ENV=prod

# Expose the port Reflex runs on
EXPOSE 8000

# Run the app
# Reflex run in production mode
CMD ["reflex", "run", "--env", "prod", "--backend-only", "--loglevel", "debug"]

