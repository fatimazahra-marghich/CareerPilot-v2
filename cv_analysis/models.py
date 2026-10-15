from django.db import models
from django.contrib.auth.models import User


class CV(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cvs")
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255, blank=True, null=True)
    photo_path = models.CharField(max_length=255, blank=True, null=True)
    extracted_text = models.TextField(blank=True, null=True)
    ats_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} - {self.user.username}"

class OptimizedCV(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name="optimized_versions")
    generated_content = models.TextField(blank=True, null=True)
    optimized_data = models.JSONField(default=dict, blank=True)

    score_original = models.PositiveIntegerField(default=0)
    score_optimized = models.PositiveIntegerField(default=0)
    improvement = models.PositiveIntegerField(default=0)

    pdf_path = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Optimized CV for {self.cv.file_name}"


class CVAnalysisResult(models.Model):
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name="analysis_result")
    status = models.CharField(max_length=20, default="analysed")

    tech_relevance = models.PositiveIntegerField(default=0)
    experience_score = models.PositiveIntegerField(default=0)
    education_score = models.PositiveIntegerField(default=0)
    structure_score = models.PositiveIntegerField(default=0)

    technical_skills = models.JSONField(default=list, blank=True)
    soft_skills = models.JSONField(default=list, blank=True)

    present_keywords = models.JSONField(default=list, blank=True)
    missing_keywords = models.JSONField(default=list, blank=True)
    found_sections = models.JSONField(default=list, blank=True)

    tips = models.JSONField(default=list, blank=True)

    ai_analysis = models.JSONField(default=dict, blank=True)
    ai_optimization = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for {self.cv.file_name}"