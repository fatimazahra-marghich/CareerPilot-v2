from django.urls import re_path
from Interview.consumers import InterviewConsumer # Import depuis votre dossier séparé

websocket_urlpatterns = [
    re_path(r'ws/interview/(?P<cv_id>\d+)/$', InterviewConsumer.as_asgi()),
]