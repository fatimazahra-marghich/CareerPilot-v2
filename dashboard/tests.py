from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from cv_analysis.models import CV
from Interview.models import InterviewReport


def create_user(email="test@example.com", password="motdepasse123"):
    user = User.objects.create_user(username=email, email=email, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return user, token

def auth_header(token):
    return {"HTTP_AUTHORIZATION": f"Token {token.key}"}


class DashboardInterviewsTests(APITestCase):

    def test_dashboard_renvoie_uniquement_rapports_du_user_connecte(self):
        user_a, token_a = create_user(email="dashA@example.com")
        user_b, token_b = create_user(email="dashB@example.com")

        cv_a = CV.objects.create(user=user_a, file_name="cv.pdf", extracted_text="CV A", ats_score=70)
        cv_b = CV.objects.create(user=user_b, file_name="cv.pdf", extracted_text="CV B", ats_score=65)

        InterviewReport.objects.create(cv=cv_a, score=80, report="Rapport A")
        InterviewReport.objects.create(cv=cv_b, score=75, report="Rapport B")

        response = self.client.get(
            "/api/dashboard/interviews",
            **auth_header(token_a),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["score"], 80)
