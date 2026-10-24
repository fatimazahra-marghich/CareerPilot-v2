from django.db import models
from django.contrib.auth.models import User
from cv_analysis.models import CV

class InterviewSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100, unique=True)
    cv_text = models.TextField(blank=True, null=True)
    history = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Entretien {self.user.username} - {self.session_id}"
    
class InterviewReport(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name="interview_reports")
    score = models.IntegerField(default=0)
    report = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rapport entretien CV {self.cv_id} - {self.score}/100"