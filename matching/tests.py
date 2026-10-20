import os
import json
from unittest.mock import patch, MagicMock
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from cv_analysis.models import CV
from matching.models import JobMatch


def create_user(email="test@example.com", password="motdepasse123"):
    user = User.objects.create_user(username=email, email=email, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return user, token

def auth_header(token):
    return {"HTTP_AUTHORIZATION": f"Token {token.key}"}


class MatchingTests(APITestCase):

    def test_matching_sans_cv_id_renvoie_400(self):
        _, token = create_user(email="match1@example.com")
        response = self.client.post(
            "/api/matching/analyze/",
            data=json.dumps({"job_description": "Développeur Python senior"}),
            content_type="application/json",
            **auth_header(token),
        )
        self.assertEqual(response.status_code, 400)

    @patch.dict(os.environ, {"GROQ_API_KEY": "test-key"})
    @patch("matching.views.Groq")
    def test_matching_groq_simule_renvoie_200(self, mock_groq):
        fake_response = MagicMock()
        fake_response.choices[0].message.content = json.dumps({
            "score": 82,
            "matching": ["Python", "Django"],
            "missing": ["Docker"],
            "advice": "Ajouter Docker."
        })
        mock_groq.return_value.chat.completions.create.return_value = fake_response

        user, token = create_user(email="match2@example.com")
        cv = CV.objects.create(
            user=user,
            file_name="cv_match.pdf",
            extracted_text="Développeur Python Django 3 ans.",
            ats_score=75,
        )

        response = self.client.post(
            "/api/matching/analyze/",
            data=json.dumps({
                "cv_id": cv.id,
                "job_description": "Développeur Python senior avec Docker",
            }),
            content_type="application/json",
            **auth_header(token),
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(JobMatch.objects.filter(cv=cv).exists())


class SecuriteTests(APITestCase):

    def test_user_ne_peut_pas_lire_analyse_dun_autre(self):
        user_a, _ = create_user(email="userA@example.com")
        cv_a = CV.objects.create(
            user=user_a,
            file_name="cv_a.pdf",
            extracted_text="CV de A",
            ats_score=60,
        )
        _, token_b = create_user(email="userB@example.com")
        response = self.client.get(
            f"/api/cv/analysis/{cv_a.id}",
            **auth_header(token_b),
        )
        self.assertEqual(response.status_code, 404)

    @patch.dict(os.environ, {"GROQ_API_KEY": "test-key"})
    @patch("matching.views.Groq")
    def test_matching_cv_dun_autre_renvoie_404(self, mock_groq):
        user_a, _ = create_user(email="secA@example.com")
        cv_a = CV.objects.create(
            user=user_a,
            file_name="cv_secA.pdf",
            extracted_text="CV de A",
            ats_score=60,
        )
        _, token_b = create_user(email="secB@example.com")
        response = self.client.post(
            "/api/matching/analyze/",
            data=json.dumps({
                "cv_id": cv_a.id,
                "job_description": "Développeur senior",
            }),
            content_type="application/json",
            **auth_header(token_b),
        )
        self.assertEqual(response.status_code, 404)