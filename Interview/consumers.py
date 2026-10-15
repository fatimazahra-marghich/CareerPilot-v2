import json
import os
import base64
import edge_tts
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from groq import Groq
from cv_analysis.models import CV

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.cv_id = self.scope['url_route']['kwargs']['cv_id']
        cv_obj = await self.get_cv(self.cv_id)
        
        if cv_obj and cv_obj.extracted_text:
            await self.accept()
            self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            self.extracted_text = cv_obj.extracted_text
            self.question_count = 1 
            
            # Message d'accueil personnalisé selon le CV
            prompt_init = (
                f"Voici le CV du candidat : {self.extracted_text}. "
                "Salue le candidat avec enthousiasme et professionnalisme. "
                "Pose une première question brève pour briser la glace sur son parcours ou une techno clé du CV."
            )
            response_text = await self.ask_ai(prompt_init)
            await self.send_speech(response_text)
        else:
            await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_text = data.get('text', '')
        
        self.question_count += 1
        
        if self.question_count <= 5:
            # Entretien dynamique : Rebond et nouvelle question
            prompt = (
                f"CONTEXTE CV : {self.extracted_text}\n"
                f"RÉPONSE DU CANDIDAT : '{user_text}'\n"
                f"PROGRESSION : Question {self.question_count}/5.\n\n"
                "INSTRUCTIONS :\n"
                "1. Rebondis sur un élément technique qu'il vient de dire (montre que tu écoutes).\n"
                "2. Enchaîne sur une question concernant une AUTRE compétence du CV (sois précis).\n"
                "3. Si la réponse était trop courte, demande une précision sur un projet.\n"
                "4. Garde un ton de recruteur expert (max 30 mots)."
            )
        else:
            # Fin de l'entretien
            prompt = (
                f"Le candidat a dit : '{user_text}'. "
                "C'est la fin de l'entretien. Fais une conclusion chaleureuse, "
                "remercie-le et dis-lui que l'équipe reviendra vers lui prochainement. Pas de question."
            )

        response_text = await self.ask_ai(prompt)
        await self.send_speech(response_text, is_final=(self.question_count > 5))

    async def ask_ai(self, prompt):
        system_instruction = (
            "Tu es Alex, recruteur tech senior chez CareerPilot. "
            "TON PERSONNAGE : Tu es percutant, pro et bienveillant. "
            "RÈGLES STRICTES :\n"
            "- NE DIS JAMAIS 'C'est noté' ou 'Très bien'. Utilise des transitions naturelles (ex: 'C'est un point intéressant...', 'D'accord, et par rapport à...').\n"
            "- Si l'utilisateur bafouille ou fait une erreur de micro ('la Ravel'), interprète cela comme 'Laravel'.\n"
            "- Ne fais pas de listes. Fais des phrases fluides pour l'oral.\n"
            "- Limite tes réponses à 25-30 mots maximum."
        )
        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Erreur Groq: {e}")
            return "Je vois. Pouvez-vous me détailler votre rôle sur votre dernier projet ?"

    async def send_speech(self, text, is_final=False):
        # Utilisation d'une voix naturelle pour Alex
        voice = "fr-FR-DeniseNeural" 
        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        
        try:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            await self.send(text_data=json.dumps({
                'text': text,
                'audio': audio_base64,
                'end_of_turn': not is_final 
            }))
        except Exception as e:
            print(f"Erreur TTS: {e}")
            # Envoi du texte seul si l'audio échoue
            await self.send(text_data=json.dumps({'text': text, 'audio': None}))

    @database_sync_to_async
    def get_cv(self, cv_id):
        return CV.objects.filter(id=cv_id).first()

    async def disconnect(self, close_code):
        print(f"WebSocket déconnecté : {close_code}")