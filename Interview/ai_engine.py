import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_ai_response(cv_text, history, user_input):
    # Sécurité si le texte est vide
    if not cv_text or len(cv_text) < 50:
        return "Je suis désolé, mais le système n'a pas réussi à lire votre CV. Veuillez vérifier le fichier et recommencer l'upload."

    system_prompt = f"""
    Tu es un recruteur technique. Tu mènes un entretien basé UNIQUEMENT sur ce CV :
    ---
    {cv_text}
    ---
    CONSIGNES :
    1. Pose une question technique précise sur une compétence ou un projet du CV.
    2. Ne sois pas trop poli, va droit au but technique.
    3. Si c'est le début, analyse le CV et lance la première question.
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history[-4:]) 
    messages.append({"role": "user", "content": user_input})

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.1, 
        max_tokens=200
    )
    return completion.choices[0].message.content