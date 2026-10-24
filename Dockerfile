FROM python:3.10-slim

# Dépendances système pour psycopg2 et lxml
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Créer le dossier media
RUN mkdir -p /app/media/cvs

EXPOSE 8000

# Daphne pour WebSocket (entretien vocal)
CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 backend_config.asgi:application"]