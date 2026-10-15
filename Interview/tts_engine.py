import os
import base64
import requests

class TTSEngine:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = "21m00Tcm4TlvDq8ikWAM" # ID d'une voix masculine pro

    async def speak(self, text):
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        headers = {"xi-api-key": self.api_key, "Content-Type": "application/json"}
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
        }
        
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            audio_b64 = base64.b64encode(response.content).decode('utf-8')
            return {"audio_base64": audio_b64}
        return {"audio_base64": None}

tts_engine = TTSEngine()