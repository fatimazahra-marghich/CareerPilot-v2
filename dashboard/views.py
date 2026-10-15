from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile


@api_view(["GET", "PUT"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "full_name": request.user.get_full_name() or request.user.username,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "phone": profile.phone or "",
            "location": profile.location or "",
        }, status=status.HTTP_200_OK)

    full_name = request.data.get("full_name", "").strip()
    phone = request.data.get("phone", "").strip()
    location = request.data.get("location", "").strip()

    if full_name:
        parts = full_name.split(" ", 1)
    request.user.first_name = parts[0]
    request.user.last_name = parts[1] if len(parts) > 1 else ""

    profile.phone = phone
    profile.location = location

    request.user.save()
    profile.save()

    return Response({
        "message": "Profil mis à jour avec succès",
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "full_name": request.user.get_full_name() or request.user.username,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "phone": profile.phone or "",
            "location": profile.location or "",
        }
    }, status=status.HTTP_200_OK)

@api_view(["GET", "PUT"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_settings(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return Response({
            "email_notifications": profile.email_notifications,
            "language": profile.language,
            "dark_mode": profile.dark_mode,
            "analytics_anonymous": profile.analytics_anonymous,
        })

    profile.email_notifications = request.data.get("email_notifications", profile.email_notifications)
    profile.language = request.data.get("language", profile.language)
    profile.dark_mode = request.data.get("dark_mode", profile.dark_mode)
    profile.analytics_anonymous = request.data.get("analytics_anonymous", profile.analytics_anonymous)
    profile.save()

    return Response({"message": "Paramètres sauvegardés avec succès"})


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def export_user_data(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    return Response({
        "user": {
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
        },
        "profile": {
            "phone": profile.phone,
            "location": profile.location,
            "email_notifications": profile.email_notifications,
            "language": profile.language,
            "dark_mode": profile.dark_mode,
            "analytics_anonymous": profile.analytics_anonymous,
        }
    })


@api_view(["DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_user_account(request):
    user = request.user
    user.delete()
    return Response({"message": "Compte supprimé avec succès"})
