from django.urls import path
from .views import check_email, register_user, login_user

urlpatterns = [
    path("check-email", check_email, name="check_email"),
    path("register", register_user, name="register_user"),
    path("login", login_user, name="login_user"),
]