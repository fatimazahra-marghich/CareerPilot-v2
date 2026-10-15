import os
import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
from groq import Groq
from cv_analysis.models import CV
from .models import JobMatch

@api_view(['POST'])
def analyze_job_match(request):
    try:
        data = json.loads(request.body)
        # On essaie de récupérer l'ID du CV, sinon 18
        cv_id = data.get('cv_id') or '18'
        job_description = data.get('job_description')

        # 1. Vérifier la clé API
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return JsonResponse({'error': 'La clé GROQ_API_KEY est introuvable dans le .env'}, status=500)

        # 2. Récupérer le CV
        try:
            cv_obj = CV.objects.get(id=cv_id)
        except CV.DoesNotExist:
            return JsonResponse({'error': f'Le CV avec l\'ID {cv_id} n\'existe pas dans la base.'}, status=404)

        # 3. Appel Groq
        client = Groq(api_key=api_key)
        
        prompt = f"""
        Analyse ce CV par rapport à l'offre d'emploi.
        CV : {cv_obj.extracted_text}
        OFFRE : {job_description}

        Réponds UNIQUEMENT en JSON :
        {{
            "score": (entier entre 0 et 100),
            "matching": ["compétence1", "compétence2"],
            "missing": ["compétenceA", "compétenceB"],
            "advice": "ton conseil ici"
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        result_ia = json.loads(completion.choices[0].message.content)

        # 4. Sauvegarder
        JobMatch.objects.create(
            cv=cv_obj,
            job_description=job_description,
            score=result_ia['score'],
            matching_skills=result_ia['matching'],
            missing_skills=result_ia['missing'],
            advice=result_ia['advice']
        )

        return JsonResponse(result_ia)

    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}") # Vérifie ton terminal Django
        return JsonResponse({'error': str(e)}, status=500)