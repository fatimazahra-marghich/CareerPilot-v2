from django.contrib import admin
from .models import JobMatch

@admin.register(JobMatch)
class JobMatchAdmin(admin.ModelAdmin):
    # Colonnes affichées dans la liste
    list_display = ('id', 'cv', 'score', 'created_at')
    
    # Filtres sur le côté droit
    list_filter = ('score', 'created_at')
    
    # Barre de recherche (recherche par ID de CV ou texte de l'offre)
    search_fields = ('cv__id', 'job_description', 'advice')
    
    # Organisation du détail du formulaire
    fieldsets = (
        ('Informations Générales', {
            'fields': ('cv', 'score')
        }),
        ('Analyse IA', {
            'fields': ('matching_skills', 'missing_skills', 'advice')
        }),
        ('Données Sources', {
            'fields': ('job_description',),
            'classes': ('collapse',) # Masqué par défaut pour ne pas encombrer
        }),
    )
    
    readonly_fields = ('created_at',)

    