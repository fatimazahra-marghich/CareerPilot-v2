from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Le nom ici doit être EXACTEMENT cv_id
    re_path(r'ws/interview/(?P<cv_id>\d+)/$', consumers.InterviewConsumer.as_asgi()),
]