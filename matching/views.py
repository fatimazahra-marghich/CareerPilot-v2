import os
import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from groq import Groq
from cv_analysis.models import CV
from .models import JobMatch

GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def analyze_job_match(request):
    try:
        data = json.loads(request.body)
        cv_id = data.get('cv_id')
        job_description = data.get('job_description')

        # 0. Vérifier les données envoyées par le frontend
        if not cv_id:
            return JsonResponse({'error': 'cv_id manquant dans la requête.'}, status=400)
        if not job_description:
            return JsonResponse({'error': "job_description manquante dans la requête."}, status=400)

        # 1. Vérifier la clé API
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return JsonResponse({'error': 'La clé GROQ_API_KEY est introuvable dans le .env'}, status=500)

        # 2. Récupérer le CV en vérifiant qu'il appartient à l'utilisateur connecté
        try:
            cv_obj = CV.objects.get(id=cv_id, user=request.user)
        except CV.DoesNotExist:
            return JsonResponse({'error': "CV introuvable."}, status=404)

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
            model=GROQ_MODEL,
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
        print(f"DEBUG ERROR: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)