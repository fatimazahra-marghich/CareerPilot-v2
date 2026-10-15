from django.db import models
from django.contrib.auth.models import User


class DashboardStat(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dashboard_stat')
    total_cvs = models.IntegerField(default=0)
    total_interviews = models.IntegerField(default=0)
    average_ats_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    average_matching_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dashboard Stats - {self.user.username}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    
    phone = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    # 🔥 AJOUTE ICI
    email_notifications = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default="fr")
    dark_mode = models.BooleanField(default=False)
    analytics_anonymous = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username