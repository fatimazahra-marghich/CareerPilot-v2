import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import CV
# Importe ton moteur Groq ou DeepSeek ici
# from .ai_engine import generate_ai_response 

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Récupère l'ID depuis l'URL configurée dans tes urlpatterns
        self.analysis_id = self.scope['url_route']['kwargs']['analysis_id']
        cv_data = await self.get_cv_data(self.analysis_id)
        
        await self.accept()

        if cv_data and cv_data.extracted_text:
            self.extracted_text = cv_data.extracted_text
            self.history = []
            
            # Initialisation de l'IA avec le vrai texte du CV
            init_prompt = "Analyse mon CV et pose-moi une question technique."
            # ai_text = generate_ai_response(self.extracted_text, self.history, init_prompt)
            ai_text = "Bonjour ! J'ai bien analysé votre CV. Commençons l'entretien technique."
            
            await self.send(text_data=json.dumps({'text': ai_text}))
        else:
            await self.send(text_data=json.dumps({'text': "⚠️ Erreur : Texte du CV introuvable."}))

    @database_sync_to_async
    def get_cv_data(self, analysis_id):
        # Utilise le modèle CV de tes fichiers
        return CV.objects.filter(id=analysis_id).first()

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_text = data.get('text', '')
        # Logique de réponse IA...