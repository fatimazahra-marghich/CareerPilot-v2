from django.urls import path
from .views import user_profile, user_settings, export_user_data, delete_user_account

urlpatterns = [
    path("profile", user_profile, name="user_profile"),
    path("settings", user_settings, name="user_settings"),
    path("export-data", export_user_data, name="export_user_data"),
    path("delete-account", delete_user_account, name="delete_user_account"),
]