import os
import json
from unittest.mock import patch, MagicMock
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from cv_analysis.models import CV, CVAnalysisResult


def create_user(email="test@example.com", password="motdepasse123"):
    user = User.objects.create_user(username=email, email=email, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return user, token

def auth_header(token):
    return {"HTTP_AUTHORIZATION": f"Token {token.key}"}


class UploadAnalyzeTests(APITestCase):

    def test_upload_sans_token_renvoie_401(self):
        response = self.client.post("/api/cv/upload-analyze")
        self.assertEqual(response.status_code, 401)

    def test_upload_sans_fichier_renvoie_400(self):
        _, token = create_user(email="upload1@example.com")
        response = self.client.post(
            "/api/cv/upload-analyze",
            **auth_header(token),
        )
        self.assertEqual(response.status_code, 400)

    def test_upload_mauvais_format_renvoie_400(self):
        _, token = create_user(email="upload2@example.com")
        fichier_txt = SimpleUploadedFile(
            "cv.txt", b"Contenu texte", content_type="text/plain"
        )
        response = self.client.post(
            "/api/cv/upload-analyze",
            {"file": fichier_txt},
            **auth_header(token),
        )
        self.assertEqual(response.status_code, 400)


class CVAnalyseGroqSimuleTests(APITestCase):

    @patch.dict(os.environ, {"GROQ_API_KEY": "test-key"})
    @patch("cv_analysis.utils.Groq")
    def test_analyse_cv_avec_groq_simule(self, mock_groq):
        fake_content = MagicMock()
        fake_content.choices[0].message.content = json.dumps({
            "technical_skills": ["Python", "Django"],
            "soft_skills": ["Travail en équipe"],
            "tips": ["Ajouter des projets concrets"],
            "overall_feedback": "Bon CV"
        })
        mock_groq.return_value.chat.completions.create.return_value = fake_content

        user, token = create_user(email="analyse@example.com")

        # Créer le CV
        cv = CV.objects.create(
            user=user,
            file_name="cv_test.pdf",
            extracted_text="Ingénieur Python avec 3 ans d'expérience Django.",
            ats_score=70,
        )

        # Créer le CVAnalysisResult lié au CV
        CVAnalysisResult.objects.create(
            cv=cv,
            tech_relevance=80,
            experience_score=75,
            education_score=70,
            structure_score=85,
            technical_skills=["Python", "Django"],
            soft_skills=["Travail en équipe"],
            tips=["Ajouter des projets concrets"],
        )

        response = self.client.get(
            f"/api/cv/analysis/{cv.id}",
            **auth_header(token),
        )
        self.assertIn(response.status_code, [200, 201])