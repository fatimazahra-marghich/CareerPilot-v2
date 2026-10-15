import os
import django
from django.core.asgi import get_asgi_application

# 1. Définir les settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_config.settings")

# 2. Initialiser Django COMPLÈTEMENT avant d'importer le reste
django_asgi_app = get_asgi_application()

# 3. Maintenant on peut importer Channels et nos routes
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import Interview.routing  # Vérifiez que le 'I' est bien majuscule comme votre dossier

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                Interview.routing.websocket_urlpatterns
            )
        ),
    }
)