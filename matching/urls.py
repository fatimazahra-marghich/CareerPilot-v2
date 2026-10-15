from django.urls import path
from .views import analyze_job_match

urlpatterns = [
    # Ici, le chemin vide '' correspond à /api/matching/
    # Si tu veux /api/matching/analyze/, écris :
    path('analyze/', analyze_job_match, name='analyze_job_match'),
]