import json

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.authtoken.models import Token


def _parse_body(request):
    try:
        return json.loads(request.body.decode("utf-8"))
    except Exception:
        return {}


@csrf_exempt
def check_email(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    data = _parse_body(request)
    email = (data.get("email") or "").strip().lower()

    if not email:
        return JsonResponse({"detail": "Email requis"}, status=400)

    exists = User.objects.filter(email__iexact=email).exists()

    if exists:
        return JsonResponse({"detail": "Cet email est déjà utilisé"}, status=400)

    return JsonResponse({
        "message": "Email disponible",
        "available": True
    }, status=200)


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    data = _parse_body(request)

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not full_name:
        return JsonResponse({"detail": "Le nom complet est requis"}, status=400)

    if not email:
        return JsonResponse({"detail": "L'email est requis"}, status=400)

    if not password:
        return JsonResponse({"detail": "Le mot de passe est requis"}, status=400)

    if len(password) < 8:
        return JsonResponse(
            {"detail": "Le mot de passe doit contenir au moins 8 caractères"},
            status=400
        )

    if User.objects.filter(username=email).exists() or User.objects.filter(email__iexact=email).exists():
        return JsonResponse({"detail": "Cet email est déjà utilisé"}, status=400)

    name_parts = full_name.split()
    first_name = name_parts[0] if name_parts else ""
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    token, _ = Token.objects.get_or_create(user=user)

    return JsonResponse({
        "message": "Compte créé avec succès",
        "token": token.key,
        "user": {
            "id": user.id,
            "full_name": full_name,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }, status=201)


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    data = _parse_body(request)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email:
        return JsonResponse({"detail": "L'email est requis"}, status=400)

    if not password:
        return JsonResponse({"detail": "Le mot de passe est requis"}, status=400)

    # Authenticate by email (do not rely on username==email)
    # because Django's authenticate() uses the username field.
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        user = None


    if user is None or not user.check_password(password):
        return JsonResponse({"detail": "Identifiants incorrects"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)


    full_name = f"{user.first_name} {user.last_name}".strip() or user.username

    return JsonResponse({
        "message": "Connexion réussie",
        "token": token.key,
        "user": {
            "id": user.id,
            "full_name": full_name,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }, status=200)
