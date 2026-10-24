from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import InterviewSession

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_cvs(request):
    try:
        # Récupère les sessions de l'utilisateur qui ont un texte de CV
        sessions = InterviewSession.objects.filter(user=request.user).exclude(cv_text="").order_by('-created_at')
        
        data = [
            {
                "id": s.session_id,
                "name": f"Analyse du {s.created_at.strftime('%d/%m/%Y à %H:%M')}"
            } 
            for s in sessions
        ]
        return Response(data, status=200) # Force le format JSON
    except Exception as e:
        return Response({"error": str(e)}, status=500)