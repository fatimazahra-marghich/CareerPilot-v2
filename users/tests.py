import json
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token


def create_user(email="test@example.com", password="motdepasse123", full_name="Test User"):
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=full_name.split()[0],
        last_name=" ".join(full_name.split()[1:]),
    )
    token, _ = Token.objects.get_or_create(user=user)
    return user, token


class CheckEmailTests(APITestCase):

    def test_email_disponible_renvoie_200(self):
        response = self.client.post(
            "/api/auth/check-email",
            data=json.dumps({"email": "nouveau@example.com"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["available"])

    def test_email_deja_utilise_renvoie_400(self):
        create_user(email="pris@example.com")
        response = self.client.post(
            "/api/auth/check-email",
            data=json.dumps({"email": "pris@example.com"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class RegisterTests(APITestCase):

    def test_inscription_reussie_renvoie_201(self):
        response = self.client.post(
            "/api/auth/register",
            data=json.dumps({
                "full_name": "Yassine Benali",
                "email": "yassine@example.com",
                "password": "motdepasse123",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("token", response.json())

    def test_mot_de_passe_trop_court_renvoie_400(self):
        response = self.client.post(
            "/api/auth/register",
            data=json.dumps({
                "full_name": "Yassine Benali",
                "email": "yassine2@example.com",
                "password": "123",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class LoginTests(APITestCase):

    def setUp(self):
        create_user(email="login@example.com", password="motdepasse123")

    def test_connexion_reussie_renvoie_200(self):
        response = self.client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": "login@example.com",
                "password": "motdepasse123",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.json())

    def test_mauvais_mot_de_passe_renvoie_401(self):
        response = self.client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": "login@example.com",
                "password": "mauvaismdp",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
