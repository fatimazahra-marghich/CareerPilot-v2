from django.contrib import admin
from .models import InterviewSession

@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    # Les colonnes à afficher dans la liste
    list_display = ('user', 'session_id', 'created_at')
    # Les champs sur lesquels on peut faire une recherche
    search_fields = ('user__username', 'session_id')
    # Un filtre latéral par date
    list_filter = ('created_at',)
    # Permet de voir le JSON de l'historique proprement
    readonly_fields = ('created_at',)