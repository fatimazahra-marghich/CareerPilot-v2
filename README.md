# CareerPilot

Plateforme intelligente de préparation à l'emploi : analyse et optimisation de CV (score ATS),
matching CV / offre d'emploi, et simulation d'entretien vocal avec IA.

## Architecture

| Partie | Technologies | Dossier |
|---|---|---|
| Frontend | React, Vite | `frontend/` |
| Backend API | Django, Django REST Framework, Channels (WebSocket) | `users/`, `cv_analysis/`, `matching/`, `dashboard/`, `Interview/` |
| Base de données | PostgreSQL | configurée dans `backend_config/settings.py` |
| IA | Groq (Llama 3.3), Hugging Face, Whisper (voix), Edge-TTS | `Interview/`, `cv_analysis/`, `matching/` |

## Lancer le projet

Prérequis : Python 3.11+, Node.js 18+, PostgreSQL.

```bash
# 1. Configuration
cp .env.example .env        # puis remplir les valeurs

# 2. Backend
python -m venv venv
source venv/bin/activate    # Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://127.0.0.1:8000

# 3. Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

Le STT local (Whisper) est dans `requirements.txt`. Les clés API vont uniquement dans `.env`.

## Fonctionnalités

- Inscription / connexion
- Upload et analyse de CV, CV optimisé (export PDF)
- Matching CV / offre
- Entretien vocal en temps réel (WebSocket)
- Dashboard, profil, paramètres

## Équipe et répartition

- Frontend + Docker : _à compléter_
- Backend + base de données : _à compléter_

## À faire

- [ ] Docker / docker-compose
- [ ] Tests automatisés
- [ ] Parties IA (RAG : chunking, embeddings, base vectorielle)
