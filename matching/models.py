from django.db import models
from cv_analysis.models import CV

class JobMatch(models.Model):
    # C'est cette ligne précisément qu'il faut corriger :
    cv = models.ForeignKey(CV, on_delete=models.CASCADE)
    job_description = models.TextField()
    score = models.IntegerField()
    matching_skills = models.JSONField() 
    missing_skills = models.JSONField()  
    advice = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match {self.cv.id} - {self.score}%"