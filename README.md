# CareerPilot

Plateforme intelligente de préparation à l'emploi : analyse et optimisation de CV (score ATS),
matching CV / offre d'emploi, et simulation d'entretien vocal avec IA.

## Fonctionnalités

- Inscription / connexion
- Upload et analyse de CV, CV optimisé (export PDF)
- Matching CV / offre
- Entretien vocal en temps réel (WebSocket)
- Dashboard, profil, paramètres

## Stack

| Partie | Technologies | Dossier |
|---|---|---|
| Frontend | React, Vite | `frontend/` |
| Backend | Django, Django REST Framework, Channels, Daphne | `users/`, `cv_analysis/`, `matching/`, `dashboard/`, `Interview/` |
| Base de données | PostgreSQL 15 | `backend_config/settings.py` |
| IA | Groq (openai/gpt-oss-120b), Edge-TTS (voix), reconnaissance vocale du navigateur | `Interview/`, `cv_analysis/`, `matching/` |
| Conteneurisation | Docker, Docker Compose | `Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` |
| CI/CD | GitLab CI/CD | `.gitlab-ci.yml` |

## Équipe

Le projet est réalisé par une équipe de deux personnes :

| Rôle | Périmètre | Dossiers |
|---|---|---|
| Frontend + IA | Interface React et parties IA côté client | `frontend/` |
| Backend + IA | API Django, base de données et parties IA côté serveur | `users/`, `cv_analysis/`, `matching/`, `dashboard/`, `Interview/`, `backend_config/` |

## Configuration

Créer le fichier `.env` à la racine à partir du modèle (il n'est jamais commité) :

```bash
cp .env.example .env
```

| Variable | Rôle |
|---|---|
| `SECRET_KEY`, `DEBUG` | Configuration Django |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Connexion PostgreSQL |
| `GROQ_API_KEY`, `GROQ_MODEL` | Accès au service d'IA |

Le frontend lit `VITE_API_URL` (voir `frontend/.env.example`).
Les clés API vont uniquement dans `.env`.

## Lancer le projet

### Sans Docker

Prérequis : Python 3.11+, Node.js 18+, PostgreSQL.

```bash
# Backend
python -m venv venv
source venv/bin/activate    # Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://127.0.0.1:8000

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

### Avec Docker

Prérequis : Docker et Docker Compose.

```bash
docker compose up --build
```

| Service | Image | Port |
|---|---|---|
| `db` | `postgres:15` | interne |
| `backend` | `Dockerfile` (python:3.10-slim, Daphne) | 8000 |
| `frontend` | `frontend/Dockerfile` (node:20-slim, serve) | 80 |

- Frontend : http://localhost
- API : http://localhost:8000

Les migrations sont appliquées au démarrage du backend. Les volumes `postgres_data` et
`media_data` conservent la base de données et les CV envoyés.

```bash
docker compose down            # arrêter les services
docker compose down -v         # arrêter et supprimer les volumes
docker compose logs -f backend # suivre les logs du backend
```

## Tests

### Backend

```bash
python manage.py test --verbosity=2
```

Les tests nécessitent PostgreSQL : Django crée une base temporaire `test_<DB_NAME>`.
Ils couvrent les applications `users`, `cv_analysis`, `dashboard` et `matching`.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## CI/CD GitLab

Le pipeline est défini dans `.gitlab-ci.yml`. Il s'exécute sur les merge requests et sur
les branches `test` et `main`.

| Étape | Job | Description |
|---|---|---|
| `test` | `test_backend` | Tests Django avec rapport de couverture, base `postgres:15` en service |
| `test` | `test_frontend` | Lint et build du frontend (Node 20) |
| `build` | `build_backend` | Construction de l'image backend et envoi dans le Container Registry |
| `build` | `build_frontend` | Construction de l'image frontend et envoi dans le Container Registry |
| `deploy` | `deploy` | Déploiement SSH, manuel, uniquement sur `main` |

Les images sont publiées sous `$CI_REGISTRY_IMAGE/backend` et `$CI_REGISTRY_IMAGE/frontend`,
avec les tags `$CI_COMMIT_SHORT_SHA` et `latest`.

### Variables CI/CD

À définir dans **Settings > CI/CD > Variables** pour le job `deploy` :

| Variable | Description |
|---|---|
| `SSH_PRIVATE_KEY` | Clé privée SSH du serveur |
| `SSH_USER` | Utilisateur SSH |
| `SSH_HOST` | Adresse du serveur |

Le fichier `.env` doit exister sur le serveur dans `/app/CareerPilot-v2`.

Les variables de test (`DB_*`, `POSTGRES_*`, `SECRET_KEY`, `GROQ_*`) sont définies
directement dans `.gitlab-ci.yml`.

### Workflow

1. Développer sur une branche et pousser sur `test` : le pipeline lance les tests et les builds.
2. Ouvrir une merge request de `test` vers `main` : le pipeline se relance.
3. Après fusion sur `main`, lancer manuellement le job `deploy`.
