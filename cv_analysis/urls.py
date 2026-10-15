from django.urls import path
from .views import (
    upload_and_analyze_cv,
    
    analysis_detail,
    analysis_history,
    latest_optimized_cv,
    download_optimized_cv_pdf,
)

urlpatterns = [
    path("upload-analyze", upload_and_analyze_cv, name="upload_and_analyze_cv"),
    path("analysis/<int:analysis_id>", analysis_detail, name="analysis_detail"),
    path("history", analysis_history, name="analysis_history"),
    path("latest-optimized-cv", latest_optimized_cv, name="latest_optimized_cv"),
        path("optimized-cv/<int:optimized_id>/pdf", download_optimized_cv_pdf, name="download_optimized_cv_pdf"),

]