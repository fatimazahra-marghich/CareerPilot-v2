import json
import os
import base64
import asyncio
import edge_tts
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from groq import Groq
from cv_analysis.models import CV
from Interview.models import InterviewReport

# Le modèle se change dans .env (GROQ_MODEL) sans toucher au code.
# llama-3.3-70b-versatile a été retiré par Groq le 16 août 2026.
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# Questions de secours si l'IA est indisponible (différentes à chaque tour).
FALLBACK_QUESTIONS = [
    "Parlez-moi de votre parcours et de ce qui vous a mené vers l'informatique.",
    "Quel projet de votre CV êtes-vous le plus fier d'avoir réalisé, et pourquoi ?",
    "Quelle difficulté technique avez-vous rencontrée récemment, et comment l'avez-vous résolue ?",
    "Comment organisez-vous votre travail quand vous collaborez en équipe sur un projet ?",
    "Quelle technologie aimeriez-vous approfondir dans les prochains mois ?",
]


class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.cv_id = self.scope['url_route']['kwargs']['cv_id']
        await self.accept()

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            await self.send_error("La clé GROQ_API_KEY est introuvable dans le .env. Ajoutez-la puis redémarrez le backend.")
            return

        cv_obj = await self.get_cv(self.cv_id)
        if not cv_obj or not cv_obj.extracted_text:
            await self.send_error("CV introuvable ou vide. Analysez d'abord un CV.")
            return

        self.client = Groq(api_key=api_key)
        self.extracted_text = cv_obj.extracted_text
        self.cv_obj = cv_obj
        self.question_count = 1
        self.history = []  # historique de la conversation (gardé pendant toute la connexion)
        self.finished = False  # passe à True quand l'entretien est terminé

        # Message d'accueil personnalisé selon le CV
        instruction = (
            "Salue le candidat avec enthousiasme et professionnalisme. "
            "Pose une première question brève pour briser la glace sur son parcours "
            "ou une techno clé du CV."
        )
        response_text = await self.ask_ai(instruction)
        await self.send_speech(response_text)

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_text = data.get('text', '').strip()

        # Entretien terminé : on ignore tout message supplémentaire.
        if self.finished:
            return

        # Si rien n'a été compris (transcription vide), on ne compte pas ce tour.
        if not user_text:
            await self.send_speech("Je n'ai pas bien entendu, pouvez-vous répéter ?")
            return

        self.question_count += 1
        is_final = self.question_count > 5
        if is_final:
            self.finished = True

        if self.question_count <= 5:
            # Entretien dynamique : rebond et nouvelle question
            instruction = (
                f"PROGRESSION : question {self.question_count}/5.\n"
                "INSTRUCTIONS :\n"
                "1. Rebondis sur un élément technique que le candidat vient de dire.\n"
                "2. Enchaîne sur une question concernant une AUTRE compétence du CV (sois précis).\n"
                "3. Ne repose JAMAIS une question déjà posée dans la conversation.\n"
                "4. Si la réponse était trop courte, demande une précision sur un projet.\n"
                "5. Garde un ton de recruteur expert (max 30 mots)."
            )
        else:
            # Fin de l'entretien
            instruction = (
                "C'est la fin de l'entretien. Fais une conclusion chaleureuse, "
                "remercie le candidat et dis-lui que l'équipe reviendra vers lui prochainement. "
                "Pas de question."
            )

        response_text = await self.ask_ai(instruction, user_text)
        await self.send_speech(response_text, is_final=is_final)

        if is_final:
            await self.send_report()

    async def send_error(self, message):
        """Envoie un message d'erreur lisible au frontend, puis ferme la connexion."""
        await self.send(text_data=json.dumps({'type': 'error', 'message': message}))
        await self.close()

    async def send_report(self):
        """Génère le rapport final (score + analyse) à partir de toute la conversation."""
        transcript = "\n".join(
            f"{'Recruteur' if m['role'] == 'assistant' else 'Candidat'} : {m['content']}"
            for m in self.history
            if m['content'] != "(début de l'entretien)"
        )

        prompt = (
            "Voici la transcription complète d'un entretien technique d'entraînement.\n\n"
            f"{transcript}\n\n"
            "Évalue honnêtement le CANDIDAT, uniquement d'après ses réponses ci-dessus "
            "(réponses courtes ou vagues = score plus bas). "
            "Réponds UNIQUEMENT en JSON, en français, avec exactement ces clés :\n"
            "{\n"
            '  "score": (entier entre 0 et 100),\n'
            '  "resume": "2 à 3 phrases sur la performance globale",\n'
            '  "points_forts": ["...", "..."],\n'
            '  "points_a_ameliorer": ["...", "..."],\n'
            '  "conseils": ["...", "..."]\n'
            "}"
        )

        try:
            completion = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Tu es un coach en recrutement technique, précis et honnête."},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            report = json.loads(completion.choices[0].message.content)
            report["score"] = max(0, min(100, int(report.get("score", 0))))
            try:
                await self.save_report_db(report)
            except Exception as e:
                print(f"Erreur sauvegarde rapport: {e}")
            await self.send(text_data=json.dumps({'type': 'report', 'report': report}))
        except Exception as e:
            print(f"Erreur rapport: {e}")
            await self.send(text_data=json.dumps({'type': 'report', 'report': None}))

    async def ask_ai(self, instruction, user_text=""):
        system_instruction = (
            "Tu es Alex, recruteur tech senior chez CareerPilot. "
            "TON PERSONNAGE : Tu es percutant, pro et bienveillant. "
            "RÈGLES STRICTES :\n"
            "- NE DIS JAMAIS 'C'est noté' ou 'Très bien'. Utilise des transitions naturelles "
            "(ex: 'C'est un point intéressant...', 'D'accord, et par rapport à...').\n"
            "- Si l'utilisateur bafouille ou fait une erreur de micro ('la Ravel'), "
            "interprète cela comme 'Laravel'.\n"
            "- Ne fais pas de listes. Fais des phrases fluides pour l'oral.\n"
            "- Limite tes réponses à 25-30 mots maximum.\n\n"
            f"CV DU CANDIDAT :\n{self.extracted_text[:6000]}"
        )

        # Message courant : la réponse du candidat + les consignes pour ce tour
        if user_text:
            current = f"Réponse du candidat : « {user_text} »\n\n{instruction}"
        else:
            current = instruction

        messages = [{"role": "system", "content": system_instruction}]
        messages.extend(self.history[-8:])  # les 4 derniers échanges
        messages.append({"role": "user", "content": current})

        try:
            # Le client Groq est synchrone : on le lance dans un thread
            # pour ne pas bloquer le WebSocket.
            kwargs = {}
            if "gpt-oss" in GROQ_MODEL:
                # Moins de "réflexion" avant de répondre = réponse beaucoup plus rapide.
                kwargs["extra_body"] = {"reasoning_effort": "low"}

            completion = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.7,
                **kwargs,
            )
            answer = completion.choices[0].message.content

            # On mémorise l'échange pour que l'IA ne répète pas ses questions.
            self.history.append({"role": "user", "content": user_text or "(début de l'entretien)"})
            self.history.append({"role": "assistant", "content": answer})
            return answer
        except Exception as e:
            print(f"Erreur Groq: {e}")
            index = min(self.question_count - 1, len(FALLBACK_QUESTIONS) - 1)
            return FALLBACK_QUESTIONS[index]

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
            await self.send(text_data=json.dumps({'text': text, 'audio': None, 'end_of_turn': not is_final}))

    @database_sync_to_async
    def save_report_db(self, report):
        InterviewReport.objects.create(
            cv=self.cv_obj,
            score=report["score"],
            report=report,
        )

    @database_sync_to_async
    def get_cv(self, cv_id):
        return CV.objects.filter(id=cv_id).first()

    async def disconnect(self, close_code):
        print(f"WebSocket déconnecté : {close_code}")