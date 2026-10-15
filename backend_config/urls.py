from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/cv/', include('cv_analysis.urls')),
    path("api/dashboard/", include("dashboard.urls")),
    
    # CORRECTION : On utilise le nom exact du dossier "Interview"
    
    # Ta ligne pour le matching
    path("api/matching/", include("matching.urls")),
]